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

const events = require('./extracts/' + currentChain + '/events.json');

const strategies = ['0', '1', '2']; // 2 strategies, SAAL.main and SAAL.gnb
const users = userbase; // user addresses

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const extract = async () => {
  console.log(
    'Making instance of UserPosition.sol which is deployed to ' + address
  );
  const UserPosition = await new web3.eth.Contract(abi, address);

  console.log('Getting Summing Events on chain: [' + currentChain + ']\n');

  const UserBalances = events.reduce((acc, [user, action, token, amount]) => {
    acc[user] = acc[user] || [];
    if (action === 'EnterStrategy') {
      obj = {};
      obj[action + ':' + token] = amount;
      acc[user].push(obj);
    }
    if (action === 'ExitStrategy') {
      obj = {};
      obj[action + ':' + token] = amount;
      acc[user].push(obj);
    }
    return acc;
  }, {});

  for (user in users) {
    if (UserBalances[users[user]] != undefined) {
      obj = {};
      for (token in tokens) {
        const result = await UserPosition.methods
          .userTokenBalance(tokens[token], users[user])
          .call();
        obj['KernelBalance' + ':' + symbols[tokens[token]]] = Number(result);
      }
      console.log('pushing balances of ' + users[user] + ' to UserBalances');
      UserBalances[users[user]].push(obj);
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
