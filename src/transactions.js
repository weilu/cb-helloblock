var request = require('superagent')
var utils = require('./utils')

function Transactions(url) {
  this.url = url
}

Transactions.prototype.summary = function(txids, callback) {
  if(!Array.isArray(txids)) {
    txids = [txids]
  }

  var query = '?txHashes=' + txids.join('&txHashes=')

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.transactions.map(function(tx) {
      return {
        txId: tx.txHash,
        blockHash: tx.blockHash,
        blockHeight: tx.blockHeight,
        nInputs: tx.inputsCount,
        nOutputs: tx.outputsCount,
        totalInputValue: tx.totalInputsValue,
        totalOutputValue: tx.totalOutputsValue
      }
    })
  }, callback))
}

Transactions.prototype.get = function(txids, callback) {
  if(!Array.isArray(txids)) {
    txids = [txids]
  }

  var query = '?txHashes=' + txids.join('&txHashes=')

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.transactions.map(utils.parseHBTransaction)
  }, callback))
}

Transactions.prototype.propagate = function(transactions, callback) {
  if(!Array.isArray(transactions)) {
    transactions = [transactions]
  }

  var done = utils.waitForAll(transactions.length, callback)

  transactions.forEach(function(txHex) {
    request
    .post(this.url)
    .send({ rawTxHex: txHex })
    .end(utils.handleJSend(function() {
      return undefined
    }, done))
  }, this)
}

module.exports = Transactions
