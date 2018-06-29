const {
  path, uuidv1, fs, pino,
} = require('../../config/constants')
const { pacs, mysqlPool } = require('../../config/connection')

const { routerFunct } = require('../../helpers/router')
const { writeFile } = require('../../helpers/promise')
const { stream2file, dumpFileName, dataMysqlDump } = require('./functionsCreate')
const { convertDumpToDicom, convertPdfToJpeg, convertImgToDicom } = require('./functionsConvert')
const { sendingToPacs } = require('./functionSending')


/**
 * This route create
 *
 * Data in the body request must be in JSON
 *
 * method : PUT
 *
 * url : /JSON_IN
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
        // TODO :  Peut être supprimer les fichiers plus rapidement à chaque étape ?
        pino.info('Deleting useless files...')
        // TODO : Supprimer les fichier en asynchrone et tous ensemble avec Promise.all
        fs.unlinkSync(`${pathDataFolder}\\image${UUID}.jpeg`)
        fs.unlinkSync(`${pathDataFolder}\\image${UUID}.dcm`)
        fs.unlinkSync(`${pathDataFolder}\\PDF_${UUID}.pdf`)
        fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dcm`)
        fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dump`)
      })
      .catch(() => {
        pino.error('Fail to delete useless files...')
      })
  }
  return next()
}

module.exports.prescription = prescription
