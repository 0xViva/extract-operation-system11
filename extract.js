//chain you want to extract from:

const currentChain = 'mainnet';

const fs = require('fs-extra');
const web3 = require('./src/web3.js');
const userbase = require('./src/userbase/' + currentChain + '/users.json');
const { tokens, symbols } = require('./src/tokens/' +
  currentChain +
  '/tokens.json');
const { abi, address } = require('./src/deployments/' +
  currentChain +
  '/UserPositions.json');

const strategies = ['0', '1']; // 2 strategies, SAAL.main and SAAL.gnb
const users = userbase.users; // user addresses

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const extract = async () => {
  console.log('getting web3 provider accounts...\n');
  const accounts = await web3.eth.getAccounts();
  console.log(
    'Making instance of UserPosition.sol which is deployed to ' + address
  );
  const UserPosition = new web3.eth.Contract(abi, address);
  console.log('\nGetting UserBalances on chain: [' + currentChain + ']\n');
  const UserBalances = {};

  for (user in users) {
    console.log('\nCheck user balances for ' + users[user]);

    const result = await UserPosition.methods
      .getUserBalances(users[user], strategies, tokens)
      .call();

    const balances = {};
    data = result[1];

    for (item in data) {
      token = data[item].token;
      balance = data[item].balance;
      if (balance != '0') {
        balances[token] = balance;
      }
    }

    console.log(balances);
    if (Object.keys(balances).length != 0) {
      UserBalances[users[user]] = balances;
    }
  }
  console.log('\nStore user balances...\n');
  fs.writeFile(
    './extracts/' + currentChain + '/UserBalances.json',
    JSON.stringify(UserBalances)
  );
  console.log(
    'User balances from ' +
      currentChain +
      ' saved to file: ./extracts/' +
      currentChain +
      '/UserBalances.json\n'
  );
};

extract();
