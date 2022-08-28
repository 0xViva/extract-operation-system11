//chain you want to extract from:

const currentChain = 'polygon';

const fs = require('fs-extra');
const web3 = require('./src/web3.js');
const userbase = require('./src/userbase/' + currentChain + '/users.json');
const { tokens, symbols, decimals } = require('./src/tokens/' +
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
        obj['KernelBalance' + ':' + tokens[token]] = Number(result);
      }
      console.log('pushing balances of ' + users[user] + ' to UserBalances');
      UserBalances[users[user]].push(obj);
    }
  }
  for (user in UserBalances) {
    obj = {};
    total = {};
    for (i in UserBalances[user]) {
      key = Object.keys(UserBalances[user][i])[0];
      value = Object.values(UserBalances[user][i])[0];
      var [action, token] = key.split(':');
      if (action == 'EnterStrategy') {
        if (total['total' + ':' + token] == undefined) {
          total['total' + ':' + token] = +value;
        } else {
          total['total' + ':' + token] = total['total' + ':' + token] + value;
        }
      }
      if (action == 'ExitStrategy') {
        if (total['total' + ':' + token] == undefined) {
          total['total' + ':' + token] = -value;
        } else {
          total['total' + ':' + token] = total['total' + ':' + token] - value;
        }
      }
      if (action == 'KernelBalance') {
        if (total['total' + ':' + token] == undefined) {
          total['total' + ':' + token] = +value;
        } else {
          total['total' + ':' + token] = total['total' + ':' + token] + value;
        }
      }
    }
    for (t in total) {
      var [action, token] = t.split(':');
      if (token === '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270') {
        total[t] = total[t] / 10 ** 18;
      } else {
        total[t] = total[t] / 10 ** 6;
      }
    }
    UserBalances[user].push(total);
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
