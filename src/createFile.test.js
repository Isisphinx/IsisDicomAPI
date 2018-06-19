const mock = require('mock-fs')
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { writeFile } = require('../helpers/promise')
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
  // TODO : Keep a dump file ready in dump2dcm for test and destroy the dcm file after test finished
  test('Should create a PatientID.dcm', () => {
    expect.assertions(2)
    const obj = { Patient: 12 }
    const data = dumpFileFormat(obj)
    const dumpName = dumpFileName(obj)
    return writeFile(dumpName, data)
      .then(() => convertDumpToDicomFile('Patient12.dump', 'Patient12.dcm'))
      .then(() => {
        expect(fs.existsSync('Patient12.dump')).toBe(true)
        expect(fs.existsSync('Patient12.dcm')).toBe(true)
      })
  })
})
