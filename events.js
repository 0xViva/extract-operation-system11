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
        obj = [];
        if (events[e].event == 'EnterStrategy') {
          obj.push(events[e].returnValues.user);
          obj.push(events[e].event);
          obj.push(events[e].returnValues.tokens[0][0]);
          obj.push(Number(events[e].returnValues.tokens[0][1]));
          RelevantEvents.push(obj);
        } else if (events[e].event == 'ExitStrategy') {
          obj.push(events[e].returnValues.user);
          obj.push(events[e].event);
          obj.push(events[e].returnValues.tokens[0][0]);
          obj.push(Number(events[e].returnValues.tokens[0][1]));
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
