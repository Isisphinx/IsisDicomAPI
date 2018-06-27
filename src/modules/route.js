const { routerFunct } = require('../helpers/router')
const { mysqlPool } = require('../config/Connection')
const {
  dataMysqlDump, dumpFileName, convertDumpToDicom,
  convertPdfToJpg, convertImgToDicom, sendingToPacs,
  stream2file, sendingToServer,
} = require('./createFile')
const { writeFile } = require('../helpers/promise')
const pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })
const fs = require('fs')

const movePatient = (ctx, next) => {
  const params = routerFunct('PUT', '/v2/Destinations/:Server/Patients/:Patient', ctx)
  if (params) {
    return sendingToServer(params)
      .then(() => { pino.info('Successful sending') })
      .then(() => { ctx.status = 200 })
      .catch((err) => {
        pino.error(err)
        ctx.response.body = `stdout : ${err.stdout}\nstderr : ${err.stderr}`
      })
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
      return connection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${params.id}`)
    })
    .then((dataSelected) => { // Check if the patient already exists in the database
      if (dataSelected.length === 0) { // New patient, creating a new entry
        pino.info('New entry...')
        ctx.request.body.AccessionN = params.id // Add the key AccessionN: :id in the body object
        poolConnection.query('INSERT INTO dicomworklist SET ?', ctx.request.body)
      } else { // Already exists, data updated
        pino.info('Update entry...')
        poolConnection.query(`DELETE FROM dicomworklist WHERE AccessionN=${params.id}`)
        ctx.request.body.AccessionN = params.id
        poolConnection.query('INSERT INTO dicomworklist SET ?', ctx.request.body)
      }
    })
    .then(() => poolConnection.release())
    .then(() => { ctx.status = 200 })
    .then(() => next())
    .catch((err) => { pino.error(err) })
}

const prescription = (ctx, next) => {
  const params = routerFunct('POST', '/v2/Examens/:id/prescription', ctx)
  if (params) {
    let poolConnection
    return mysqlPool.getConnection()
      .then((connection) => {
        poolConnection = connection
        // Check if the patient exists
        return connection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${params.id}`)
      })
      .then((dataSelected) => {
        if (dataSelected.length === 0) {
          throw new Error(`The patient ${params.id} does not exist.`)
        }
      })
      .then(() => {
        // Creating the pdf
        stream2file(ctx, 'myOutput.pdf')
      })
      .then(() => poolConnection.query(`SELECT * from dicomworklist where AccessionN=${params.id}`))
      .then((data) => {
        pino.info('Creating a dump file...')
        return writeFile(dumpFileName(params), dataMysqlDump(params, data))
      })
      .then(() => {
        pino.info('Creating a dcm file from the dump...')
        return convertDumpToDicom(dumpFileName(params), `Patient${params.id}.dcm`)
      })
      .then(() => {
        pino.info('Creating an image from the pdf...')
        return convertPdfToJpg('myOutput.pdf', 'image.jpg')
      })
      // .then(() => {
      //   pino.info('Converting the image to a dcm file...')
      //   return convertImgToDicom('image.jpg', 'image.dcm', `Patient${params.id}.dcm`)
      // })
      // .then(() => {
      //   pino.info('Sending to the pacs...')
      //   return sendingToPacs('image.dcm')
      // })
      // .then(() => {
      //   pino.info('Successful sending.')
      //   ctx.status = 200
      // })
      // .then(() => {
      //   pino.info('Deleting useless files...')
      //   fs.unlinkSync('./image.jpg')
      //   fs.unlinkSync('./image.dcm')
      //   fs.unlinkSync('./myOutput.pdf')
      //   fs.unlinkSync(`./Patient${params.id}.dcm`)
      //   fs.unlinkSync(`./Patient${params.id}.dump`)
      // })
      .catch((err) => {
        pino.error(err)
        ctx.status = 404
        ctx.body = `Error : The patient ${params.id} does not exist.`
      })
  }
  return next()
}

const createExamInWorklistJSONIN = (ctx, next) => {
  const params = routerFunct('PUT', '/JSON_IN', ctx)
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
      return connection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${ctx.request.body.AccessionN}`)
    })
    .then((dataSelected) => { // Check if the patient already exists in the database
      if (dataSelected.length === 0) { // New patient, creating a new entry
        pino.info('New entry...')
        poolConnection.query('INSERT INTO dicomworklist SET ?', ctx.request.body)
      } else { // Already exists, data updated
        pino.info('Update entry...')
        poolConnection.query(`DELETE FROM dicomworklist WHERE AccessionN=${ctx.request.body.AccessionN}`)
        poolConnection.query('INSERT INTO dicomworklist SET ?', ctx.request.body)
      }
    })
    .then(() => poolConnection.release())
    .then(() => { ctx.status = 200 })
    .then(() => next())
    .catch((err) => { pino.error(err) })
}

module.exports.movePatient = movePatient
module.exports.createExamInWorklist = createExamInWorklist
module.exports.createExamInWorklistJSONIN = createExamInWorklistJSONIN
module.exports.prescription = prescription
