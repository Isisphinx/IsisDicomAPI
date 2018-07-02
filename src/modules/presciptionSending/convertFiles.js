const { path } = require('../../config/constants')
const { exec } = require('../../helpers/promise')

/**
 * This function converts a dump file to a dicom file
 * @param {string} inputFile Input dump file name
 * @param {string} outputFile Output dicom file name
 * @returns A dicom file
 */
const convertDumpToDicom = (inputFile, outputFile) => {
  const pathdump2dcm = path.join(__dirname, '../../../bin/dump2dcm/dump2dcm.exe')
  return exec(`${pathdump2dcm} ${inputFile} ${outputFile}`)
}

/**
 * This function converts a PDF file to a JPEG image
 * @param {string} inputPdfName Input PDF file name.
 * @param {string} outputJpgName Output JPEG file name.
 * @returns A JPEG image.
 */
const convertPdfToJpeg = (inputPdfName, outputJpgName) => {
  const pathGswin64c = path.join(__dirname, '../../../bin/gswin64c/gswin64c.exe')
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
  const pathImg2dcm = path.join(__dirname, '../../../bin/img2dcm/img2dcm.exe')
  return exec(`${pathImg2dcm} -sc -df ${modelName} ${inputImgName} ${outputDcmName}`)
  // img2dcm -df Patient12.dcm test.jpg test2.dcm
}

module.exports.convertDumpToDicom = convertDumpToDicom
module.exports.convertPdfToJpeg = convertPdfToJpeg
module.exports.convertImgToDicom = convertImgToDicom
