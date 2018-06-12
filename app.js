// TODO Déplacer dans src
const Koa = require('koa')
const router = require('./routes/route.js')

const app = new Koa()

app.use(router.routes())

app.listen(3000)
