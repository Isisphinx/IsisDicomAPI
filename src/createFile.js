// Require
const fs = require('fs')
const util = require('util')

const writeFile = util.promisify(fs.writeFile)

// TODO :
// Add doc
// Test
// dump2dcm.exe
const dumpFileFormat = Obj =>
  `(0008,0052) CS [PATIENT]     # QueryRetrieveLevel
(0010,0020) LO [${Obj.Patient}]         # PatientID`

const dumpFileName = Obj => `Patient${Obj.Patient}.dump`

// Modules exports
module.exports.dumpFileFormat = dumpFileFormat
module.exports.writeFile = writeFile
module.exports.dumpFileName = dumpFileName
