const { writeFile, exec } = require('./promise')
const mock = require('mock-fs')
const path = require('path')

beforeEach(() => {
  mock()
})

afterEach(() => {
  mock.restore()
})

describe('Test writeFile() promise', () => {
  it('Test resolve promise of writeFile function', () => {
    expect.assertions(1)
    return expect(writeFile('test.txt', 'blabla')).resolves.toEqual(undefined)
  })

  it('Test reject promise of writeFile function', () => {
    expect.assertions(1)
    return expect(writeFile(123, 'blabla')).rejects.toThrow('EBADF, bad file descriptor')
  })
})

describe('Test exec() promise', () => {
  it('Test resolve promise of exec function', () => {
    expect.assertions(1)
    const pathdump2dcm = path.join(__dirname, '..', '..', 'bin', 'dump2dcm', 'dump2dcm.exe')
    return expect(exec(pathdump2dcm)).resolves.toMatchObject({ stderr: '' }, { stdout: '' })
  })

  it('Test reject promise of exec function', () => {
    expect.assertions(1)
    return expect(exec('123')).rejects.toThrow('Command failed: 123')
  })
})
