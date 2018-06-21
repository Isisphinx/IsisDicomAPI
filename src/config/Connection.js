const mysql = require('promise-mysql')

const mysqlPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'conquest',
})

const CONQUESTSRV1 = {
  AE: 'CONQUESTSRV1',
  IP: '127.0.0.1',
  PORT: 5678,
}

const CONQUESTSRV2 = {
  AE: 'CONQUESTSRV2',
  IP: '127.0.0.1',
  PORT: 5679,
}

module.exports.mysqlPool = mysqlPool
module.exports.CONQUESTSRV1 = CONQUESTSRV1
module.exports.CONQUESTSRV2 = CONQUESTSRV2
