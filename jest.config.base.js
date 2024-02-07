'use strict'

module.exports = {
  transform: {
    '^.+\\.(j|t)sx?$': ['@swc/jest']
  },
  transformIgnorePatterns: [],
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', './'],
  modulePaths: ['node_modules', './']
}
