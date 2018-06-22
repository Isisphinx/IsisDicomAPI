const { routerFunct } = require('../helpers/router')
const { mysqlPool, CONQUESTSRV1, CONQUESTSRV2 } = require('../config/Connection')
const { exec } = require('../helpers/promise')
const { DataMysqlDump, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { writeFile } = require('../helpers/promise')
const pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })
const path = require('path')
const fs = require('fs')

const movePatient = (ctx, next) => {
  const params = routerFunct('PUT', '/v2/Destinations/:Server/Patients/:Patient', ctx)
  if (params) {
    const pathMovescu = path.join(__dirname, '..', '..', 'bin', 'movescu', 'movescu')
    return exec(`${pathMovescu} --key 0010,0020=${params.Patient} --call ${params.Server} --move ${CONQUESTSRV2.AE} ${CONQUESTSRV2.IP} ${CONQUESTSRV1.PORT}`)
      // movescu --key 0010,0020=0009703828 --call CONQUESTSRV1 --move CONQUESTSRV2 127.0.0.1 5678
      .then(() => { pino.info('Movescu success') })
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
    .then((dataSelected) => {
      if (dataSelected.length === 0) { // Si SELECT a renvoyé un tableau vide
        pino.info('New entry...') // Pas de doublon => Ajout d'une nouvelle entrée
        ctx.request.body.AccessionN = params.id // Add the key AccessionN: :id in the body object
        poolConnection.query('INSERT INTO dicomworklist SET ?', ctx.request.body)
      } else {
        pino.info('Update entry...') // Id existe déjà => mise à jour de l'entrée
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

const postPrescription = (ctx, next) => {
  const params = routerFunct('POST', '/v2/Examens/:id/prescription', ctx)
  if (params) {
    
    fs.writeFileSync('some.png', ctx.request.body, 'binary')
    let poolConnection
    return mysqlPool.getConnection()
      .then((connection) => {
        poolConnection = connection
        // Lecture si patient existe via :id
        return connection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${params.id}`)
      })
      .then((dataSelected) => {
        if (dataSelected.length === 0) {
          pino.info('The patient does not exist.')
        } else {
          pino.info('The patient exists.')
          // Patient exists => création d'un fichier dump avec les champs de la bdd
          poolConnection.query(`SELECT * from dicomworklist where AccessionN=${params.id}`)
            .then((data) => {
              pino.info('Creation d\'un fichier dump')
              writeFile(dumpFileName(params), DataMysqlDump(params, data))
            })
            .then(() => { // Création d'un fichier dcm à partir du fichier dump
              pino.info('Création d\'un fichier dcm à partir du dump')
              convertDumpToDicomFile(dumpFileName(params), `Patient${params.id}.dcm`)
            })
            .then(() => { // Conversion du pdf reçu du body en dcm
              // pino.info('Conversion du pdf en dcm')
              const pathpdf2dcm = path.join(__dirname, '..', '..', 'bin', 'pdf2dcm', 'pdf2dcm')
              pino.info(`HEADER : ${JSON.stringify(ctx.request.header)}`)
              // return exec(`${pathpdf2dcm} ${pdfData} pdfOutput.dcm`)
            })
            .catch((err) => { pino.error(err) })
        }
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
    .then((dataSelected) => {
      if (dataSelected.length === 0) { // Si SELECT a renvoyé un tableau vide
        pino.info('New entry...') // Pas de doublon => Ajout d'une nouvelle entrée
        poolConnection.query('INSERT INTO dicomworklist SET ?', ctx.request.body)
      } else {
        pino.info('Update entry...') // Id existe déjà => mise à jour de l'entrée
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
module.exports.postPrescription = postPrescription
