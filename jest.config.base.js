'use strict'

module.exports = {
  transform: {
    '^.+\\.tsx?$': ['@swc/jest']
  },
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', './'],
  modulePaths: ['node_modules', './']
}
