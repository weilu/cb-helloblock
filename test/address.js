var assert = require('assert')
var bitcoinjs = require('bitcoinjs-lib')
var fixtures = require('./fixtures')
var request = require('superagent')

var Blockchain = require('../src/index.js')

describe('Addresses', function() {
  this.timeout(20000)

  var blockchain

  beforeEach(function() {
    blockchain = new Blockchain('testnet')
  })

  describe('Summary', function() {
    fixtures.addresses.forEach(function(f) {
      it('returns for ' + f + ' correctly', function(done) {
        blockchain.addresses.summary(f, function(err, results) {
          assert.ifError(err)

          results.forEach(function(result) {
            assert(result.address, f)
            assert(result.balance > 0)
            assert(result.totalReceived > 0)
            assert(result.txCount > 0)
          })

          done()
        })
      })
    })

    it('works for n > 20 addresses', function(done) {
      var addresses = fixtures.addresses.concat(fixtures.moreAddresses).concat(fixtures.evenMoreAddresses)

      blockchain.addresses.summary(addresses, function(err, results) {
        assert.ifError(err)
        assert.equal(results.length, addresses.length)

        done()
      })
    })
  })

  describe('Transactions', function() {
    it('returns sane results', function(done) {
      blockchain.addresses.transactions(fixtures.addresses[0], 0, function(err, results) {
        assert.ifError(err)

        results.forEach(function(result) {
          assert(result.txId.match(/^[0-9a-f]+$/i))
          assert(result.txHex.match(/^[0-9a-f]+$/i))
          assert(result.blockHash.match(/^[0-9a-f]+$/i))
          assert.equal(result.txId.length, 64)
          assert.equal(result.blockHash.length, 64)
          assert(result.blockHeight > 0)
        })

        done()
      })
    })

    it('returns expected transactions', function(done) {
      blockchain.addresses.transactions(fixtures.addresses, 0, function(err, results) {
        assert.ifError(err)

        fixtures.transactions.forEach(function(f) {
          assert(results.some(function(result) {
            return (result.txId === f.txId) && (result.txHex === f.txHex)
          }))
        })

        done()
      })
    })

    it('works for n > 20 transactions', function(done) {
      blockchain.addresses.transactions(fixtures.addresses.concat(fixtures.moreAddresses).concat(fixtures.evenMoreAddresses), 0, function(err, results) {
        assert.ifError(err)

        // TODO: verify
        assert(results.length > 20)

        done()
      })
    })

    it('includes zero-confirmation transactions', function(done) {
      requestNewUnspents(1, function(err, txs, addresses) {
        assert.ifError(err)

        var address = addresses[0]
        var txHex = txs[0]
        var txId = bitcoinjs.Transaction.fromHex(txHex).getId()

        blockchain.transactions.propagate(txHex, function(err) {
          assert.ifError(err)

          blockchain.addresses.transactions(address, 0, function(err, results) {
            assert.ifError(err)

            assert(results.some(function(result) {
              return result.txId === txId
            }))

            done()
          })
        })
      })
    })
  })

  describe('Unspents', function() {
    it('returns sane results', function(done) {
      blockchain.addresses.unspents(fixtures.addresses[0], function(err, results) {
        assert.ifError(err)

        results.forEach(function(result) {
          assert(result.txId.match(/^[0-9a-f]+$/i))
          assert.equal(result.txId.length, 64)

          if (result.blockHash) {
            assert(result.blockHash.match(/^[0-9a-f]+$/i))
            assert.equal(result.blockHash.length, 64)
            assert(result.blockHeight > 0)

//          } else {
//            assert(result.blockHeight === null) // TODO
          }

          assert.doesNotThrow(function() {
            bitcoinjs.Address.fromBase58Check(result.address)
          })
          assert(result.value > 0)
          assert(result.vout >= 0)
        })

        done()
      })
    })

    it('returns expected transactions', function(done) {
      blockchain.addresses.unspents(fixtures.addresses, function(err, results) {
        assert.ifError(err)

        fixtures.transactions.forEach(function(f) {
          assert(results.some(function(result) {
            return (result.txId === f.txId)
          }))
        })

        done()
      })
    })

    // TODO: improve
    it('works for n > 20 addresses', function(done) {
      var addresses = fixtures.addresses.concat(fixtures.moreAddresses).concat(fixtures.evenMoreAddresses)

      blockchain.addresses.unspents(addresses, function(err) {
        assert.ifError(err)

        done()
      })
    })
  })
})

function requestNewUnspents(amount, callback) {
  assert(amount > 0, 'Minimum amount is 1')
  assert(amount <= 3, 'Maximum amount is 3')
  amount = Math.round(amount)

  request
  .get('https://testnet.helloblock.io/v1/faucet?type=' + amount)
  .end(function(err, res) {
    if (err) return callback(err)

    var privKey = bitcoinjs.ECKey.fromWIF(res.body.data.privateKeyWIF)
    var txs = res.body.data.unspents.map(function(utxo) {
      var tx = new bitcoinjs.Transaction()
      tx.addInput(utxo.txHash, utxo.index)
      tx.addOutput(utxo.address, utxo.value)
      tx.sign(0, privKey)

      return tx.toHex()
    })

    var addresses = res.body.data.unspents.map(function(utxo) {
      return utxo.address
    })

    if (txs.length !== amount) return callback(new Error('txs.length !== amount'))

    callback(undefined, txs, addresses)
  })
}
