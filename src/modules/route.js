const pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })
const fs = require('fs')
const path = require('path')
const uuidv1 = require('uuid/v1')

const { routerFunct } = require('../helpers/router')
const { mysqlPool } = require('../config/Connection')
const {
  dataMysqlDump, dumpFileName, convertDumpToDicom,
  convertPdfToJpeg, convertImgToDicom, sendingToPacs,
  stream2file, copyToPacs,
} = require('./createFile')
const { pacs } = require('../config/Connection')
const { writeFile } = require('../helpers/promise')

const movePatient = (ctx, next) => {
  const params = routerFunct('PUT', '/v2/Destinations/:Server/Patients/:Patient', ctx)
  if (params) {
    return copyToPacs(params, pacs)
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
  const examInfos = ctx.request.body

  let sqlConnection
  return mysqlPool.getConnection()
    .then((connection) => {
      sqlConnection = connection
      return sqlConnection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${params.id}`)
    })
    .then((dataSelected) => { // Check if the patient already exists in the database
      if (dataSelected.length === 0) { // New patient, creating a new entry
        pino.info('New entry...')
        examInfos.AccessionN = params.id // Add the key AccessionN: :id in the body object
        sqlConnection.query('INSERT INTO dicomworklist SET ?', examInfos)
      } else { // Already exists, data updated
        pino.info('Update entry...')
        sqlConnection.query(`DELETE FROM dicomworklist WHERE AccessionN=${params.id}`)
        examInfos.AccessionN = params.id
        sqlConnection.query('INSERT INTO dicomworklist SET ?', examInfos)
      }
    })
    .then(() => sqlConnection.release())
    .then(() => { ctx.status = 200 })
    .then(() => next())
    .catch((err) => {
      pino.error(err)
      sqlConnection.release()
    })
}

const prescription = (ctx, next) => {
  const params = routerFunct('POST', '/v2/Examens/:id/prescription', ctx)
  if (params) {
    let poolConnection
    const pathDataFolder = path.join(__dirname, '..', '..', 'data')
    const UUID = uuidv1()

    return mysqlPool.getConnection()
      .then((connection) => {
        poolConnection = connection
        // Check if the patient exists
        return connection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${params.id}`)
      })
      .then((dataSelected) => {
        if (dataSelected.length === 0) {
          const noPatienterror = new Error(`The patient ${params.id} does not exist.`)
          noPatienterror.code = 'noPat'
          throw noPatienterror
        }
      })
      .then(() => {
        // Creating the pdf
        stream2file(ctx.req, `${pathDataFolder}\\PDF_${UUID}.pdf`)
      })
      .then(() => poolConnection.query(`SELECT * from dicomworklist where AccessionN=${params.id}`))
      .then((data) => {
        pino.info('Creating a dump file...')
        return writeFile(`${pathDataFolder}\\${dumpFileName(params)}`, dataMysqlDump(params, data))
      })
      .then(() => {
        pino.info('Creating a dcm file from the dump...')
        return convertDumpToDicom(`${pathDataFolder}\\${dumpFileName(params)}`, `${pathDataFolder}\\Patient${params.id}.dcm`)
      })
      .then(() => {
        pino.info('Creating an image from the pdf...')
        return convertPdfToJpeg(`${pathDataFolder}\\PDF_${UUID}.pdf`, `${pathDataFolder}\\image${UUID}.jpeg`)
      })
      .then(() => {
        pino.info('Converting the image to a dcm file...')
        return convertImgToDicom(`${pathDataFolder}\\image${UUID}.jpeg`, `${pathDataFolder}\\image${UUID}.dcm`, `${pathDataFolder}\\Patient${params.id}.dcm`)
      })
      .then(() => {
        pino.info('Sending to the pacs...')
        return sendingToPacs(`${pathDataFolder}\\image${UUID}.dcm`, pacs)
      })
      .then(() => {
        pino.info('Successful sending.')
        ctx.status = 200
      })
      .catch((err) => {
        if (err.code === 'noPat') {
          pino.error(err.message)
          ctx.status = 404
        } else {
          pino.error(err)
          ctx.status = 500
        }
        ctx.body = err.message
      })
      .then(() => {
        pino.info('Deleting useless files...')
        fs.unlinkSync(`${pathDataFolder}\\image${UUID}.jpeg`)
        fs.unlinkSync(`${pathDataFolder}\\image${UUID}.dcm`)
        fs.unlinkSync(`${pathDataFolder}\\PDF_${UUID}.pdf`)
        fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dcm`)
        fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dump`)
      })
      .catch((err) => {
        pino.error('Fail to delete useless files...')
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
