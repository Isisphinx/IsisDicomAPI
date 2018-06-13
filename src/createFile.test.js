const mock = require('mock-fs')
const { dumpFileFormat, dumpFileName } = require('./createFile')
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
