var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')

function assertJSend(body) {
  assert.notEqual(body.status, 'error', body.message || 'Invalid JSend response:' + JSON.stringify(body))
  assert.notEqual(body.status, 'fail', body.data || 'Invalid JSend response: ' + JSON.stringify(body))

  assert.equal(body.status, 'success', 'Unexpected JSend response: ' + body)
  assert.notEqual(body.data, undefined, 'Unexpected JSend response: ' + body)
}

function handleJSend(handle, callback) {
  return function(err, response, body) {
    if (err) return callback(err)

    var result
    try {
      assertJSend(body)

      result = handle(body.data)
    } catch (exception) {
      return callback(exception)
    }

    callback(undefined, result)
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

  return tx.toHex()
}

module.exports = {
  handleJSend: handleJSend,
  parseHBTransaction: parseHBTransaction,
}
