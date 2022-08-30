const currentChain = 'bsc';

const fs = require('fs-extra');
const web3 = require('./src/web3.js');

let { abi, address } = require('./src/deployments/' +
  currentChain +
  '/UserPositions.json');

const events = async () => {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  console.log(
    'Making instance of  UserPositions.sol which is deployed to ' + address
  );
  const UserPos = new web3.eth.Contract(abi, address);

  console.log('Getting Enter, Exit Events on chain: [' + currentChain + ']\n');

  Enter = {};

  var Exit = {};

  const limit = 4999;
  const block_height_start = 14410700;
  const current_block_height = 18742174;

  const block_range = current_block_height - block_height_start;

  const numberOfPages = Math.ceil(block_range / limit);

  console.log('amount of pages ' + numberOfPages);

  let FromBlock = block_height_start;
  let ToBlock = block_height_start + limit;
  RelevantEvents = [];
  for (let i = 0; i < numberOfPages; i++) {
    FromBlock = FromBlock + limit;
    ToBlock = ToBlock + limit;
    try {
      console.log('in events loop trycatch:');
      await sleep(2000);
      await UserPos.getPastEvents(
        'AllEvents',
        {
          fromBlock: FromBlock,
          toBlock: ToBlock,
        },
        (err, events) => {
          console.log(err);
          console.log(events);
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
        }
      );
    } catch (err) {
      await sleep(2000);
      console.log('in error');
      console.log(err);
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
};
events();
