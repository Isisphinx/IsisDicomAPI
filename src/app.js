const Koa = require('koa')
const { putRequest, postRequest } = require('./modules/route')
const compose = require('koa-compose')

const app = new Koa()

const all = compose([putRequest, postRequest])
app.use(all)

app.listen(3000)
