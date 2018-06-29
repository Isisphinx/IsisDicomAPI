const { pino, compose } = require('../../config/constants')
const { mysqlPool } = require('../../config/connection')

const { routerFunct } = require('../../helpers/router')

/**
 * This route create or update a patient in the worklist from the data in the body request
 *
 * Data in the body request must be in JSON
 *
 * method : PUT
 *
 * url : /v2/Examens/:id/
 *
 * Parameter : - id : Accession Number of the patient
 */
const createExamInWorklistV2 = (ctx, next) => {
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

/**
 * This route create or update a patient in the worklist from the data in the body request
 *
 * Data in the body request must be in JSON
 *
 * method : PUT
 *
 * url : /JSON_IN
 */
const createExamInWorklistJSONIN = (ctx, next) => {
  const params = routerFunct('PUT', '/JSON_IN', ctx)
  if (!params) return next()
  const examInfos = ctx.request.body
  let poolConnection
  return mysqlPool.getConnection()
    .then((connection) => {
      poolConnection = connection
      return connection.query(`SELECT AccessionN FROM dicomworklist WHERE AccessionN=${examInfos.AccessionN}`)
    })
    .then((dataSelected) => { // Check if the patient already exists in the database
      if (dataSelected.length === 0) { // New patient, creating a new entry
        pino.info('New entry...')
        poolConnection.query('INSERT INTO dicomworklist SET ?', examInfos)
      } else { // Already exists, data updated
        pino.info('Update entry...')
        poolConnection.query(`DELETE FROM dicomworklist WHERE AccessionN=${examInfos.AccessionN}`)
        poolConnection.query('INSERT INTO dicomworklist SET ?', examInfos)
      }
    })
    .then(() => poolConnection.release())
    .then(() => { ctx.status = 200 })
    .then(() => next())
    .catch((err) => { pino.error(err) })
}


const createExamInWorklist = compose([createExamInWorklistV2, createExamInWorklistJSONIN])
module.exports.createExamInWorklist = createExamInWorklist
module.exports.createExamInWorklistJSONIN = createExamInWorklistJSONIN
