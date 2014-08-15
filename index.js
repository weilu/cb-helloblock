var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')
var request = require('request')

function assertJSend(body) {
  assert.notEqual(body.status, 'error', body.message || 'Invalid JSend response:' + body)
  assert.notEqual(body.status, 'fail', body.data || 'Invalid JSend response: ' + body)

  assert.equal(body.status, 'success', 'Unexpected JSend response: ' + body)
  assert.notEqual(body.data, undefined, 'Unexpected JSend response: ' + body)
}

function parseHBTx(transaction) {
  var tx = new bitcoinjs.Transaction()
  tx.locktime = transaction.locktime
  tx.version = transaction.version

  transaction.inputs.forEach(function(txin) {
    var index = txin.prevTxoutIndex
    var script = new bitcoinjs.Script(txin.scriptSig)
    var sequence = txin.sequence
    var txid = txin.prevTxHash

    tx.addInput(txid, index, sequence)
    tx.setInputScript(index, script)
  })

  transaction.outputs.forEach(function(txout) {
    var script = new bitcoinjs.Script(txout.scriptPubKey)
    tx.addOutput(script, txout.value)
  })

  return tx.toHex()
}

function asdf(parse, callback) {
  return function(err, res) {
    if (err) return callback(err)

    try {
      assertJSend(res.body)

      callback(undefined, parse(res.body.data))
    } catch (e) {
      callback(err)
    }
  }
}

function Helloblock(network) {
  this.url = 'https://' + network + '.helloblock.io/v1/'

  this.addresses = new Addresses(this.url)
  this.transactions = new Transactions(this.url)
}

function Addresses(url) {
  this.url = url
}

Addresses.prototype.get = function(addresses, callback) {
  var query = 'addresses&addresses=' + addresses.join('&addresses=')

  request.get({
    url: this.url + query,
    json: true
  }, asdf(function(data) {
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
  var list = 'transactions&addresses=' + addresses.join('&addresses=')
  var pagination = '&limit=50' + '&offset=' + offset
  var query = list + pagination

  request.get({
    url: this.url + query,
    json: true
  }, asdf(function(data) {
    return data.transactions.map(parseHBTx)
  }, callback))
}

Addresses.prototype.unspents = function(addresses, offset, callback) {
  var list = 'unspents&addresses=' + addresses.join('&addresses=')
  var pagination = '&limit=50' + '&offset=' + offset
  var query = list + pagination

  request.get({
    url: this.url + query,
    json: true
  }, asdf(function(data) {
    return data.unspents.map(function(unspent) {
      return {
        confirmations: unspent.confirmations,
        index: unspent.index,
        script: unspent.scriptPubKey,
        txHash: unspent.txHash,
        value: unspent.value
      }
    })
  }, callback))
}

function Transactions(url) {
  this.url = url
}

Transactions.prototype.get = function(txids, callback) {
  var query = 'transactions&txHashes=' + txids.join('&txHashes=')

  request.get({
    url: this.url + query,
    json: true,
  }, asdf(function(data) {
    return data.transactions.map(parseHBTx)
  }, callback))
}

Transactions.prototype.propagate = function(transactions, callback) {
  transactions.forEach(function(txHex) {
    request.post({
      url: this.url + 'transactions',
      json: true,
      form: {
        rawTxHex: txHex
      }
    }, asdf(function() {
      return undefined
    }, callback))
  })
}

module.exports = Helloblock
