const mock = require('mock-fs')
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { fs } = require('../helpers/promise')

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
  const obj = { Patient: 12 }
  const data = dumpFileFormat(obj)
  const name = dumpFileName(obj)
  return fs.writeFileAsync(name, data).then(() => {
    expect(name).toEqual('Patient12.dump')
    expect(fs.readFileSync('Patient12.dump').toString()).toBe('(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID')
  })
})

// test fonctionnel cependant : '(node:4504) UnhandledPromiseRejectionWarning' dans la console
// Peut être mauvais test ?
test('Should create a PatientID.dcm', () => {
  const obj = { Patient: 12 }
  const data = dumpFileFormat(obj)
  const name = dumpFileName(obj)
  fs.writeFileAsync(name, data).then(() => {
    convertDumpToDicomFile('Patient12')
    expect(fs.existsSync('Patient12.dcm')).toBe(true)
  })
})
