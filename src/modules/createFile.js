const path = require('path')
const { exec } = require('../helpers/promise')
/**
 * This function return a dump file format file.
 * @param {object} input parameter of the request
 * @returns {string} a dumpFile with the right PatientID.
 */
const dumpFileFormat = Obj =>
  `(0008,0052) CS [PATIENT]     # QueryRetrieveLevel
(0010,0020) LO [${Obj.id}]         # PatientID`

/**
 * This function return the "PatienID.dump" name
 * @param {object} input parameter of the request
 * @returns {string} PatientID.dump.
 */
const dumpFileName = Obj => `Patient${Obj.id}.dump`

/**
 * This function create a PatientID.dcm file from a PatientID.dump
 * @param {string} input Input name file
 * @param {string} output Output name file
 * @returns PatientID.dcm
 */
const convertDumpToDicomFile = (inputFile, outputFile) => {
  const pathdump2dcm = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'dump2dcm.exe')
  return exec(`${pathdump2dcm} ${inputFile} ${outputFile}`)
}

/**
 * This function return a dump file with the data from the database.
 * @param {object} input Parameter of the request.
 * @param {object} input The returned object from the 'SELECT' query.
 * @returns A dump file with the data from the database.
 */
const DataMysqlDump = (params, obj) =>
  `(0008,0020) DA [${obj[0].StartDate}]     # 8, 1 StudyDate
(0008,0030) TM [${obj[0].StartTime}]      # 6, 1 StudyTime
(0008,0033) TM [${obj[0].StartTime}]     # 6, 1 ContentTime
(0008,0050) SH [${params.id}]     # 4, 1 AccessionNumber
(0008,0052) CS [PATIENT]     # QueryRetrieveLevel
(0008,0060) CS [${obj[0].Modality}]     # 2, 1 Modality
(0008,1050) PN [${obj[0].ReqPhysici}]     # 6, 1 PerformingPhysicianName
(0010,0010) PN [${obj[0].PatientNam}]     # 12, 1 PatientName
(0010,0020) LO [${obj[0].PatientID}]     # 4, 1 PatientID
(0010,0030) DA [${obj[0].PatientBir}]     # 8, 1 PatientBirthDate
(0010,0040) CS [${obj[0].PatientSex}]     # 2, 1 PatientSex`

// Modules exports
module.exports.dumpFileFormat = dumpFileFormat
module.exports.dumpFileName = dumpFileName
module.exports.convertDumpToDicomFile = convertDumpToDicomFile
module.exports.DataMysqlDump = DataMysqlDump
