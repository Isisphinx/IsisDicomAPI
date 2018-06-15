const Router = require('koa-router')
const mysql = require('mysql')

const router = new Router()
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { writeFile } = require('../helpers/promise')

const mysqlPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'conquest',
})

router
  .put('/v2/Destinations/:Server/Patients/:Patient', (ctx, next) => {
    ctx.status = 200 // Status 200 seulement après le suucés de la chaine de promise
    writeFile(dumpFileName(ctx.params), dumpFileFormat(ctx.params))
      .then(() => {
        convertDumpToDicomFile(`Patient${ctx.params.Patient}`, `Patient${ctx.params.Patient}`)
      })
      .catch((err) => { console.log(`Erreur : ${err}`) })
    next()
  })
  .post('/v2/Destinations/:Server/Examens/:id/exam/', (ctx, next) => {
    mysqlPool.getConnection((err, connection) => {
      if (err) {
        console.log(err)
      } else {
        connection.query(`INSERT INTO patients (ExamenID) VALUES (${ctx.params.id})`, (err) => {
          if (err) {
            console.log(err)
          } else {
            ctx.status = 200
          }
        })
        connection.release()
      }
    })
    next()
  })

module.exports = router
