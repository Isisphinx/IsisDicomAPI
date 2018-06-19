const Router = require('koa-router')
const mysql = require('promise-mysql')

const router = new Router()
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { writeFile } = require('../helpers/promise')

const mysqlPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'conquest',
})

router
  .put('/v2/Destinations/:Server/Patients/:Patient', (ctx) => {
    ctx.status = 200 // Status 200 seulement après le suucés de la chaine de promise
    writeFile(dumpFileName(ctx.params), dumpFileFormat(ctx.params))
      .then(() => convertDumpToDicomFile(`Patient${ctx.params.Patient}.dump`, `Patient${ctx.params.Patient}.dcm`))
      .catch((err) => { console.log(`Erreur : ${err}`) })
  })
  .post('/v2/Destinations/:Server/Examens/:id/exam/', (ctx) => {
    mysqlPool.getConnection()
      .then(connection => connection.query(`INSERT INTO patients (ExamenID) VALUES (${ctx.params.id})`)
        .then(() => connection.release()))
      .catch((err) => { console.log(err) })
    ctx.status = 200

    // Log depending on the event
    mysqlPool.on('connection', (connection) => {
      console.log(`Connection ${connection.threadId} established`)
    })
    mysqlPool.on('release', (connection) => {
      console.log(`Connection ${connection.threadId} released`)
    })
  })

module.exports = router
