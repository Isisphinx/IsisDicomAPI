const path = require('path')
const { exec } = require('../helpers/promise')
const { conquestsrv1, conquestsrv2 } = require('../config/Connection')
const fs = require('fs')

/**
 * This function returns 'PatientID.dump' string
 * @param {object} Obj parameter of the request
 * @returns {string} 'PatientID.dump' string.
 */
const dumpFileName = Obj => `Patient${Obj.id}.dump`

/**
 * This function converts a dump file to a dicom file
 * @param {string} inputFile Input dump file name
 * @param {string} outputFile Output dicom file name
 * @returns A dicom file
 */
const convertDumpToDicom = (inputFile, outputFile) => {
  const pathdump2dcm = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'dump2dcm.exe')
  return exec(`${pathdump2dcm} ${inputFile} ${outputFile}`)
}

/**
 * This function returns a dump file with the data from the database.
 * @param {object} params Parameter of the request.
 * @param {object} object The returned object from the 'SELECT' query.
 * @returns A dump file with the data from the database.
 */
const dataMysqlDump = (params, object) =>
  `(0008,0020) DA [${object[0].StartDate}]     # 8, 1 StudyDate
(0008,0030) TM [${object[0].StartTime}]      # 6, 1 StudyTime
(0008,0033) TM [${object[0].StartTime}]     # 6, 1 ContentTime
(0008,0050) SH [${params.id}]     # 4, 1 AccessionNumber
(0008,0060) CS [${object[0].Modality}]     # 2, 1 Modality
(0008,1050) PN [${object[0].ReqPhysici}]     # 6, 1 PerformingPhysicianName
(0010,0010) PN [${object[0].PatientNam}]     # 12, 1 PatientName
(0010,0020) LO [${object[0].PatientID}]     # 4, 1 PatientID
(0010,0030) DA [${object[0].PatientBir}]     # 8, 1 PatientBirthDate
(0010,0040) CS [${object[0].PatientSex}]     # 2, 1 PatientSex`

/**
 * This function converts a PDF file to a JPEG image
 * @param {string} inputPdfName Input PDF file name.
 * @param {string} outputJpgName Output JPEG file name.
 * @returns A JPEG image.
 */
const convertPdfToJpeg = (inputPdfName, outputJpgName) => {
  const pathGswin64c = path.join(__dirname, '..', '..', 'bin', 'gswin64c', 'gswin64c')
  return exec(`${pathGswin64c} -dBATCH -dNOPAUSE -sDEVICE=jpeg -r200x200 -sOutputFile=${outputJpgName} -f ${inputPdfName}`)
  // gswin64.exe -dBATCH -dNOPAUSE -sDEVICE=jpeg -r200x200 -sOutputFile=test2.jpg -f test.pdf
}

/**
 * This function converts a JPEG image to a DCM file
 * and add the data from a DCM model file in it
 * @param {string} inputImgName Input JPEG file name.
 * @param {string} outputDcmName Output DCM file name.
 * @param {string} modelName DCM model file name
 * @returns A DCM file.
 */
const convertImgToDicom = (inputImgName, outputDcmName, modelName) => {
  const pathImg2dcm = path.join(__dirname, '..', '..', 'bin', 'img2dcm', 'img2dcm')
  return exec(`${pathImg2dcm} -sc -df ${modelName} ${inputImgName} ${outputDcmName}`)
  // img2dcm -df Patient12.dcm test.jpg test2.dcm
}

/**
 * This function sends the dcm file (with the image in it) to the pacs
 * @param {string} inputDcmName Input DCM file name.
 */
const sendingToPacs = (inputDcmName) => {
  const pathStorescu = path.join(__dirname, '..', '..', 'bin', 'storescu', 'storescu')
  return exec(`${pathStorescu} --call ${conquestsrv1.ae} -xy ${conquestsrv1.ip} ${conquestsrv1.port} ${inputDcmName}`)
  // storescu --call CONQUESTSRV1 -xy 127.0.0.1 5678 image.dcm
}

/**
 * This function creates a file from the stream of the request body
 * @param {object} ctx ctx object of koa middleware
 * @param {string} fileName output file name
 * @returns A file
 */
const stream2file = (ctx, fileName) => {
  const myFile = fs.createWriteStream(fileName)
  ctx.req.pipe(myFile)
}

/**
 * This function transfer the patient to another server
 * @param {object} params Parameter of the request.
 */
const sendingToServer = (params) => {
  const pathMovescu = path.join(__dirname, '..', '..', 'bin', 'movescu', 'movescu')
  return exec(`${pathMovescu} --key 0010,0020=${params.Patient} --call ${params.Server} --move ${conquestsrv2.ae} ${conquestsrv2.ip} ${conquestsrv1.port}`)
  // movescu --key 0010,0020=0009703828 --call CONQUESTSRV1 --move CONQUESTSRV2 127.0.0.1 5678
}
module.exports.dumpFileName = dumpFileName
module.exports.dataMysqlDump = dataMysqlDump
module.exports.convertDumpToDicom = convertDumpToDicom
module.exports.convertPdfToJpeg = convertPdfToJpeg
module.exports.convertImgToDicom = convertImgToDicom
module.exports.sendingToPacs = sendingToPacs
module.exports.stream2file = stream2file
module.exports.sendingToServer = sendingToServer
