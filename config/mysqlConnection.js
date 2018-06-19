const mysql = require('promise-mysql')

const mysqlPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'conquest',
})

module.exports.mysqlPool = mysqlPool
