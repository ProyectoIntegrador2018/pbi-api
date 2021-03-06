const express = require('express')
const router = express.Router()
const cors = require('cors')
const auth = require("./middleware/auth.js")

// Importar modelos
const users = require('./controllers/users.js')
const terms = require('./controllers/terms.js')
const classes = require('./controllers/classes.js')
const lockers = require('./controllers/lockers.js')
const professors = require('./controllers/professors.js')
const records = require('./controllers/records.js')
const nutritionists = require('./controllers/nutritionists.js')
const appointment = require('./controllers/appointments.js')
const accounts = require('./controllers/accounts.js')
const bookings = require("./controllers/bookings")
const excel = require('./controllers/excelManipulation.js');

router.all('*', cors())

router.post('/login', accounts.login)
router.post('/logout', auth.auth, accounts.logout)

router.get('/accounts', accounts.getAccounts)
router.get('/accounts/:id', accounts.getAccount)
router.post('/accounts', accounts.createAccount)
router.put('/accounts/', auth.auth, accounts.updateAccount)
router.put('/accounts/status/admin/:id', auth.authAdmin, accounts.switchAdmin)
router.put('/accounts/status/nutritionist/:id', auth.authAdmin, accounts.switchNutritionist)
router.put('/accounts/status/professor/:id', auth.authAdmin, accounts.switchProfessor)

// Rutas PBI
router.post('/terms', auth.authAdmin, terms.createTerm)
router.get('/terms/classes/:id', terms.getTermClasses)
router.get('/terms/current', terms.getCurrentTerm)
router.put('/terms/current/:id', auth.authAdmin, terms.setCurrentTerm)
router.get('/terms/:id', terms.getTermByID)
router.get('/terms', terms.getTerms)
router.delete('/terms/:id', auth.authAdmin, terms.deleteTerm)
router.put('/terms/classes/:id', auth.authAdmin, terms.deleteTermClasses)
router.put('/terms/:id', auth.authAdmin, terms.updateTerm)
router.get('/terms/status/:id/:dateOfLockers', terms.statusFlag)

router.get('/classes/user', auth.authUser, classes.getUserClasses)
router.post('/classes/:id', auth.authAdmin, classes.createClass)
router.put('/classes/:id', auth.authAdmin, classes.updateClass)
router.post('/classesMass/:id', auth.authAdmin, classes.createClasses)
router.get('/classes/', classes.getClasses)
router.get('/classes/:id', classes.getClassByID)
router.delete('/classes/:id', auth.authAdmin, classes.deleteClass)
// router.put('/classes/attendance/add/:id', classes.addAttendance)
// router.put('/classes/attendance/mark/:id', classes.markAttendance)
router.put('/classes/enroll/:id', auth.authAdmin, classes.enrollUser)
router.put('/classes/enrollPayroll/user/:id', auth.authUser, classes.enrollUser)
router.put('/classes/enrollPayroll/:id', auth.authAdmin, classes.enrollByPayroll)
router.put('/classes/disenroll/user/:id', auth.authUser, classes.disenrollUser)
router.put('/classes/disenroll/:id', auth.authAdmin, classes.disenrollUserByAdmin)

router.put('/users', auth.authUser, users.updateUser)
router.put('/users/medicalRecord', auth.authUser, users.fillMedicalRecord)
router.put('/admin/users/medicalRecord/:id', auth.authAdmin, users.fillMedicalRecordAdmin)
router.put('/admin/users/:id', auth.authAdmin, users.updateUserByAdmin)
router.delete('/users/:id', auth.authAdmin, users.deleteUser)
router.get('/users/attendance/:id', auth.authUser, users.getAttendance)
router.get('/users', auth.authAdmin, users.getUsers)
router.put('/user', auth.authUser, users.updateUser)
router.get('/users/:id', auth.authAdmin, users.getUser)

router.post('/lockers', auth.authAdmin, lockers.createLocker)
router.get('/lockers', lockers.getLockers)
router.get('/lockers/search/', lockers.getLockerBySpecs)
router.get('/lockers/locker/:id', lockers.getCabin)
router.get('/lockers/:id', lockers.getLockerByID)
router.put('/lockers/assign/admin/:id', auth.authAdmin, lockers.assignCabin)
router.put('/lockers/assign/:id', auth.authUser, lockers.assignLocker)
router.put('/lockers/unassign/:id', auth.authUser, lockers.unassignLocker)
router.put('/lockers/status/:id', auth.authAdmin, lockers.switchStatus)
router.put('/lockers/cost/:id', lockers.changeCost)
router.put('/lockers/add/:id', lockers.addCabins)
router.put('/lockers/remove/:id', lockers.removeCabins)
router.put('/lockers/empty/:id', auth.authAdmin, lockers.emptyLocker)
router.delete('/lockers/:id', auth.authAdmin, lockers.deleteLocker)

router.post('/professors', auth.authAdmin, professors.createProfessor)
router.get('/professors', professors.getProfessors)
router.get('/professors/:id', professors.getProfessor)
router.put('/professors/:id', professors.updateProfessor)
router.delete('/professors/:id', professors.deleteProfessor)

router.post('/confirm', users.userConfirm)
router.post('/confirm/retry', users.resendConfirm)
router.post('/requestreset', accounts.requestResetPassword)
router.post('/resetpassword', accounts.resetPassword)
router.get('/resetpassword', accounts.getUserOnResetP)
router.get('/validate', accounts.validateSession)
router.get('/user', auth.authUser, function (req, res) {
  res.send(req.user)
})

// Rutas Nutricion
router.post('/nutricion/nutritionist', nutritionists.createNutritionist)
router.get('/nutricion/nutritionists', nutritionists.getNutritionists)
router.get('/nutricion/nutritionist/:id', nutritionists.getNutritionist)
router.post('/nutricion/login', nutritionists.login)
router.post('/nutricion/logout', auth.authNutri, nutritionists.logout)
router.delete('/nutricion/nutritionist/:id', nutritionists.deleteNutritionist)
router.get('/nutricion/excel/global', auth.authNutri ,excel.globalIndicators);
router.get('/nutricion/excel/nutri', auth.authNutri, excel.nutrionistIndicators);

router.post('/nutricion/records', auth.authNutri, records.createRecord)
router.post('/nutricion/records/history/:id', records.createRecordHistory)
router.post('/nutricion/record/reminder/:id', records.addReminder)
router.get('/nutricion/records', records.getRecords)
router.get('/nutricion/records/:id', records.getRecord)
router.put('/nutricion/records/:id', records.editRecord)
router.delete('/nutricion/records/:id', records.deleteRecord)
router.post('/nutricion/records/diet/:id', auth.authNutri, records.addDiet);
router.delete('/nutricion/records/diet/:recordId/:dietId', auth.authNutri, records.deleteDiet);
router.put('/nutricion/records/diet/:recordId/:dietId', auth.authNutri, records.editDiet);
router.get('/nutricion/records/diet/:recordId/:dietId', auth.authNutri, records.getDiet);

router.post('/nutricion/appointment/:id', auth.authNutri, appointment.createAppointment)
router.get('/nutricion/appointment/:id', appointment.getAppointment)
router.put('/nutricion/appointments/span', appointment.getAppointmentsSpan)
router.get('/nutricion/appointments/:id', appointment.getAppointments)
router.delete('/nutricion/appointment/:id', appointment.deleteAppointment)
router.put('/nutricion/appointment/:id', appointment.updateAppointment)

router.post('/nutricion/report/:id', nutritionists.report)

router.get("/bookings", bookings.getBookingTimes)
router.get("/bookings/getNutris", bookings.getNutris)
router.post("/bookings/updateAvailBookings", auth.authNutri, bookings.setBookingTimes)
router.post("/bookings/addBooking", bookings.addBooking)
router.get("/bookings/getBookings", bookings.getBookings)
// router.get("/bookings/getBookingsNut", auth.authNutri, bookings.getBookingNut)

router.post("/saveCalendarToken", auth.authNutri, bookings.setCalendarToken)

router.get('*', function(req, res) {
  res.send({
    error: 'This route does not exist'
  })
})

module.exports = router
