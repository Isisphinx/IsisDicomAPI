const mock = require('mock-fs')
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { writeFile } = require('./helpers/promise')
const path = require('path')
const fs = require('fs')

describe('CreateFile', () => {
  beforeEach(() => {
    mock()
  })

  afterEach(() => {
    mock.restore()
  })

  test('Should return the "PatienID.dump" name', () => {
    const obj = { Patient: 12 }
    expect(dumpFileName(obj)).toEqual('Patient12.dump')
  })

  test('Should format into dump files', () => {
    const obj = { Patient: 12 }
    expect(dumpFileFormat(obj)).toEqual('(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID')
  })

  test('Should create a PatientID.dump', () => {
    expect.assertions(2)
    const obj = { Patient: 12 }
    const data = dumpFileFormat(obj)
    const name = dumpFileName(obj)
    return writeFile(name, data).then(() => {
      expect(name).toEqual('Patient12.dump')
      expect(fs.readFileSync('Patient12.dump').toString()).toBe('(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID')
    })
  })
})

describe('convertDumpToDicomFile', () => {
  test('Should create a PatientID.dcm', () => {
    expect.assertions(2)
    const pathDumpFile = path.join(__dirname, '..', 'bin', 'dump2dcm', 'Patient12.dump')
    const pathDcmFile = path.join(__dirname, '..', 'bin', 'dump2dcm', 'Patient12.dcm')
    return convertDumpToDicomFile(pathDumpFile, pathDcmFile)
      .then(() => {
        expect(fs.existsSync(pathDcmFile)).toBe(true)
        fs.unlinkSync(pathDcmFile)
        expect(fs.existsSync(pathDcmFile)).toBe(false)
      })
  })
})
