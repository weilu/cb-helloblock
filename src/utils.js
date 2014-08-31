var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')
var jsend = require('jsend')

function handleJSend(handle, callback) {
  return function(err, res) {
    if (err) return callback(err)

    var result
    try {
      assert(jsend.isValid(res.body))

      result = handle(res.body.data)
    } catch (exception) {
      return callback(exception)
    }

    callback(undefined, result)
  }
}

function waitForAll(count, callback) {
  return function maybeDone(err) {
    if (callback) {
      count--

      if (err) {
        callback(err)
        callback = undefined

      } else if (count === 0) {
        callback()
      }
    }
  }
}

function parseHBTransaction(transaction) {
  var tx = new bitcoinjs.Transaction()
  tx.locktime = transaction.locktime
  tx.version = transaction.version

  transaction.inputs.forEach(function(txin, i) {
    var index = txin.prevTxoutIndex
    var script = bitcoinjs.Script.fromHex(txin.scriptSig)
    var sequence = txin.sequence
    var txid = txin.prevTxHash

    tx.addInput(txid, index, sequence)
    tx.setInputScript(i, script)
  })

  transaction.outputs.forEach(function(txout) {
    var script = bitcoinjs.Script.fromHex(txout.scriptPubKey)
    tx.addOutput(script, txout.value)
  })

  return { hex: tx.toHex(), confirmations: transaction.confirmations }
}

module.exports = {
  handleJSend: handleJSend,
  parseHBTransaction: parseHBTransaction,
  waitForAll: waitForAll
}
