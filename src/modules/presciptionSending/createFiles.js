const { fs } = require('../../config/constants')

/**
 * This function returns 'PatientID.dump' string
 * @param {object} Obj parameter of the request
 * @return {string} PatientID.dump.
 */
const dumpFileName = Obj => `Patient${Obj.id}.dump`

/**
 * This function returns a dump with the data from the database.
 * @param {object} params Parameter of the request.
 * @param {object} object The returned object from the 'SELECT' query.
 * @return {string} a dump with the data from the database.
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
 * This function creates a file from the stream of the request body
 * @param {object} stream stream of the request
 * @param {string} fileName output file name
 * Return a file
 */
const stream2file = (stream, fileName) => {
  const myFile = fs.createWriteStream(fileName)
  stream.pipe(myFile)
}


module.exports.dumpFileName = dumpFileName
module.exports.dataMysqlDump = dataMysqlDump
module.exports.stream2file = stream2file
