const { routerFunct } = require('../helpers/router')
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { writeFile } = require('../helpers/promise')
const { mysqlPool } = require('../config/mysqlConnection')
const pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })

const putRequestDumpDcmFile = (ctx, next) => {
  const params = routerFunct('PUT', '/v2/Destinations/:Server/Patients/:Patient', ctx)
  if (params) {
    return writeFile(dumpFileName(params), dumpFileFormat(params))
      .then(() => { pino.info(`File "Patient${params.Patient}.dump" created`) })
      .then(() => convertDumpToDicomFile(`Patient${params.Patient}.dump`, `Patient${params.Patient}.dcm`))
      .then(() => { ctx.status = 200 })
      .then(() => { pino.info(`File "Patient${params.Patient}.dcm" created`) })
      .catch((err) => { pino.error(err) })
  }
  return next()
}

const createExamInWorklist = (ctx, next) => {
  const params = routerFunct('PUT', '/v2/Examens/:id/', ctx)
  if (!params) return next()
  // Log depending on the event
  mysqlPool.on('connection', (connection) => {
    pino.info(`Connection ${connection.threadId} established`)
  })
  mysqlPool.on('release', (connection) => {
    pino.info(`Connection ${connection.threadId} released`)
  })

  let poolConnection
  return mysqlPool.getConnection()
    .then((connection) => {
      poolConnection = connection
      return connection.query(`INSERT INTO dicomworklist (AccessionID) VALUES (${params.id})`)
    })
    .then(() => mysqlPool.releaseConnection(poolConnection))
    .then(() => { ctx.status = 200 })
    .then(() => next())
    .catch((err) => { pino.error(err) })
}

module.exports.putRequestDumpDcmFile = putRequestDumpDcmFile
module.exports.createExamInWorklist = createExamInWorklist
