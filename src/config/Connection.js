const mysql = require('promise-mysql')
const pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })

const mysqlPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'conquest',
})

// Log depending on the event
mysqlPool.on('connection', (connection) => {
  pino.info(`Connection ${connection.threadId} established`)
})
mysqlPool.on('release', (connection) => {
  pino.info(`Connection ${connection.threadId} released`)
})


const pacs = {
  ae: 'CONQUESTSRV1',
  ip: '127.0.0.1',
  port: 5678,
}

module.exports.mysqlPool = mysqlPool
module.exports.pacs = pacs
