var Addresses = require('./addresses')
var Blocks = require('./blocks')
var Transactions = require('./transactions')

var NETWORKS = {
  bitcoin: "mainnet",
  testnet: "testnet"
}

function Helloblock(network) {
  network = network || 'bitcoin'
  var BASE_URL = 'https://' + NETWORKS[network] + '.helloblock.io/v1/'

  // end points
  this.addresses = new Addresses(BASE_URL + 'addresses')
  this.blocks = new Blocks(BASE_URL + 'blocks')
  this.transactions = new Transactions(BASE_URL + 'transactions')
}

module.exports = Helloblock
