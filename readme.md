Installation:

1. Make sure you have node.js installed on your computer
2. go to repo dir
3. 'npm install' to download modules from package.json you need to run the script

Setup:

1. Generate some Infura API key for mainnet over at https://infura.io/ for the chains you need to extract user data from.
2. Make a dev/dummy wallet and put the 12 word mnemonic in .env in variable 'KEY='
3. make sure you're getting the right variable from .env in src/web3.js

Get UserBalances:

1. make sure you have the '.env' file in src dir and put the right infura api in.
2. 'node extract.js'

Wanna compile contracts in /contracts folder?

1. go to src dir
2. 'node compile.js'
