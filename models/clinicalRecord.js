const mongoose = require('mongoose');
const validator = require('validator');

const clinicalRecordSchema = new mongoose.Schema({
    insuranceCompany: {
        type: String,
        required: true,
    },
    insuranceNumber: {
        type: String,
        required: true
    },
    medicalInstitution: {
        type: String
    },
    referenceName: {
        type: String
    },
    referenceNumber: {
        type: Number
    },
    referenceRelation: {
        type: String
    },
    illness: {
        type: [String]
    },
    injuries: {
        type: String
    },
    prescription: {
        type: String
    },
    prescriptionDetails: {
        type: String
    },
    pysicalCondition: {
        type: String
    },
    userOwner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

const ClinicalRecord = mongoose.model('ClinicalRecord', clinicalRecordSchema)
module.exports = ClinicalRecord