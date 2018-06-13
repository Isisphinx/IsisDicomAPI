const { spawn } = require('child_process')
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
 * @param {string} input PatientID (without the '.dump' extension)
 * @returns PatientID.dcm.
 */
const convertDumpToDicomFile = inputName =>
  new Promise((resolve, reject) => {
    const dumpFile = `${inputName}.dump`
    const dcmFile = `${inputName}.dcm`
    let stderr = ''
    const dump2dcm = spawn('dump2dcm/dump2dcm', [dumpFile, dcmFile], { env: { DCMDICTPATH: 'dump2dcm/dicom.dic' } })
    dump2dcm.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    dump2dcm.on('close', (code) => {
      if (code !== 0) {
        reject(stderr)
        return
      }
      resolve(dcmFile)
    })
  })

// Modules exports
module.exports.dumpFileFormat = dumpFileFormat
module.exports.dumpFileName = dumpFileName
module.exports.convertDumpToDicomFile = convertDumpToDicomFile
