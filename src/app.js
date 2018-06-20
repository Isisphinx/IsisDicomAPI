const Koa = require('koa')
const { putRequestDumpDcmFile, createExamInWorklist } = require('./modules/route')
const compose = require('koa-compose')

const app = new Koa()

const all = compose([putRequestDumpDcmFile, createExamInWorklist])
app.use(all)

module.exports.app = app
