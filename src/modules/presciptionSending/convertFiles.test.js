const { path, fs } = require('../../config/constants')
const { convertDumpToDicom, convertPdfToJpeg, convertImgToDicom } = require('./convertFiles')

test('Should create a PatientID.dcm', () => {
  expect.assertions(4)
  const pathDumpFile = path.join(__dirname, '../../../test/referenceFile/Patient5.dump')
  const pathNewDcmFile = path.join(__dirname, '../../../test/tempDir/Patient5.dcm')
  return convertDumpToDicom(pathDumpFile, pathNewDcmFile)
    .then(() => {
      const newDcmSize = fs.statSync(pathNewDcmFile).size // Size of the newly created file
      expect(fs.existsSync(pathNewDcmFile)).toBe(true)
      expect(newDcmSize).toBeLessThanOrEqual(490)
      expect(newDcmSize).toBeGreaterThanOrEqual(460)
      fs.unlinkSync(pathNewDcmFile)
      expect(fs.existsSync(pathNewDcmFile)).toBe(false)
    })
})

test('Should convert a pdf into a jpeg image', () => {
  expect.assertions()
  const pathPdfFile = path.join(__dirname, '../../../test/referenceFile/pdfTest.pdf')
  const pathImg = path.join(__dirname, '../../../test/tempDir/image.jpeg')
  const pathRefImg = path.join(__dirname, '../../../test/referenceFile/refImg.jpeg')
  return convertPdfToJpeg(pathPdfFile, pathImg)
    .then(() => {
      expect(fs.existsSync(pathImg)).toBe(true)
      const sizeImg = fs.statSync(pathImg).size
      const sizeRefImg = fs.statSync(pathRefImg).size
      expect(sizeImg).toEqual(sizeRefImg)
      fs.unlinkSync(pathImg)
      expect(fs.existsSync(pathImg)).toBe(false)
    })
})

test('Should convert a jpeg into a dicom file', () => {
  expect.assertions(4)
  const pathRefJpeg = path.join(__dirname, '../../../test/referenceFile/refImg.jpeg')
  const pathRefModel = path.join(__dirname, '../../../test/referenceFile/model.dcm')
  const pathOutputDcm = path.join(__dirname, '../../../test/tempDir/outputDcm.dcm')
  return convertImgToDicom(pathRefJpeg, pathOutputDcm, pathRefModel)
    .then(() => {
      const OutputDcmSize = fs.statSync(pathOutputDcm).size
      expect(fs.existsSync(pathOutputDcm)).toBe(true)
      expect(OutputDcmSize).toBeLessThanOrEqual(270275)
      expect(OutputDcmSize).toBeGreaterThanOrEqual(270260)
      fs.unlinkSync(pathOutputDcm)
      expect(fs.existsSync(pathOutputDcm)).toBe(false)
    })
})

