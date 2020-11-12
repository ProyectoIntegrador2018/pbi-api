const XlsxPopulate = require('xlsx-populate');
const Appointment = require('../models/appointment');
const Record = require('../models/record');
const Nutrionist = require('../models/nutritionist');
const {
    EXCEL_TEMPLATE,
} = require('../config');

const programs = [
    "PBI",
    "CG",
    "Cortesía",
    "Clase deportiva",
    "Intramuros",
    "Representativos",
    "Ev. Médica",
    "Líderes",
    "Otro",
];

async function getLatestAppointmentsData(nutrionist_id) {
    let pipeline = [
        { $sort: { "date": -1 } },
        { $group: { "_id": "$record", "data": { $first: "$$ROOT" } } },
    ];
    if (nutrionist_id) {
        pipeline.unshift({ $match: { 'nutrionist.id': nutrionist_id } })
    }
    const appointments = await Appointment.aggregate(pipeline);
    return appointments.map(elem => elem.data);
}

async function getWorksheetData(appointments) {
    let data = {
        men: {
            lowImc: 0,
            normalImc: 0,
            highImc: 0,
            veryHighImc: 0,
        },
        women: {
            lowImc: 0,
            normalImc: 0,
            highImc: 0,
            veryHighImc: 0,
        },
    }
    for (appointment of appointments) {
        const record = await Record.findById(appointment.record);
        if (!record) {
            continue;
        }
        const male = record.gender === "Hombre";
        let genderData = male ? data.men : data.women;
        const imc = Number(appointment.IMC);
        if (imc < 18.5) {
            genderData.lowImc += 1;
        } else if (imc < 25.0) {
            genderData.normalImc += 1;
        } else if (imc < 30.0) {
            genderData.highImc += 1;
        } else {
            genderData.veryHighImc += 1;
        }
        if (male) {
            data.men = genderData;
        } else {
            data.women = genderData;
        }
    }

    return data;
}

async function fillExcelTemplate(nutrionist_id) {
    const workbook = await XlsxPopulate.fromFileAsync(__dirname + '/../' + EXCEL_TEMPLATE).catch(_ => null);
    if (!workbook) {
        return null;
    }
    const appointments = await getLatestAppointmentsData(null);
    const worksheetData = await getWorksheetData(appointments);
    const sheet = workbook.sheet("Sheet1");
    const men = worksheetData.men;
    const women = worksheetData.women;
    sheet.cell("C2").value(men.lowImc);
    sheet.cell("D2").value(men.normalImc);
    sheet.cell("E2").value(men.highImc);
    sheet.cell("F2").value(men.veryHighImc);
    sheet.cell("H2").value(women.lowImc);
    sheet.cell("I2").value(women.normalImc);
    sheet.cell("J2").value(women.highImc);
    sheet.cell("K2").value(women.veryHighImc)
    return workbook;
}

async function globalIndicators(_, res) {
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=IndicadoresGlobales.xlsx"
    );
    const workbook = await fillExcelTemplate(null);
    if (!workbook) {
        res.statusMessage = "Error cargando excel muestra";
        return res.status(500).end();
    }

    const output = await workbook.outputAsync().catch(_ => null);
    if (!output) {
        res.statusMessage = "Error generando Excel";
        return res.status(500).end();
    }

    return res.send(output);
}

async function nutrionistIndicators(req, res) {
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=Indicadores_${req.nutritionist.name}.xlsx`
    );
    const workbook = await fillExcelTemplate(req.nutritionist._id);
    if (!workbook) {
        res.statusMessage = "Error cargando excel muestra";
        return res.status(500).end();
    }

    const output = await workbook.outputAsync().catch(_ => null);
    if (!output) {
        res.statusMessage = "Error generando Excel";
        return res.status(500).end();
    }

    return res.send(output);
}

module.exports = {
    globalIndicators,
    nutrionistIndicators,
};