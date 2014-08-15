var assert = require('assert')
var fixtures = require('./fixtures').testnet

var Blockchain = require('../index.js')

describe('Blockchain API', function() {
  this.timeout(5000)

  var blockchain

  beforeEach(function() {
    blockchain = new Blockchain('testnet')
    console.log(blockchain)
  })

  describe('Addresses', function() {
    describe.only('Get', function() {
      it('returns sane results', function(done) {
        blockchain.addresses.get(fixtures.addresses, function(err, results) {
          assert.ifError(err)

          console.log(results)

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
        blockchain.addresses.transactions(fixtures.addresses, function(err, results) {
          assert.ifError(err)

          console.log(results)

          results.forEach(function(result) {
            assert(result.match(/^[0-9a-f]+$/i))
          })

          done()
        })
      })
    })

    describe('Unspents', function() {
      it('returns sane results', function(done) {
        blockchain.addresses.unspents(fixtures.addresses, function(err, results) {
          assert.ifError(err)

          console.log(results)

          results.forEach(function(result) {
            assert(result.match(/^[0-9a-f]+$/i))
          })
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
