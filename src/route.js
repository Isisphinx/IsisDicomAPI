const Router = require('koa-router')
const mysql = require('mysql')

const router = new Router()
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { fs } = require('../helpers/promise')

const mysqlPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'conquest',
})

router
  .put('/v2/Destinations/:Server/Patients/:Patient', (ctx, next) => {
    ctx.status = 200 // Status 200 seulement après le suucés de la chaine de promise
    fs.writeFileAsync(dumpFileName(ctx.params), dumpFileFormat(ctx.params))
      .then(() => {
        convertDumpToDicomFile(`Patient${ctx.params.Patient}`)
      })
      .catch((err) => { console.log(`Erreur : ${err}`) })
    next()
  })
  .post('/JSON_IN', (ctx, next) => {
    mysqlPool.getConnection((err, connection) => {
      if (err) {
        console.log(err)
      } else {
        if (ctx.body.action == 'add') { // TypeError: Cannot read property 'append' of undefined
          delete ctx.body.action
          connection.query('INSERT INTO dicomworklist SET ?', ctx.body, (error) => {
            if (error) {
              console.log(error)
            } else {
              ctx.status('200').end()
            }
          })
        }
        connection.release()
      }
    })
    next()
  })

module.exports = router
