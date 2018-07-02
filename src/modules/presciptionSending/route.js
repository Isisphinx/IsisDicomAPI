const {
  path, uuidv1, fs, pino,
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
        return writeFile(`${pathDataFolder}\\${dumpFileName(params)}`, dataMysqlDump(params, data))
      })
      .then(() => {
        pino.info('Creating a dcm file from the dump...')
        return convertDumpToDicom(`${pathDataFolder}\\${dumpFileName(params)}`, `${pathDataFolder}\\Patient${params.id}.dcm`)
      })
      .then(() => {
        pino.info('Creating an image from the pdf...')
        // fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dump`)
        return convertPdfToJpeg(`${pathDataFolder}\\PDF_${UUID}.pdf`, `${pathDataFolder}\\image${UUID}.jpeg`)
      })
      .then(() => {
        pino.info('Converting the image to a dcm file...')
        // fs.unlinkSync(`${pathDataFolder}\\PDF_${UUID}.pdf`)
        return convertImgToDicom(`${pathDataFolder}\\image${UUID}.jpeg`, `${pathDataFolder}\\image${UUID}.dcm`, `${pathDataFolder}\\Patient${params.id}.dcm`)
      })
      .then(() => {
        pino.info('Sending to the pacs...')
        // fs.unlinkSync(`${pathDataFolder}\\image${UUID}.jpeg`)
        // fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dcm`)
        return sendingToPacs(`${pathDataFolder}\\image${UUID}.dcm`, pacs)
      })
      .then(() => {
        pino.info('Successful sending.')
        ctx.status = 200
        // fs.unlinkSync(`${pathDataFolder}\\image${UUID}.dcm`)
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
        const PromiseArray = [
          new Promise((resolve, reject) => {
            fs.unlink(`${pathDataFolder}\\image${UUID}.jpeg`, (err) => {
              if (err) reject(err)
              resolve()
            })
          }),
          new Promise((resolve, reject) => {
            fs.unlink(`${pathDataFolder}\\image${UUID}.dcm`, (err) => {
              if (err) reject(err)
              resolve()
            })
          }),
          new Promise((resolve, reject) => {
            fs.unlink(`${pathDataFolder}\\PDF_${UUID}.pdf`, (err) => {
              if (err) reject(err)
              resolve()
            })
          }),
          new Promise((resolve, reject) => {
            fs.unlink(`${pathDataFolder}\\Patient${params.id}.dcm`, (err) => {
              if (err) reject(err)
              resolve()
            })
          }),
          new Promise((resolve, reject) => {
            fs.unlink(`${pathDataFolder}\\Patient${params.id}.dump`, (err) => {
              if (err) reject(err)
              resolve()
            })
          }),
        ]

        return Promise.all(PromiseArray)

        // Suppression Asynchrone
        // fs.unlink(`${pathDataFolder}\\image${UUID}.jpeg`, (err) => { if (err) throw err })
        // fs.unlink(`${pathDataFolder}\\image${UUID}.dcm`, (err) => { if (err) throw err })
        // fs.unlink(`${pathDataFolder}\\PDF_${UUID}.pdf`, (err) => { if (err) throw err })
        // fs.unlink(`${pathDataFolder}\\Patient${params.id}.dcm`, (err) => { if (err) throw err })
        // fs.unlink(`${pathDataFolder}\\Patient${params.id}.dump`, (err) => { if (err) throw err })

        // Suppression Synchrone
        // fs.unlinkSync(`${pathDataFolder}\\image${UUID}.jpeg`)
        // fs.unlinkSync(`${pathDataFolder}\\image${UUID}.dcm`)
        // fs.unlinkSync(`${pathDataFolder}\\PDF_${UUID}.pdf`)
        // fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dcm`)
        // fs.unlinkSync(`${pathDataFolder}\\Patient${params.id}.dump`)
      })
      .then(() => { pino.info('Files deleted.') })
      .catch((err) => {
        pino.error(`Fail to delete useless files.\n ${err.message}`)
      })
  }
  return next()
}

module.exports.prescription = prescription
