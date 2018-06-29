const { Koa, koaBody, compose } = require('./config/constants')

const { movePatient } = require('./modules/copyPatientToSrv/route')
const { createExamInWorklist, createExamInWorklistJSONIN } = require('./modules/createExamInWorklist/routes')
const { prescription } = require('./modules/presciptionSending/route')


const app = new Koa()

const all = compose([createExamInWorklistJSONIN, prescription, movePatient, createExamInWorklist])

// require('./modules/copyPatientToSrv')(app)
// require('./modules/createExamInWorklist')(app)
// require('./modules/presciptionSending')(app)

app.use(koaBody())
app.use(all)

module.exports.app = app
