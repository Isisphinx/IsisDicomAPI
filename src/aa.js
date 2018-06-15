const { convertDumpToDicomFile } = require('./createFile')

convertDumpToDicomFile('Patient15.dump', 'Patient12.dcm')
  .then((result) => {
    console.log(result)
  })
  .catch((err) => {
    console.log(err)
  })
