var assert = require('assert')

function Blocks(url) {
  this.url = url
}

Blocks.prototype.summary = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.get = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.latest = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.propagate = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.transactions = function(params, callback) {
  assert(false, 'TODO')
}

module.exports = Blocks
