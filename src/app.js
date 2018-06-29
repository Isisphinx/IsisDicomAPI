const { Koa, koaBody, compose } = require('./config/constants')

const { movePatient } = require('./modules/copyPatientToSrv')
const { createExamInWorklist } = require('./modules/createExamInWorklist')
const { prescription } = require('./modules/presciptionSending')

const app = new Koa()

const all = compose([prescription, movePatient, createExamInWorklist])

app.use(koaBody())
app.use(all)

module.exports.app = app
