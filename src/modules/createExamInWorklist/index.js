const { createExamInWorklist, createExamInWorklistJSONIN } = require('./routes')

module.exports = (app) => {
  createExamInWorklist(app)
  createExamInWorklistJSONIN(app)
}
