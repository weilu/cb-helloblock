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

Blocks.prototype.latest = function(count, callback) {
  // optional count
  if ('function' === typeof count) {
    callback = count
    count = 1
  }

  var query = '/latest?=' + ('&limit=' + (count || 1))

  console.log(this.url + query)

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.blocks.map(function(block) {
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
    })
  }, callback))
}

Blocks.prototype.propagate = function(params, callback) {
  assert(false, 'TODO')
}

Blocks.prototype.transactions = function(params, callback) {
  assert(false, 'TODO')
}

module.exports = Blocks
