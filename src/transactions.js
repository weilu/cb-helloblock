var request = require('request')
var utils = require('./utils')

function Transactions(url) {
  this.url = url
}

Transactions.prototype.get = function(txids, callback) {
  if(!Array.isArray(txids)) {
    txids = [txids]
  }

  var query = '?txHashes=' + txids.join('&txHashes=')

  request.get({
    url: this.url + query,
    json: true,
  }, utils.handleJSend(function(data) {
    return data.transactions.map(utils.parseHBTransaction)
  }, callback))
}

Transactions.prototype.propagate = function(transactions, callback) {
  if(!Array.isArray(transactions)) {
    transactions = [transactions]
  }

  var waitingFor = transactions.length

  function waitForAll(err) {
    if (callback) {
      waitingFor--

      if (err) {
        callback(err)
        callback = undefined

      } else if (waitingFor === 0) {
        callback()
      }
    }
  }

  transactions.forEach(function(txHex) {
    request.post({
      url: this.url,
      json: true,
      form: {
        rawTxHex: txHex
      }
    }, utils.handleJSend(function() {
      return undefined
    }, waitForAll))
  }, this)
}

module.exports = Transactions
