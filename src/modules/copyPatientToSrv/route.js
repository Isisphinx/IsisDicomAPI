const { pino } = require('../../config/constants')
const { pacs } = require('../../config/connection')

const { copyToPacs } = require('./copyToPacs')
const { routerFunct } = require('../../helpers/router')


/**
 * This route moves a patient from one server to another.
 *
 * method : PUT
 *
 * url : /v2/Destinations/:Server/Patients/:Patient
 *
 * @param Server : Name of the destination server
 * @param Patient : PatientID
 */
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

module.exports.movePatient = movePatient
