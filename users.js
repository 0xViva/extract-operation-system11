const currentChain = 'mainnet';

const fs = require('fs-extra');
const web3 = require('./src/web3.js');
const userbase = require('./src/userbase/' + currentChain + '/users.json');

/* const { tokens, symbols } = require('./src/tokens/' +
  currentChain +
  '/tokens.json'); */

let { abi, address } = require('./src/deployments/' +
  currentChain +
  '/UserPositions.json');

const events = async () => {
  console.log(
    'Making instance of  UserPositions.sol which is deployed to ' + address
  );
  const UserPos = new web3.eth.Contract(abi, address);

  console.log('\nGetting Events on chain: [' + currentChain + ']\n');

  users = [];

  UserPos.getPastEvents(
    'AllEvents',
    {
      fromBlock: 0,
      toBlock: 'latest',
    },
    (err, events) => {
      for (item in events) {
        user = events[item].returnValues.user;
        if (user != null) {
          users.push(user);
        } else {
          continue;
        }
      }

      console.log(users);
      uniqueArray = users.filter(function (item, pos) {
        return users.indexOf(item) == pos;
      });
      fs.writeFile(
        './src/userbase/' + currentChain + '/users.json',
        JSON.stringify(uniqueArray)
      );
      console.log(
        'Usersfrom ' +
          currentChain +
          ' saved to file: ./src/userbase/' +
          currentChain +
          '/users.json\n'
      );
    }
  );
};
events();
