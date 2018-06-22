const mock = require('mock-fs')
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { writeFile } = require('../helpers/promise')
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
    const obj = { id: 12 }
    expect(dumpFileName(obj)).toEqual('Patient12.dump')
  })

  test('Should format into dump files', () => {
    const obj = { id: 12 }
    expect(dumpFileFormat(obj)).toEqual('(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID')
  })

  test('Should create a PatientID.dump', () => {
    expect.assertions(2)
    const obj = { id: 12 }
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
    expect.assertions(3)
    const pathDumpFile = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'Patient12.dump')
    const pathNewDcmFile = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'Patient12.dcm')
    const pathRefDcmFile = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'Patient15.dcm')
    return convertDumpToDicomFile(pathDumpFile, pathNewDcmFile)
      .then(() => {
        const refDcmSize = fs.statSync(pathRefDcmFile).size // Size of the reference file
        const newDcmSize = fs.statSync(pathNewDcmFile).size // Size of the newly created file
        expect(fs.existsSync(pathNewDcmFile)).toBe(true)
        expect(newDcmSize).toEqual(refDcmSize)
        fs.unlinkSync(pathNewDcmFile)
        expect(fs.existsSync(pathNewDcmFile)).toBe(false)
      })
  })
})
