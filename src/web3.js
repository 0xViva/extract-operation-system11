const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

require('dotenv').config();

const provider = new HDWalletProvider(
  'grant bag anchor cook mule tourist surprise father label safe sustain cigar',
  process.env.MAINNET_INFURA_API_KEY //make a .env inside /src and insert MAINNET_INFURA_API_KEY=https://mainnet.infura.io/v3/YOUR_KEY_HERE
);
const web3 = new Web3(provider);

module.exports = web3;
