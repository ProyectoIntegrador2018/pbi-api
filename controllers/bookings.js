var moment = require('moment-timezone');
const Booking = require("../models/booking");
const Nutritionist = require("../models/nutritionist");
const axios = require("axios")
const jwt = require("jsonwebtoken")

const { CLIENT_ID, CLIENT_SECRET } = process.env 
const {SECRET} = require('../config');

let redirect_uri = process.env.NODE_ENV == "production" ? "https://pbi-mty.netlify.app/oauthCallback" : "http://localhost:8080/oauthCallback"

async function refreshToken(refresh_token) {
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token
    })
    // console.log(data);
    return data.access_token
}

const getNutris = async function (req, res) {
    let nutris = await Nutritionist.find()

    let nutrisClean = nutris.map(x => ({ name: x.name + " " + x.surname, nomina: x.nomina }))
    console.log("nutris:", nutrisClean)
    return res.send(nutrisClean)
}

// GOOGLE CALENDAR SECTION
const setCalendarToken = async function (req, res) {
    try {
        let calendarToken = req.body.calendarToken;
        let nutriID = req.id

        if (!calendarToken) {
            return res.status(401).send({ error: "No se envió token de autenticación para Google Calendar"})
        }
        
        try {
            const { data: tokenData } = await axios.post("https://oauth2.googleapis.com/token", {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: calendarToken,
                grant_type: "authorization_code",
                redirect_uri
            })

            if (!tokenData.refresh_token) {
                console.log(tokenData)
                return res.status(401).send({ error: "Hubo un error al obtener el código de autenticación" })
            }

            await Nutritionist.updateOne({_id: nutriID}, { $set: { calendarToken: tokenData.refresh_token }})

            // Check if user already has nutri-tec  calendar, if not, add it
            let { data: calendars} = await axios.get("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
                headers: {
                    Authorization: "Bearer " + await refreshToken(tokenData.refresh_token)
                }
            })

            if (!calendars.items.includes(c => c.summary == "nutri-tec")) {
                const { data: newCalendar } = await axios.post("https://www.googleapis.com/calendar/v3/calendars", {
                    summary: "nutri-tec"
                },
                {
                    headers: {
                        Authorization: "Bearer " + await refreshToken(tokenData.refresh_token)
                    }
                })
                console.log(newCalendar)
                await Nutritionist.updateOne({ _id: nutriID }, { $set: { calendarID: newCalendar.id }})
            }

        } catch (e) {
            if (e.response) {
                console.log(e.response.data)
            }
            else console.log(e)
            return res.status(401).send({ error: "El código de autenticación de OAuth no es válido" })
        }
    } catch (e) {
        console.log(e);
    }
}

const getBookingTimes = async function (req, res) {
    var nomina = req.query.nomina;
    
    if (!nomina) {
        return res.status(401).send({ error: "No se mandó nómina" });
    }

    var re = /^((L)[0-9]{8})/;
    if (!re.test(nomina)) {
        return res.status(401).send({ error: "La nómina no es valida" })
    }

    var nutri = await Nutritionist.findOne({ nomina: nomina }, { bookingTimes: 1, name: 1, surname: 1 });
    if (!nutri.bookingTimes) {
        return res.status(401).send({ error: "La cuenta no tiene agregados tiempos disponibles" })
    } else {
        return res.status(200).send({ bookingTimes: nutri.bookingTimes, nutriName: nutri.name + " " + nutri.surname })
    }
}

const setBookingTimes = async function (req, res) {
    var newTimes = req.body.bookingTimes;
    if (!newTimes) {
        return res.status(401).send({ error: "No se mandaron nuevos tiempos" })
    }
    await Nutritionist.updateOne({ _id: req.id }, { bookingTimes: newTimes });
    return res.status(200).send("Times updated")
}

const getBookings = async function (req, res) {
    if (!req.query.week) {
        return res.status(401).send({ error: "La información es incompleta" })
    }
    let dates = moment(req.query.week);

    if (!dates.isValid()) {
        return res.status(401).send({ error: "La fecha no es correcta" })
    }

    if (!req.query.nomina) {
        return res.status(401).send({ error: "No se mandó código de nutriólogo" })
    }
    let nutri = await Nutritionist.findOne({nomina: new RegExp(req.query.nomina) });
    if (!nutri) {
        return res.status(401).send({ error: "No existe nutrióloga con esa nómina" })
    }

    let weekStart = dates.startOf("week").format(), weekEnd = dates.endOf("week").format();

    try {
        // Obtain free/busy bookings from calendar
        let { data: bookings} = await axios.post("https://www.googleapis.com/calendar/v3/freeBusy", {
            timeMin: weekStart,
            timeMax: weekEnd,
            timeZone: "America/Monterrey",
            items: [{
                id: nutri.calendarID
            }]
        }, {
            headers: {
                Authorization: "Bearer " + await refreshToken(nutri.calendarToken)
            }
        })

        if (!bookings.calendars.hasOwnProperty(nutri.calendarID)) {
            return res.status(401).send({ error: "No existe calendario para la nutrióloga" })
        } 
        let bookingsFinal = bookings.calendars[nutri.calendarID].busy;

        return res.status(200).send(bookingsFinal)
    } catch (e) {
        console.log(e)
    }

}

const addBooking = async function (req, res) {
        /* TODO LIST:
        * Verify that nutri has access token
        * Get new access token from refresh token
        * Add event to calendar with patient email
        */
        let nutriNomina = req.body.nomina
        if (!nutriNomina) {
            return res.status(401).send({ error: "No existe nutrióloga con esa nómina" })
        }
        let booking = req.body.booking;


        if (!booking) {
            return res.status(401).send({ error: "No se mandó información de nueva cita" })
        }
        let nutri = await Nutritionist.findOne({nomina: new RegExp(nutriNomina) });
        if (!nutri) {
            return res.status(401).send({ error: "No existe nutrióloga con esa nómina" })
        }

        if (!nutri.calendarToken || !nutri.calendarID) {
            return res.status(401).send({ error: "La nutrióloga no ha agregado calendario. Comunicarse directamente con ella" })
        }

        let newToken = await refreshToken(nutri.calendarToken)

    try {
        if (!booking.startTime) {
            return res.status(401).send({ error: "Las fechas no son correctas" })
        }
        console.log(`Creating booking at ${booking.startTime}`)
        await axios.post(`https://www.googleapis.com/calendar/v3/calendars/${nutri.calendarID}/events`, {
            end: {
                dateTime: moment(booking.startTime).add(30, "minutes").toDate(),
                timezone: "America/Monterrey"
            },
            start: {
                dateTime: moment(booking.startTime).toDate(),
                timezone: "America/Monterrey"
            },
            attendees: [
                {
                    "email": booking.patientMail,
                    responseStatus: "needsAction"
                }
            ],
            summary: `Cita con ${booking.patientName}`,
            status: "tentative",
            guestsCanInviteOthers: false,
            transparency: "opaque",
            description: 
`¡Hola! ¿Como estas?

Te explico lo que vamos a necesitar para la consulta:

Bascula y/o cinta de medir.
Cuaderno para anotaciones.
Zoom: se envía el día de la consulta al correo.
Ser muy puntual, ya que las consultas tiene una duración de 30 minutos.
En caso de tener que cancelar la consulta, favor de avisar lo antes posible.

Por el momento, las consultas en linea no tienen un costo.


¡Muchas gracias por la confianza!`
        }, {
            params: {
                sendNotifications: true,
                sendUpdates: "all"
            },
            headers: {
                Authorization: "Bearer "+ newToken
            }
        })
        return res.sendStatus(200)
    } catch (e) {
        console.log(e.response.data);
        return res.status(401).send({ error: "No se pudo guardar la cita"})

    }
}

module.exports = {
    getBookingTimes,
    setBookingTimes,
    addBooking,
    getBookings,
    // getBookingNut,
    setCalendarToken,
    getNutris
}