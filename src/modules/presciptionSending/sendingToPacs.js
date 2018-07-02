const { path } = require('../../config/constants')
const { exec } = require('../../helpers/promise')

/**
 * This function sends the dcm file (with the image in it) to the pacs
 * @param {string} inputDcmName Input DCM file name.
 * @param {object} pacsParam Connection info of the pacs
 */
const sendingToPacs = (inputDcmName, pacsParam) => {
  const pathStorescu = path.join(__dirname, '../../../bin/storescu/storescu.exe')
  return exec(`${pathStorescu} --call ${pacsParam.ae} -xy ${pacsParam.ip} ${pacsParam.port} ${inputDcmName}`)
  // storescu --call CONQUESTSRV1 -xy 127.0.0.1 5678 image.dcm
}

module.exports.sendingToPacs = sendingToPacs
