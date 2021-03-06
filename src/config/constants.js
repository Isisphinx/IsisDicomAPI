module.exports.pino = require('pino')({ level: 'trace', prettyPrint: { forceColor: true, localTime: true } })
module.exports.mysql = require('promise-mysql')
module.exports.fs = require('fs')
module.exports.path = require('path')
module.exports.uuidv1 = require('uuid/v1')
module.exports.Koa = require('koa')
module.exports.compose = require('koa-compose')
module.exports.koaBody = require('koa-body')
module.exports.util = require('util')
