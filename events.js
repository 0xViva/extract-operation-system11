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

  console.log('Getting Enter, Exit Events on chain: [' + currentChain + ']\n');

  Enter = {};

  var Exit = {};

  const typesArray = [
    {type: 'uint256', name: 'strategyId'}, 
    {type: 'address', name: 'user'},
    {type: 'address', name: 'token'},
    {type: 'uint256', name: 'amount'},
  ];

  UserPos.getPastEvents(
    'AllEvents',
    {
      fromBlock: 0,
      toBlock: 'latest',
    },
    (err, events) => {
      RelevantEvents = [];
      console.log(events);
      console.log(err);
      for (e in events) {
        let data = events[e].raw.data
        let decodedParameters = web3.eth.abi.decodeParameters(typesArray, data);
        obj = [];
        if (events[e].raw.topics[0] == '0x334bb5f87e7c3a4187387befedac3205b6e6516e347d3a9142aae21a2ef12214') {
          obj.push(events[e].raw.topics[2]);
          obj.push('EnterStrategy');
          obj.push(decodedParameters.token);
          obj.push(decodedParameters.amount);
          RelevantEvents.push(obj);
        } else if (events[e].raw.topics[0] == '0x3ad24ebe8503084720eb1ca09347e684215bd91ce405e748489d5d7551544171') {
          obj.push(events[e].raw.topics[2]);
          obj.push('ExitStrategy');
          obj.push(decodedParameters.token);
          obj.push(decodedParameters.amount);
          RelevantEvents.push(obj);
        }
      }

      fs.writeFile(
        './extracts/' + currentChain + '/events.json',
        JSON.stringify(RelevantEvents)
      );
      console.log(
        'Enter and Exit events from ' +
          currentChain +
          ' saved to file: ./extracts/' +
          currentChain +
          '/events.json\n'
      );
    }
  );
};
events();
