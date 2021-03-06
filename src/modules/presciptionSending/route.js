const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const {
  path, uuidv1, pino,
} = require('../../config/constants')
const { pacs, mysqlPool } = require('../../config/connection')

const { routerFunct } = require('../../helpers/router')
const { writeFile } = require('../../helpers/promise')
const { stream2file, dumpFileName, dataMysqlDump } = require('./createFiles')
const { convertDumpToDicom, convertPdfToJpeg, convertImgToDicom } = require('./convertFiles')
const { sendingToPacs } = require('./sendingToPacs')


/**
 * This route add to a existing patient the prescription from the body request
 * and send it to the pacs.
 *
 * Prescription must be send by the body request in binary mode.
 *
 * Prescription in the body request must be in PDF.
 *
 * method : POST
 *
 * url : /v2/Examens/:id/prescription
 *
 * @param id : Accession Number of the patient
 */
const prescription = (ctx, next) => {
  const params = routerFunct('POST', '/v2/Examens/:id/prescription', ctx)
  if (params) {
    let poolConnection
    const pathDataFolder = path.join(__dirname, '../../../data')
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
        poolConnection.release()
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
        const ArrayFile = [
          `${pathDataFolder}\\image${UUID}.jpeg`,
          `${pathDataFolder}\\image${UUID}.dcm`,
          `${pathDataFolder}\\PDF_${UUID}.pdf`,
          `${pathDataFolder}\\Patient${params.id}.dcm`,
          `${pathDataFolder}\\Patient${params.id}.dump`,
        ]
        return Promise.map(ArrayFile, file => fs.unlinkAsync(file))
      })
      .catch((err) => {
        pino.error(`Fail to delete useless files : ${err.message}`)
      })
  }
  return next()
}

module.exports.prescription = prescription
