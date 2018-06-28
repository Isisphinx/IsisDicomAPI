const mock = require('mock-fs')
const {
  dumpFileName, convertDumpToDicom, convertPdfToJpeg, convertImgToDicom,
} = require('./createFile')
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
})

describe('convertDumpToDicomFile', () => {
  test('Should create a PatientID.dcm', () => {
    expect.assertions(3)
    const pathDumpFile = path.join(__dirname, '..', '..', 'test', 'convertDumpToDicomFile', 'Patient5.dump')
    const pathRefDcmFile = path.join(__dirname, '..', '..', 'test', 'convertDumpToDicomFile', 'RefPatient5.dcm')
    const pathNewDcmFile = path.join(__dirname, '..', '..', 'test', 'convertDumpToDicomFile', 'Patient5.dcm')
    return convertDumpToDicom(pathDumpFile, pathNewDcmFile)
      .then(() => {
        const refDcmSize = fs.statSync(pathRefDcmFile).size // Size of the reference file
        const newDcmSize = fs.statSync(pathNewDcmFile).size // Size of the newly created file
        expect(fs.existsSync(pathNewDcmFile)).toBe(true)
        expect(newDcmSize).toBeLessThan(500)
        fs.unlinkSync(pathNewDcmFile)
        expect(fs.existsSync(pathNewDcmFile)).toBe(false)
      })
  })
})

describe('Function convertPdfToJpeg', () => {
  test('Should convert a pdf into a jpeg image', () => {
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
  test('Should convert a jpeg into a dicom file', () => {
    expect.assertions()
    const pathRefJpeg = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'refImg.jpeg')
    const pathRefDcm = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'refOutput.dcm')
    const pathRefModel = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'model.dcm')
    const pathOutputDcm = path.join(__dirname, '..', '..', 'test', 'convertImgToDicom', 'outputDcm.dcm')
    return convertImgToDicom(pathRefJpeg, pathOutputDcm, pathRefModel)
      .then(() => {
        const refDcmSize = fs.statSync(pathRefDcm).size
        const OutputDcmSize = fs.statSync(pathOutputDcm).size
        expect(fs.existsSync(pathOutputDcm)).toBe(true)
        expect(OutputDcmSize).toBeLessThan(270275)
        fs.unlinkSync(pathOutputDcm)
        expect(fs.existsSync(pathOutputDcm)).toBe(false)
      })
  })
})


describe('Function sendingToPacs', () => {
  test('Should send the dcm file to the pacs', () => {

  })
})

describe('Function dataMysqlDump', () => {
  test('Should create a dump file with the data from the db', () => {

  })
})

describe('Function stream2file', () => {
  test('Should create a file from the request body', () => {

  })
})
