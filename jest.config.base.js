'use strict'

module.exports = {
  transform: {
    '^.+\\.(j|t)sx?$': ['@swc/jest']
  },
  moduleDirectories: ['node_modules', './'],
  modulePaths: ['node_modules', './']
}
