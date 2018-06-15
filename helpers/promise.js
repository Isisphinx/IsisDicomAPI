const util = require('util')

const writeFile = util.promisify(require('fs').writeFile)
const exec = util.promisify(require('child_process').exec)

module.exports.writeFile = writeFile
module.exports.exec = exec
