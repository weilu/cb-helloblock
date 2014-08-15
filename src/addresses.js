var request = require('request')
var utils = require('./utils')

function Addresses(url) {
  this.url = url
}

Addresses.prototype.get = function(addresses, callback) {
  var query = '?addresses=' + addresses.join('&addresses=')

  request.get({
    url: this.url + query,
    json: true
  }, utils.handleJSend(function(data) {
    return data.addresses.map(function(address) {
      return {
        address: address.address,
        balance: address.balance,
        totalReceived: address.totalReceivedValue,
        txCount: address.txsCount
      }
    })
  }, callback))
}

Addresses.prototype.transactions = function(addresses, offset, callback) {
  var list = '/transactions?addresses=' + addresses.join('&addresses=')
  var pagination = '&limit=50' + '&offset=' + offset
  var query = list + pagination

  request.get({
    url: this.url + query,
    json: true
  }, utils.handleJSend(function(data) {
    return data.transactions.map(utils.parseHBTransactions)
  }, callback))
}

Addresses.prototype.unspents = function(addresses, offset, callback) {
  var list = '/unspents?addresses=' + addresses.join('&addresses=')
  var pagination = '&limit=50' + '&offset=' + offset
  var query = list + pagination

  request.get({
    url: this.url + query,
    json: true
  }, utils.handleJSend(function(data) {
    return data.unspents.map(function(unspent) {
      return {
        confirmations: unspent.confirmations,
        index: unspent.index,
        script: unspent.scriptPubKey,
        txId: unspent.txHash,
        value: unspent.value
      }
    })
  }, callback))
}

module.exports = Addresses
