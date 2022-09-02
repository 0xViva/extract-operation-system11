const currentChain = 'metis';

const fs = require('fs-extra');
const web3 = require('./src/web3.js');

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

  const typesArrayEnter = [
    { type: 'uint256', name: 'strategyId' },
    { type: 'address', name: 'user' },
    { type: 'address', name: 'token' },
    { type: 'uint256', name: 'amount' },
  ];
  const typesArrayExit = [
    { type: 'uint256', name: 'strategyId' },
    { type: 'address', name: 'user' },
    { type: 'address', name: 'token' },
    { type: 'uint256', name: 'amount' },
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
        let data = events[e].raw.data;
        obj = [];
        if (
          events[e].raw.topics[0] ==
          '0x334bb5f87e7c3a4187387befedac3205b6e6516e347d3a9142aae21a2ef12214'
        ) {
          let decodedParameters = web3.eth.abi.decodeParameters(
            typesArrayEnter,
            data
          );
          let address = web3.eth.abi.decodeParameter(
            'address',
            events[e].raw.topics[2]
          );
          obj.push(address);
          obj.push('EnterStrategy');
          obj.push(decodedParameters.token);
          obj.push(decodedParameters.amount);
          RelevantEvents.push(obj);
        } else if (
          events[e].raw.topics[0] ==
          '0x3ad24ebe8503084720eb1ca09347e684215bd91ce405e748489d5d7551544171'
        ) {
          let decodedParameters = web3.eth.abi.decodeParameters(
            typesArrayExit,
            data
          );
          let address = web3.eth.abi.decodeParameter(
            'address',
            events[e].raw.topics[2]
          );
          obj.push(address);
          obj.push('ExitStrategy');
          obj.push(decodedParameters.token);
          obj.push(decodedParameters.amount);
          RelevantEvents.push(obj);
        } else if (
          events[e].raw.topics[0] ==
          '0xe9ceb6923f66ce66f692cfd9bf46a170a01c38ebc349d2b97b51543f1053cb44'
        ) {
          obj.push(events[e].returnValues.user);
          obj.push('EnterStrategy');
          obj.push('0xdac06561cb25a4d7f49fce926caa239f4102648e');
          obj.push(events[e].returnValues.amount);
          RelevantEvents.push(obj);
        } else if (
          events[e].raw.topics[0] ==
          '0x916be3abd388904389fdac371952ee3867ef9b5ff5ab9eb5b685ff504db60c30'
        ) {
          obj.push(events[e].returnValues.user);
          obj.push('ExitStrategy');
          obj.push('0xdac06561cb25a4d7f49fce926caa239f4102648e');
          obj.push(events[e].returnValues.tokenBurned);
          RelevantEvents.push(obj);
        }
      }

      fs.writeFile(
        './extracts/' + currentChain + '/events.json',
        JSON.stringify(RelevantEvents)
      );
      fs.writeFile(
        './extracts/' + currentChain + '/rawEvents.json',
        JSON.stringify(events)
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
