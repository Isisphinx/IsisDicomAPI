const { dumpFileFormat, writeFile } = require('./createFile')
const fs = require('fs')
const mock = require('mock-fs')

afterEach(() => {
  mock.restore()
})


test('Should format into dump files', () => {
  const data = { Patient: 12 }
  expect(dumpFileFormat(data)).toEqual('(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID')
})

test('Should create a PatientID.dump', () => {
  expect.assertions(2)
  const obj = { Patient: 12 }
  const data = dumpfileFormat(obj)
  writeFile(obj, data).then((data) => {
    expect(data).toEqual('Patient12.dump')
    expect(fs.readFileSync('Patient12.dump').toEqual('(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID'))
  })
})
// test only readFile
