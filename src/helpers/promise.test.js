const { writeFile, exec } = require('./promise')
const path = require('path')

describe('Test writeFile() promise', () => {
  test('Test resolve promise of writeFile function', () => {
    expect.assertions(1)
    return expect(writeFile(path.join(__dirname, '../../test/tempDir/test.txt'), 'blabla')).resolves.toEqual(undefined)
  })

  test('Test reject promise of writeFile function', () => {
    expect.assertions(1)
    return expect(writeFile(123, 'blabla')).rejects.toThrow(/EBADF/)
  })
})

describe('Test exec() promise', () => {
  test('Test resolve promise of exec function', () => {
    expect.assertions(1)
    const pathdump2dcm = path.join(__dirname, '../../bin/dump2dcm/dump2dcm.exe')
    return expect(exec(pathdump2dcm)).resolves.toMatchObject({ stderr: '' }, { stdout: '' })
  })

  test('Test reject promise of exec function', () => {
    expect.assertions(1)
    return expect(exec('123')).rejects.toThrow('Command failed: 123')
  })
})
