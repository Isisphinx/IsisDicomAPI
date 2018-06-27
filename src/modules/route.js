const { routerFunct } = require('../helpers/router')
const { mysqlPool, conquestsrv1, conquestsrv2 } = require('../config/Connection')
const { exec } = require('../helpers/promise')
const { dataMysqlDump, dumpFileName, convertDumpToDicom, convertPdfToJpg, convertImgToDicom } = require('./createFile')
const { writeFile } = require('../helpers/promise')
const pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })
const path = require('path')
const fs = require('fs')

const movePatient = (ctx, next) => {
  const params = routerFunct('PUT', '/v2/Destinations/:Server/Patients/:Patient', ctx)
  if (params) {
    const pathMovescu = path.join(__dirname, '..', '..', 'bin', 'movescu', 'movescu')
    return exec(`${pathMovescu} --key 0010,0020=${params.Patient} --call ${params.Server} --move ${conquestsrv2.ae} ${conquestsrv2.ip} ${conquestsrv1.port}`)
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

const prescription = (ctx, next) => {
  const params = routerFunct('POST', '/v2/Examens/:id/prescription', ctx)
  if (params) {
    let poolConnection
    return mysqlPool.getConnection()
      .then((connection) => {
        poolConnection = connection
        // Lecture si patient existe via :id
        return connection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${params.id}`)
      })
      .then((dataSelected) => {
        if (dataSelected.length === 0) {
          pino.info(`The patient ${params.id} does not exist.`)
          ctx.response.body = `The patient ${params.id} does not exist.`
        } else {
          // Création du pdf reçu dans le corp
          const myFile = fs.createWriteStream('myOutput.pdf')
          ctx.req.pipe(myFile)

          pino.info(`The patient ${params.id} exists.`)
          // Création d'un fichier dump avec les champs de la bdd
          return poolConnection.query(`SELECT * from dicomworklist where AccessionN=${params.id}`)
            .then((data) => {
              pino.info('Creation d\'un fichier dump.')
              writeFile(dumpFileName(params), dataMysqlDump(params, data))
            })
            .then(() => { // Création d'un fichier dcm à partir du fichier dump
              pino.info('Création d\'un fichier dcm à partir du dump.')
              convertDumpToDicom(dumpFileName(params), `Patient${params.id}.dcm`)
            })
            .then(() => { // Creation d'un img à partir du pdf
              pino.info('Création d\'une image à partir du pdf.')
              convertPdfToJpg('myOutput.pdf', 'image.jpg')
            })
            .then(() => { // Conversion img en dcm
              pino.info('Conversion de l\'image en dcm.')
              // const pathImg2dcm = path.join(__dirname, '..', '..', 'bin', 'img2dcm', 'img2dcm')
              // const pathModele = path.join(__dirname, '..', '..', `Patient${params.id}.dcm`)
              // const pathImageJpg = path.join(__dirname, '..', '..', 'image.jpg')
              // return exec(`${pathImg2dcm} -df ${pathModele} ${pathImageJpg} image.dcm`)
              convertImgToDicom('image.jpg', 'image.dcm', `Patient${params.id}.dcm`)
              // Error: Command failed: C:\Users\marc-antoine.dupire\Documents\IsisDicomAPI\bin\img2dcm\img2dcm -df Patient5.dcm image.jpg image.dcm
              // img2dcm -df Patient5.dcm image.jpg image.dcm
            })
            // .then(() => { // envoi vers le pacs
            //   pino.info('Envoi vers pacs.')
            //   const pathStorescu = path.join(__dirname, '..', '..', 'bin', 'storescu', 'storescu')
            //   const pathImageDcm = path.join(__dirname, '..', '..', 'image.dcm')
            //   return exec(`${pathStorescu} --call ${conquestsrv1.ae} -xy ${conquestsrv1.ip} ${conquestsrv1.port} ${pathImageDcm}`)
            //   // storescu --call CONQUESTSRV1 -xy 127.0.0.1 5678 image.dcm
            // })
            // .then(() => { pino.info('Envoi reussi.') })
            // .then(() => { ctx.status = 200 })
            // .then(() => { // Suppression des fichiers plus utiles
            //   fs.unlinkSync('./image.jpg')
            //   fs.unlinkSync('./image.dcm')
            //   fs.unlinkSync('./myOutput.pdf')
            //   fs.unlinkSync(`./Patient${params.id}.dcm`)
            //   fs.unlinkSync(`./Patient${params.id}.dump`)
            // })
            .catch((err) => { pino.error(err) })
        }
      })
      .catch((err) => { pino.error(err) })
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
module.exports.prescription = prescription
