var request = require('request')
var utils = require('./utils')

function Transactions(url) {
  this.url = url
}

Transactions.prototype.get = function(txids, callback) {
  var query = '?txHashes=' + txids.join('&txHashes=')

  request.get({
    url: this.url + query,
    json: true,
  }, utils.handleJSend(function(data) {
    return data.transactions.map(utils.parseHBTransaction)
  }, callback))
}

Transactions.prototype.propagate = function(transactions, callback) {
  var waitingFor = transactions.length

  function waitForAll(err) {
    if (err) {
      callback(err)
      callback = undefined

      return
    }

    if (callback) {
      waitingFor--

      if (waitingFor === 0) {
        return callback(undefined)
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
