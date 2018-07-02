/**
 * This function check in a database if the params exist in a certain column
 * @param {object} connection object of the connection to mysql
 * @param {object} params parameter of the request
 * @param {string} dbName name of the database
 * @param {string} column name of the column in the database
 * @return true or false
 */
const checkIfAlreadyExists = (connection, params, dbName, column) => new Promise((resolve) => {
  connection.query(`SELECT ${column} FROM ${dbName} WHERE ${column}=${params}`)
    .then((data) => {
      let exist = true
      if (data.length === 0) {
        exist = false
      }
      resolve(exist)
    })
})

module.exports.checkIfAlreadyExists = checkIfAlreadyExists
