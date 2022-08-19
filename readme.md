Installation:

1. Make sure you have node.js installed on your computer
2. go to repo dir
3. 'npm install' to download modules from package.json you need to run the script

Setup:

1. Generate some Infura API keys over at https://infura.io/ for the chains you need to extract user data from.
2. make sure you make a '.env' file in src dir and put the infura api keys in. should look like this: MAINNET_INFURA_API_KEY=https://mainnet.infura.io/v3/YOUR_KEY_HERE
3. check that the right variable is being called in src/web3.js

Get UserBalances:

1. make sure you have a '.env' file in src dir and put your neccessary infura api keys in.
2. go to src dir
3. 'node extract.js'

Wanna compile contracts in /contracts folder?

1. go to src dir
2. 'node compile.js
