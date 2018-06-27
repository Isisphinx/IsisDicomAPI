const mock = require('mock-fs')
const {
  dumpFileName, convertDumpToDicom, dataMysqlDump, convertPdfToJpg,
} = require('./createFile')
const { writeFile } = require('../helpers/promise')
const { mysqlPool } = require('../config/Connection')
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
    const pathDumpFile = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'Patient12.dump')
    const pathNewDcmFile = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'Patient12.dcm')
    const pathRefDcmFile = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'RefPatient12.dcm')
    return convertDumpToDicom(pathDumpFile, pathNewDcmFile)
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

// describe(' Function dataMysqlDump', () => {
//   test('Should create a dump file with the data from the db', () => {

//   })
// })

// describe(' Function convertPdfToJpg', () => {
//   test('Should convert a pdf into a jpg image', () => {
//     const pathPdfFile = path.join(__dirname, '..', '..', 'bin', 'gswin64c', 'pdfTest.pdf')
//     const pathImgFile = path.join(__dirname, '..', '..', 'bin', 'gswin64c', 'imgTest.jpg')
//     convertPdfToJpg(pathPdfFile, pathImgFile)
//   })
// })

