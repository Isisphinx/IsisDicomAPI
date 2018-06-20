const path = require('path')
const { exec } = require('./helpers/promise')
/**
 * This function return a dump file format file.
 * @param {object} input parameter of the request
 * @returns {string} a dumpFile with the right PatientID.
 */
const dumpFileFormat = Obj =>
  `(0008,0052) CS [PATIENT]     # QueryRetrieveLevel
(0010,0020) LO [${Obj.Patient}]         # PatientID`

/**
 * This function return the "PatienID.dump" name
 * @param {object} input parameter of the request
 * @returns {string} PatientID.dump.
 */
const dumpFileName = Obj => `Patient${Obj.Patient}.dump`

/**
 * This function create a PatientID.dcm file from a PatientID.dump
 * @param {string} input Input name file
 * @param {string} output Output name file
 * @returns PatientID.dcm
 */
const convertDumpToDicomFile = (inputFile, outputFile) => {
  const pathdump2dcm = path.join(__dirname, '..', 'bin', 'dump2dcm', 'dump2dcm.exe')
  return exec(`${pathdump2dcm} ${inputFile} ${outputFile}`)
}

// Modules exports
module.exports.dumpFileFormat = dumpFileFormat
module.exports.dumpFileName = dumpFileName
module.exports.convertDumpToDicomFile = convertDumpToDicomFile
