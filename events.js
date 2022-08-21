const currentChain = 'mainnet';

const fs = require('fs-extra');
const web3 = require('./src/web3.js');
const userbase = require('./src/userbase/' + currentChain + '/users.json');
const { tokens, symbols } = require('./src/tokens/' +
  currentChain +
  '/tokens.json');

let { abi, address } = require('./src/deployments/' +
  currentChain +
  '/Kernel.json');

const events = async () => {
  console.log('Making instance of  Kernel.sol which is deployed to ' + address);
  const Kernel = new web3.eth.Contract(abi, address);

  console.log('\nGetting Events on chain: [' + currentChain + ']\n');

  Kernel.getPastEvents(
    'AllEvents',
    {
      fromBlock: 0,
      toBlock: 'latest',
    },
    (err, events) => {
      for (item in events) {
        console.log(events[0].event);
        console.log(events[item].returnValues.user);
      }
      fs.writeFile(
        './extracts/' + currentChain + '/events.json',
        JSON.stringify(events)
      );
    }
  );
};
events();
