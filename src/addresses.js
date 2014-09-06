var request = require('superagent')
var utils = require('./utils')

function Addresses(url) {
  this.url = url
}

Addresses.prototype.summary = function(addresses, callback) {
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

Addresses.prototype.transactions = function(addresses, blockHeight, callback) {
  if(!Array.isArray(addresses)) {
    addresses = [addresses]
  }
  blockHeight = blockHeight || 0

  var list = '/transactions?addresses=' + addresses.join('&addresses=')

  // TODO: pagination
  var query = list + '&limit=100'

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.transactions.map(function(tx) {
      return {
        txId: tx.txHash,
        blockHash: tx.blockHash,
        blockHeight: tx.blockHeight
      }
    }).filter(function(txInfo) {
      return txInfo.blockHeight >= blockHeight
    })
  }, callback))
}

Addresses.prototype.unspents = function(addresses, blockHeight, callback) {
  if(!Array.isArray(addresses)) {
    addresses = [addresses]
  }
  blockHeight = blockHeight || 0

  var list = '/unspents?addresses=' + addresses.join('&addresses=')

  // TODO: pagination
  var query = list + '&limit=100'

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.unspents.map(function(unspent) {
      return {
        txId: unspent.txHash,
        blockHash: '', // TODO
        blockHeight: unspent.blockHeight,
        address: unspent.address,
        amount: unspent.value,
        index: unspent.index
      }
    }).filter(function(unspent) {
      return unspent.blockHeight >= blockHeight
    })
  }, callback))
}

module.exports = Addresses
