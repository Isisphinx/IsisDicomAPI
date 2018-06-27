const path = require('path')
const { exec } = require('../helpers/promise')

/**
 * This function return 'PatientID.dump' string
 * @param {object} Obj parameter of the request
 * @returns {string} 'PatientID.dump' string.
 */
const dumpFileName = Obj => `Patient${Obj.id}.dump`

/**
 * This function convert a dump file to a dicom file
 * @param {string} inputFile Input dump file name
 * @param {string} outputFile Output dicom file name
 * @returns A dicom file
 */
const convertDumpToDicom = (inputFile, outputFile) => {
  const pathdump2dcm = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'dump2dcm.exe')
  return exec(`${pathdump2dcm} ${inputFile} ${outputFile}`)
}

/**
 * This function return a dump file with the data from the database.
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
 * This function convert a PDF file to a JPG image
 * @param {string} inputPdfName Input PDF file name.
 * @param {string} outputJpgName Output JPG file name.
 * @returns A JPG image.
 */
const convertPdfToJpg = (inputPdfName, outputJpgName) => {
  const pathGswin64c = path.join(__dirname, '..', '..', 'bin', 'gswin64c', 'gswin64c')
  return exec(`${pathGswin64c} -dBATCH -dNOPAUSE -sDEVICE=jpeg -r200x200 -sOutputFile=${outputJpgName} -f ${inputPdfName}`)
  // gswin64.exe -dBATCH -dNOPAUSE -sDEVICE=jpeg -r200x200 -sOutputFile=test2.jpg -f test.pdf
}

/**
 * This function convert a JPG image to a DCM file
 * and add the data from a DCM model file in it
 * @param {string} inputImgName Input JPG file name.
 * @param {string} outputDcmName Output DCM file name.
 * @param {string} modelName DCM model file name
 * @returns A DCM file.
 */
const convertImgToDicom = (inputImgName, outputDcmName, modelName) => {
  const pathImg2dcm = path.join(__dirname, '..', '..', 'bin', 'img2dcm', 'img2dcm')
  return exec(`${pathImg2dcm} -df ${modelName} ${inputImgName} ${outputDcmName}`)
  // img2dcm -df Patient12.dcm test.jpg test2.dcm
}

module.exports.dumpFileName = dumpFileName
module.exports.dataMysqlDump = dataMysqlDump
module.exports.convertDumpToDicom = convertDumpToDicom
module.exports.convertPdfToJpg = convertPdfToJpg
module.exports.convertImgToDicom = convertImgToDicom
