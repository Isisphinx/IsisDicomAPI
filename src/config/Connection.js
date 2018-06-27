const mysql = require('promise-mysql')

const mysqlPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'conquest',
})

const conquestsrv1 = {
  ae: 'CONQUESTSRV1',
  ip: '127.0.0.1',
  port: 5678,
}

const conquestsrv2 = {
  ae: 'CONQUESTSRV2',
  ip: '127.0.0.1',
  port: 5679,
}

module.exports.mysqlPool = mysqlPool
module.exports.conquestsrv1 = conquestsrv1
module.exports.conquestsrv2 = conquestsrv2
