// TODO Déplacer route.js dans src

const Router = require('koa-router')

const router = new Router()
const { spawn } = require('child_process')
const { dumpFileFormat, writeFile, dumpFileName } = require('../src/createFile')

router.put('/v2/Destinations/:Server/Patients/:Patient', (ctx, next) => {
  ctx.status = 200 // Status 200 seulement après le suucés de la chaine de promise
  writeFile(dumpFileName(ctx.params), dumpFileFormat(ctx.params))
    .then((result) => {
      spawn('dump2dcm/dump2dcm.exe', ['', `Patient${ctx.params.Patient}.dump`, `Patient${ctx.params.Patient}.qry`], { env: { DCMDICTPATH: 'dump2dcm/dicom.dic' } })
    })
    .catch((err) => { console.log(`Erreur : ${err}`) })
  next()
})

module.exports = router
