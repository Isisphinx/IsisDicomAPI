const route = require('path-match')({
  // path-to-regexp options
  sensitive: false,
  strict: false,
  end: false,
})

const routerFunct = (method, url, ctx) => {
  if (method !== ctx.method) return false
  const params = route(url)(ctx.path)
  return params
}

module.exports.routerFunct = routerFunct
