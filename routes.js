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

router.all('*', cors())


router.post('/terms',auth.authAdmin,terms.createTerm)
router.get('/terms/classes/:id',terms.getTermClasses)
router.get('/terms/current', terms.getCurrentTerm)
router.put('/terms/current/:id', auth.authAdmin, terms.setCurrentTerm)
router.get('/terms/:id',terms.getTermByID)
router.get('/terms',terms.getTerms)

router.delete('/terms/:id',auth.authAdmin, terms.deleteTerm)
router.put('/terms/classes/:id',auth.authAdmin, terms.deleteTermClasses)
router.put('/terms/:id',auth.authAdmin,terms.updateTerm)
router.get('/terms/status/:id', terms.statusFlag)

router.get('/classes/user',auth.auth,classes.getUserClasses)

router.post('/classes/:id',auth.authAdmin, classes.createClass)
router.put('/classes/:id',auth.authAdmin, classes.updateClass)
router.post('/classesMass/:id',auth.authAdmin, classes.createClasses)
router.get('/classes/', classes.getClasses)
router.get('/classes/:id', classes.getClassByID)
router.delete('/classes/:id', auth.authAdmin,classes.deleteClass)

router.put('/classes/enroll/:id',auth.authAdmin, classes.enrollUser)
router.put('/classes/enrollPayroll/user/:id', auth.auth,classes.enrollUser)
router.put('/classes/enrollPayroll/:id',auth.authAdmin, classes.enrollByPayroll)
router.put('/classes/disenroll/user/:id', auth.auth,classes.disenrollUser)
router.put('/classes/disenroll/:id',auth.authAdmin, classes.disenrollUserByAdmin)

router.post('/users', users.createUser)
router.put('/users/medicalRecord', auth.auth, users.fillMedicalRecord)
router.put('/admin/users/medicalRecord/:id', auth.authAdmin, users.fillMedicalRecordAdmin)
router.put('/admin/users/:id',auth.authAdmin, users.updateUserByAdmin)
router.delete('/users/:id',auth.authAdmin, users.deleteUser)
router.get('/users/attendance/:id', auth.auth, users.getAttendance)

router.post('/lockers', auth.authAdmin, lockers.createLocker)
router.get('/lockers', lockers.getLockers)
router.get('/lockers/search/', lockers.getLockerBySpecs)
router.get('/lockers/locker/:id', lockers.getCabin)
router.get('/lockers/:id', lockers.getLockerByID)
router.put('/lockers/assign/:id',auth.auth, lockers.assignLocker)
router.put('/lockers/unassign/:id',auth.auth, lockers.unassignLocker)
router.put('/lockers/status/:id', auth.authAdmin, lockers.switchStatus)
router.delete('/lockers/:id', auth.authAdmin, lockers.deleteLocker)

router.post('/professors', auth.authAdmin, professors.createProfessor)
router.get('/professors', professors.getProfessors)
router.get('/professors/:id', professors.getProfessor)
router.put('/professors/:id', professors.updateProfessor)
router.delete('/professors/:id', professors.deleteProfessor)

router.post('/login', users.login)
router.post('/logout',auth.auth,users.logout)
router.get('/users',auth.authAdmin, users.getUsers)
router.put('/user',auth.auth,users.updateUser)
router.get('/users/:id',auth.authAdmin, users.getUser)
router.post('/confirm',users.userConfirm)
router.post('/confirm/retry',users.resendConfirm)
router.post('/requestreset',users.requestResetPassword)
router.post('/resetpassword',users.resetPassword)
router.get('/resetpassword',users.getUserOnResetP)
router.get('/validate',users.validateSession)
router.get('/user',auth.auth,function(req,res){
  res.send(req.user)
})


router.get('*', function(req, res) {
  res.send({
    error: 'This route does not exist'
  })
})

module.exports = router
