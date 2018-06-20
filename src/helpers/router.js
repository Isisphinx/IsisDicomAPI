const route = require('path-match')({
  // path-to-regexp options
  sensitive: false,
  strict: false,
  end: false,
})

/**
 * This function look if the url and method match the route.
 * If yes, return the parameters of the request,
 * otherwise, return false
 * @param {string} input request methods
 * @param {string} input url
 * @param {object} input ctx object of koa middleware
 * @returns parameters of the request or false
 */
const routerFunct = (method, url, ctx) => {
  if (method !== ctx.method) return false
  const params = route(url)(ctx.path)
  return params
}

module.exports.routerFunct = routerFunct
