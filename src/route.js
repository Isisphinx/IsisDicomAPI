const Router = require('koa-router')

const router = new Router()
const { dumpFileFormat, dumpFileName, convertDumpToDicomFile } = require('./createFile')
const { fs } = require('../helpers/promise')

router.put('/v2/Destinations/:Server/Patients/:Patient', (ctx, next) => {
  ctx.status = 200 // Status 200 seulement après le suucés de la chaine de promise
  fs.writeFileAsync(dumpFileName(ctx.params), dumpFileFormat(ctx.params))
    .then(() => {
      convertDumpToDicomFile(`Patient${ctx.params.Patient}`)
    })
    .catch((err) => { console.log(`Erreur : ${err}`) })
  next()
})

module.exports = router
