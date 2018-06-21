const { routerFunct } = require('../helpers/router')
const { mysqlPool, CONQUESTSRV1, CONQUESTSRV2 } = require('../config/Connection')
const pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })
const { exec } = require('../helpers/promise')
const path = require('path')

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
      if (dataSelected[0] === undefined) { // Si SELECT a renvoyé un tableau vide
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

module.exports.movePatient = movePatient
module.exports.createExamInWorklist = createExamInWorklist
