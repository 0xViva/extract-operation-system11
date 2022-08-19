//chain you want to extract from:
const currentChain = 'mainnet';

const fs = require('fs-extra');
const web3 = require('./web3.js');
const userbase = require('./userbase/' + currentChain + '/users.json');
const { tokens, symbols } = require('./tokens.json');
const { abi, address } = require('./deployments/' +
  currentChain +
  '/UserPositions.json');

const strategies = ['0', '1']; // 2 strategies, SAAL.main and SAAL.gnb
const users = userbase.users; // user addresses

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
    const result = await UserPosition.methods
      .getUserBalances(users[user], strategies, tokens)
      .call();

    const balances = result[1];
    console.log('Check user balances for ' + users[user]);
    for (balance in balances) {
      UserBalances[users[user]] = balances;

      token = balances[balance].token;
      balance = balances[balance].balance;
      if (balance != 0) {
        console.log('   ' + token + ' : ' + balance);
      }
    }
  }
  console.log('\nStore user balances...\n');
  fs.writeFile(
    './extracts/' + currentChain + '/UserBalances.json',
    JSON.stringify(UserBalances)
  );
  console.log('User balances saved to file: UserBalances.json\n');
};

extract();
