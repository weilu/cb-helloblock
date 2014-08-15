var assert = require('assert')
var fixtures = require('./fixtures').testnet

var Blockchain = require('../index.js')

describe('Blockchain API', function() {
  this.timeout(5000)

  var blockchain

  beforeEach(function() {
    blockchain = new Blockchain('testnet')
  })

  describe('Addresses', function() {
    describe('Get', function() {
      it('returns sane results', function(done) {
        blockchain.addresses.get(fixtures.addresses, function(err, results) {
          assert.ifError(err)

          results.forEach(function(result, i) {
            assert(result.address, fixtures.addresses[i])
            assert(result.balance > 0)
            assert(result.totalReceived > 0)
            assert(result.txCount > 0)
          })

          done()
        })
      })
    })

    describe('Transactions', function() {
      it('returns sane results', function(done) {
        blockchain.addresses.transactions(fixtures.addresses, 0, function(err, results) {
          assert.ifError(err)

          results.forEach(function(result) {
            assert(result.match(/^[0-9a-f]+$/i))
          })

          done()
        })
      })
    })

    describe('Unspents', function() {
      it('returns sane results', function(done) {
        blockchain.addresses.unspents(fixtures.addresses, 0, function(err, results) {
          assert.ifError(err)

          results.forEach(function(result) {
            assert(result.confirmations > 0)
            assert(result.index >= 0)
            assert(result.script !== '')
            assert(result.txHash !== '')
            assert(result.value > 0)
          })

          done()
        })
      })
    })
  })

  describe.skip('Transactions', function() {
    describe('Get', function() {

    })

    describe('Propagate', function() {

    })
  })
})
