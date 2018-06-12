const Koa = require('koa');
const Router = require('koa-router');
const {spawn} = require('child_process');
//const pino = require('pino')

const {dumpfileFormat, writeFile} = require('./src/createFile')
const app = new Koa();
const router = new Router();


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

// new Promise((resolve, reject) => {
//   const dcmFile = `${dumpFile}.wl`
//   let stderr = ''
//   const dump2dcm = spawn('dump2dcm/dump2dcm', ['+te', dumpFile, dcmFile], { env: { DCMDICTPATH: 'dump2dcm/dicom.dic' } })
//   dump2dcm.stderr.on('data', (chunk) => {
//     stderr += chunk.toString()
//   })
//   dump2dcm.on('close', (code) => {
//     if (code !== 0) {
//       reject(stderr)
//       return
//     }
//     resolve(dcmFile)
//   })
// })

app.use(router.routes());
app.listen(3000);