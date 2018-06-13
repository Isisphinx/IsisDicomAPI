const { dumpFileFormat, writeFile, dumpFileName } = require('./createFile');
const fs = require('fs');
// const mock = require('mock-fs');

// afterEach(() => {
//   mock.restore()
// })


test('Should format into dump files', () => {
  const data = { Patient: 12 };
  expect(dumpFileFormat(data)).toEqual(`(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID`);
})

// test('Should create a PatientID.dump', () => {
//   const obj = { Patient: 12 };
//   writeFile(dumpFileName(obj), dumpFileFormat(obj))
//     .then(() => {
//       expect(dumpFileName(obj)).toEqual('Patient12.dump');
//       data = fs.readFileSync('Patient12.dump')
//       expect(data).toEqual(`(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID`);
//     })
//     .catch((err) => { console.log(err) })
// })