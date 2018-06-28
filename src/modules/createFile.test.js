const path = require('path')
const fs = require('fs')

const {
  dumpFileName, convertDumpToDicom, convertPdfToJpeg, convertImgToDicom,
  dataMysqlDump, stream2file,
} = require('./createFile')

describe('CreateFile', () => {
  it('Should return the "PatienID.dump" name', () => {
    const obj = { id: 12 }
    expect(dumpFileName(obj)).toEqual('Patient12.dump')
  })

  // it('Should create a file from the request body', () => {
  //   const somePng = fs.createReadStream('../../test/convertPdfToJpeg/refImg.jpeg')
  //   stream2file(somePng, '../../test/tempDir/some.png')
  // })
})

describe('convertDumpToDicomFile', () => {
  it('Should create a PatientID.dcm', () => {
    expect.assertions(4)
    const pathDumpFile = path.join(__dirname, '..', '..', 'test', 'convertDumpToDicomFile', 'Patient5.dump')
    // const pathRefDcmFile = path.join(__dirname, '..', '..', 'test', 'convertDumpToDicomFile', 'RefPatient5.dcm')
    const pathNewDcmFile = path.join(__dirname, '..', '..', 'test', 'convertDumpToDicomFile', 'Patient5.dcm')
    return convertDumpToDicom(pathDumpFile, pathNewDcmFile)
      .then(() => {
        // const refDcmSize = fs.statSync(pathRefDcmFile).size // Size of the reference file
        const newDcmSize = fs.statSync(pathNewDcmFile).size // Size of the newly created file
        expect(fs.existsSync(pathNewDcmFile)).toBe(true)
        expect(newDcmSize).toBeLessThanOrEqual(490)
        expect(newDcmSize).toBeGreaterThanOrEqual(460)
        fs.unlinkSync(pathNewDcmFile)
        expect(fs.existsSync(pathNewDcmFile)).toBe(false)
      })
  })
})

describe('Function convertPdfToJpeg', () => {
  it('Should convert a pdf into a jpeg image', () => {
    expect.assertions(3)
    const pathPdfFile = path.join(__dirname, '..', '..', 'test', 'convertPdfToJpeg', 'pdfTest.pdf')
    const pathNewFile = path.join(__dirname, '..', '..', 'test', 'convertPdfToJpeg', 'imgTest.jpeg')
    const pathRefImg = path.join(__dirname, '..', '..', 'test', 'convertPdfToJpeg', 'refImg.jpeg')
    return convertPdfToJpeg(pathPdfFile, pathNewFile)
      .then(() => {
        const refImgSize = fs.statSync(pathRefImg).size
        const newImgSize = fs.statSync(pathNewFile).size
        expect(fs.existsSync(pathNewFile)).toBe(true)
        expect(newImgSize).toEqual(refImgSize)
        fs.unlinkSync(pathNewFile)
        expect(fs.existsSync(pathNewFile)).toBe(false)
      })
  })
})

describe('Function convertImgToDicom', () => {
  it('Should convert a jpeg into a dicom file', () => {
    expect.assertions()
    const pathRefJpeg = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'refImg.jpeg')
    // const pathRefDcm = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'refOutput.dcm')
    const pathRefModel = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'model.dcm')
    const pathOutputDcm = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'outputDcm.dcm')
    return convertImgToDicom(pathRefJpeg, pathOutputDcm, pathRefModel)
      .then(() => {
        // const refDcmSize = fs.statSync(pathRefDcm).size
        const OutputDcmSize = fs.statSync(pathOutputDcm).size
        expect(fs.existsSync(pathOutputDcm)).toBe(true)
        expect(OutputDcmSize).toBeLessThanOrEqual(270275)
        expect(OutputDcmSize).toBeGreaterThanOrEqual(270260)
        fs.unlinkSync(pathOutputDcm)
        expect(fs.existsSync(pathOutputDcm)).toBe(false)
      })
  })
})

describe('Function dataMysqlDump', () => {
  it('Should create a dump file with the data from the db', () => {
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
})

// describe('Function sendingToPacs', () => {
//   test('Should send the dcm file to the pacs', () => {

//   })
// })

