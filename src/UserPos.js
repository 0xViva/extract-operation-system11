import web3 from './web3';
import UserPos from './build/IUserPosistionsV2.json';

const UserPosition = new web3.eth.Contract(
  JSON.parse(UserPos.interface),
  '0x66d430Fd4B66e306132fe97723a6d55BAA404d2c'
);
console.log('instance on contract 0x66d430Fd4B66e306132fe97723a6d55BAA404d2c made')

export default UserPosition;