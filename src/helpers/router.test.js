const { routerFunct } = require('./router')

test('Test of \'routerFunct\' : Should return a params object', () => {
  const ctx = {
    method: 'PUT',
    path: '/test/12',
  }
  expect(routerFunct('PUT', '/test/:id', ctx)).toMatchObject({ id: '12' })
})

test('Test of \'routerFunct\' : Should return false', () => {
  const ctx = {
    method: 'PUT',
    path: '/test/12',
  }
  expect(routerFunct('POST', '/test/:id', ctx)).toEqual(false)
})
