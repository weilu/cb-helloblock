var assert = require('assert')
var request = require('superagent')
var utils = require('./utils')

function Blocks(url) {
  this.url = url
}

Blocks.prototype.summary = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.get = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.latest = function(callback) {
  var query = '/latest?limit=1'

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    var block = data.blocks[0]
    return {
      blockHash: block.blockHash,
      merkleRootHash: block.merkleRootHash,
      prevBlockHash: block.prevBlockHash,
      nonce: block.nonce,
      blockHeight: block.blockHeight,
      blockTime: block.blockTime,
      blockSize: block.bits,
      txCount: block.txsCount
    }
  }, callback))
}

Blocks.prototype.propagate = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.transactions = function(params, callback) {
  assert(false, 'TODO')
}

module.exports = Blocks
