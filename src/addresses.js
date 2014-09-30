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

  // optional blockHeight
  if ('function' === typeof blockHeight) {
    callback = blockHeight
    blockHeight = 0
  }

  var list = '/transactions?addresses=' + addresses.join('&addresses=')

  // TODO: pagination
  var query = list + '&limit=100'

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.transactions.map(function(tx) {
      return {
        txId: tx.txHash,
        txHex: utils.parseHBTransaction(tx),
        blockHash: tx.blockHash,
        blockHeight: tx.blockHeight
      }
    }).filter(function(tx) {
      return tx.blockHeight >= blockHeight
    })
  }, callback))
}

Addresses.prototype.unspents = function(addresses, callback) {
  if(!Array.isArray(addresses)) {
    addresses = [addresses]
  }

  var list = '/unspents?addresses=' + addresses.join('&addresses=')

  // TODO: pagination
  var query = list + '&limit=100'

  request
  .get(this.url + query)
  .end(utils.handleJSend(function(data) {
    return data.unspents.filter(function(unspent) {
      return unspent.type === 'pubkeyhash'
    }).map(function(unspent) {
      return {
        txId: unspent.txHash,
        blockHash: null, // TODO
        blockHeight: unspent.blockHeight,
        address: unspent.address,
        value: unspent.value,
        vout: unspent.index
      }
    })
  }, callback))
}

module.exports = Addresses
