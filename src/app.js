const Koa = require('koa')
const { movePatient, createExamInWorklist, prescription, createExamInWorklistJSONIN } = require('./modules/route')
const path = require('path')
const compose = require('koa-compose')
const koaBody = require('koa-body')

const app = new Koa()

const all = compose([createExamInWorklistJSONIN, prescription, movePatient, createExamInWorklist])
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '..', 'receptionPDF'),
  },
}))

app.use(all)

module.exports.app = app
