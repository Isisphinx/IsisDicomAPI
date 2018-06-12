const Router = require('koa-router');
const router = new Router();
const {spawn} = require('child_process');
const {dumpfileFormat, writeFile} = require('../src/createFile');

router.put('/v2/Destinations/:Server/Patients/:Patient', (ctx, next) => {
  const data = dumpfileFormat(ctx.params);
  ctx.status = 200;
  writeFile(ctx.params, data)
    .then((result) => {
      spawn('dump2dcm/dump2dcm.exe', ['', `Patient${ctx.params.Patient}.dump`, `Patient${ctx.params.Patient}.qry`], { env: { DCMDICTPATH: 'dump2dcm/dicom.dic' } })
    })
    .catch((err) => { console.log('Erreur : ' + err) })

  next();
})

module.exports.router = router