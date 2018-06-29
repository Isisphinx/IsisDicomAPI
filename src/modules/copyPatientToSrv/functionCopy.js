const { path } = require('../../config/constants')
const { exec } = require('../../helpers/promise')
/**
 * This function transfer the patient to another server
 * @param {object} params Parameter of the request.
 * @param {object} pacsParam Connection info of the pacs
 */
const copyToPacs = (params, pacsParam) => {
  const pathMovescu = path.join(__dirname, '../../../bin/movescu/movescu.exe')
  return exec(`${pathMovescu} --key 0010,0020=${params.Patient} --call ${pacsParam.ae} --move ${params.Server} ${pacsParam.ip} ${pacsParam.port}`)
  // movescu --key 0010,0020=0009703828 --call CONQUESTSRV1 --move CONQUESTSRV2 127.0.0.1 5678
}

module.exports.copyToPacs = copyToPacs
