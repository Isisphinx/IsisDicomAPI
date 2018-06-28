const Koa = require('koa')
const {
  movePatient, createExamInWorklist, prescription, createExamInWorklistJSONIN,
} = require('./modules/route')
const compose = require('koa-compose')
const koaBody = require('koa-body')

const app = new Koa()

const all = compose([createExamInWorklistJSONIN, prescription, movePatient, createExamInWorklist])
app.use(koaBody())

app.use(all)

module.exports.app = app
