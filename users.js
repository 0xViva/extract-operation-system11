const currentChain = 'polygon';

const fs = require('fs-extra');
const web3 = require('./src/web3.js');
const userbase = require('./src/userbase/' + currentChain + '/users.json');
const events = require('./extracts/' + currentChain + '/events.json');

let { abi, address } = require('./src/deployments/' +
  currentChain +
  '/UserPositions.json');

const getUsers = async () => {
  console.log(
    'Making instance of  UserPositions.sol which is deployed to ' + address
  );
  const UserPos = new web3.eth.Contract(abi, address);

  console.log('\nGetting Events on chain: [' + currentChain + ']\n');

  users = [];

  for (e in events) {
    console.log(events[e][0]);
    users.push(events[e][0]);
  }

  uniqueArray = users.filter(function (item, pos) {
    return users.indexOf(item) == pos;
  });
  console.log('length of userbase: ' + uniqueArray.length + '\n');
  fs.writeFile(
    './src/userbase/' + currentChain + '/users.json',
    JSON.stringify(uniqueArray)
  );
  console.log(
    'Users from ' +
      currentChain +
      ' saved to file: ./src/userbase/' +
      currentChain +
      '/users.json\n'
  );
};
getUsers();
