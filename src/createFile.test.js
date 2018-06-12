const {dumpfileFormat, writeFile} = require('./createFile');

test('Formats a dump files', () => {
  const data = {Patient: 12};
  expect(dumpfileFormat(data)).toEqual(`(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [12]         # PatientID`);
})

test('Create PatientID.dump', () => {
  const obj = {Patient: 12};
  expect(writeFile(obj, 'data')).toEqual('Patient12.dump');
})