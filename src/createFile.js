//Require
const fs = require('fs');
const util = require('util');
const writeFilePromise = util.promisify(fs.writeFile);


const dumpfileFormat = (returnedObject) => {
  return (
    `(0008,0052) CS [PATIENT]     # QueryRetrieveLevel\n(0010,0020) LO [${returnedObject.Patient}]         # PatientID`
  )
}

const writeFile = (obj, data) => {
  return writeFilePromise('Patient' + obj.Patient + '.dump', data)
}

//Modules exports 
module.exports.dumpfileFormat = dumpfileFormat
module.exports.writeFile = writeFile


//export des routes
//test route + fct