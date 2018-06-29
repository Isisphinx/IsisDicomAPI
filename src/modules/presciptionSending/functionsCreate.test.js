const { path, fs } = require('../../config/constants')
const { dumpFileName, dataMysqlDump, stream2file } = require('./functionsCreate')

test('Should return the "PatienID.dump" name', () => {
  const obj = { id: 12 }
  expect(dumpFileName(obj)).toEqual('Patient12.dump')
})

test('Should create a file from the request body', () => {
  const someJpg = fs.createReadStream(path.join(__dirname, '../../../test/referenceFile/refImg.jpeg'))
  stream2file(someJpg, path.join(__dirname, '../../../test/tempDir/some.jpeg'))
})

test('Should create a dump file with the data from the db', () => {
  const params = { id: 5 }
  const object = [{
    AccessionN: '5',
    PatientID: '9999',
    PatientNam: 'DUPONT^JEANNE',
    PatientBir: '19900101',
    PatientSex: 'F',
    MedicalAle: null,
    ContrastAl: null,
    StudyInsta: null,
    ReqPhysici: 'ReqPhysici',
    ReqProcDes: null,
    Modality: 'CR',
    ReqContras: null,
    ScheduledA: 'Test',
    StartDate: '20180601',
    StartTime: '20180602',
    PerfPhysic: null,
    SchedPSDes: null,
    SchedPSID: null,
    SchedStati: null,
    SchedPSLoc: null,
    PreMedicat: null,
    SchedPSCom: null,
    ReqProcID: null,
    ReqProcPri: null,
    AccessTime: null,
    qTimeStamp: null,
    qFlags: null,
    qSpare: null,
  }]
  expect(dataMysqlDump(params, object)).toEqual(`(0008,0020) DA [20180601]     # 8, 1 StudyDate
(0008,0030) TM [20180602]      # 6, 1 StudyTime
(0008,0033) TM [20180602]     # 6, 1 ContentTime
(0008,0050) SH [5]     # 4, 1 AccessionNumber
(0008,0060) CS [CR]     # 2, 1 Modality
(0008,1050) PN [ReqPhysici]     # 6, 1 PerformingPhysicianName
(0010,0010) PN [DUPONT^JEANNE]     # 12, 1 PatientName
(0010,0020) LO [9999]     # 4, 1 PatientID
(0010,0030) DA [19900101]     # 8, 1 PatientBirthDate
(0010,0040) CS [F]     # 2, 1 PatientSex`)
})
