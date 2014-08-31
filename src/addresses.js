var request = require('superagent')
var utils = require('./utils')

function Addresses(url) {
  this.url = url
}

Addresses.prototype.get = function(addresses, callback) {
  if(!Array.isArray(addresses)) {
    addresses = [addresses]
  }

  var query = '?addresses=' + addresses.join('&addresses=')

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
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
  if(!Array.isArray(addresses)) {
    addresses = [addresses]
  }

  var list = '/transactions?addresses=' + addresses.join('&addresses=')
  var pagination = '&limit=50' + '&offset=' + offset
  var query = list + pagination

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.transactions.map(utils.parseHBTransaction)
  }, callback))
}

Addresses.prototype.unspents = function(addresses, offset, callback) {
  if(!Array.isArray(addresses)) {
    addresses = [addresses]
  }

  var list = '/unspents?addresses=' + addresses.join('&addresses=')
  var pagination = '&limit=50' + '&offset=' + offset
  var query = list + pagination

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.unspents.map(function(unspent) {
      return {
        address: unspent.address,
        confirmations: unspent.confirmations,
        index: unspent.index,
        txId: unspent.txHash,
        value: unspent.value
      }
    })
  }, callback))
}

module.exports = Addresses
