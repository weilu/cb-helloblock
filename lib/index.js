var Addresses = require('./addresses')
var Transactions = require('./transactions')

function Helloblock(network) {
  var BASE_URL = 'https://' + network + '.helloblock.io/v1/'

  // end points
  this.addresses = new Addresses(BASE_URL + 'addresses')
  this.transactions = new Transactions(BASE_URL + 'transactions')
}

module.exports = Helloblock
