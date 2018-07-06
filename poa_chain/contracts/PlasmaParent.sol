pragma solidity ^0.4.18;

/* import 'brower/TokenParent'; */

contract TokenReceiver {
  function transfer(address _to, uint256 _value);
}

library Bytes {
  function concat(bytes memory self, bytes memory bts) internal view returns (bytes memory newBts) {
    uint totLen = self.length + bts.length;
    if (totLen == 0)
      return;
    newBts = new bytes(totLen);
    assembly {
        let i := 0
        let inOffset := 0
        let outOffset := add(newBts, 0x20)
        let words := 0
        let tag := tag_bts
      tag_self:
        inOffset := add(self, 0x20)
        words := div(add(mload(self), 31), 32)
        jump(tag_loop)
      tag_bts:
        i := 0
        inOffset := add(bts, 0x20)
        outOffset := add(newBts, add(0x20, mload(self)))
        words := div(add(mload(bts), 31), 32)
        tag := tag_end
      tag_loop:
        jumpi(tag, gt(i, words))
        {
          let offset := mul(i, 32)
          outOffset := add(outOffset, offset)
          mstore(outOffset, mload(add(inOffset, offset)))
          i := add(i, 1)
        }
        jump(tag_loop)
      tag_end:
        mstore(add(newBts, add(totLen, 0x20)), 0)
    }
  }

  function uintToBytes(uint self) internal pure returns (bytes memory s) {
    uint maxlength = 100;
    bytes memory reversed = new bytes(maxlength);
    uint i = 0;
    while (self != 0) {
      uint remainder = self % 10;
      self = self / 10;
      reversed[i++] = byte(48 + remainder);
    }
    s = new bytes(i);
    for (uint j = 0; j < i; j++) {
      s[j] = reversed[i - 1 - j];
    }
    return s;
  }
}

contract PlasmaParent {

  // The owner
  address public owner;

  // TokenParent Contract Address
  address public token;


  // Modifiers: only owner
  modifier onlyOwner {
    if (msg.sender != owner) revert();
    _;
  }
  // Modifiers: only token
  modifier onlyToken {
    if (msg.sender != token) revert();
    _;
  }

  // Modifiers: only token
  modifier onlyTokenOrOwner {
    if (msg.sender != token && msg.sender != owner) revert();
    _;
  }

  // Constructor
  function PlasmaParent() public {
    owner = msg.sender;
  }

  // set token address
  function setTokenAddrss(address _address) public onlyOwner {
    token = _address;
  }

  // change ownerheaders
  function transferOwner(address _address) public onlyOwner {
    owner = _address;
  }

  // kill contract itself
  function kill() onlyOwner public {
      selfdestruct(owner);
  }

  // fallback for ether
  function() payable public {
    revert();
  }

  //
  // for ( kind of like ) Plasma
  //

  // library
  using Bytes for *;

  // variables
  uint256 public lastBlockNumber = 0;
  uint256 public lastEthBlockNumber = block.number;
  uint256 public depositCounterInBlock = 0;

  // A list of Plasma blocks
  struct Header {
      uint32 blockNumber;
      uint32 numTransactions;
      uint8 v;
      bytes32 previousBlockHash;
      bytes32 merkleRootHash;
      bytes32 r;
      bytes32 s;
  }
  mapping (uint256 => Header) public headers;

  mapping (uint256 => DepositRecord) public depositRecords;
  uint32 public blockHeaderLength = 137;

  uint256 constant SignatureLength = 65;
  uint256 constant BlockNumberLength = 4;
  uint256 constant TxNumberLength = 4;
  /* uint256 constant TxTypeLength = 1; */
  /* uint256 constant TxOutputNumberLength = 1; */
  uint256 constant PreviousHashLength = 32;
  uint256 constant MerkleRootHashLength = 32;
  /* uint256 constant TxAmountLength = 32; */
  bytes constant PersonalMessagePrefixBytes = "\x19Ethereum Signed Message:\n";
  uint256 constant public PreviousBlockPersonalHashLength = BlockNumberLength +
                                                TxNumberLength +
                                                PreviousHashLength +
                                                MerkleRootHashLength +
                                                SignatureLength;
  uint256 constant NewBlockPersonalHashLength = BlockNumberLength +
                                                      TxNumberLength +
                                                      PreviousHashLength +
                                                      MerkleRootHashLength;

  mapping (address => uint256[]) userDepositRecords;

  enum DepositStatus {
      NoRecord,
      Deposited,
      WithdrawStarted,
      WithdrawChallenged,
      WithdrawCompleted,
      DepositConfirmed
  }

  struct DepositRecord {
    address from;
    DepositStatus status;
    uint256 amount;
    uint256 index;
    uint256 withdrawStartedTime;
  }

  //
  // convenient helper functions
  //
  function extract32(bytes data, uint pos) pure internal returns (bytes32 result) {
    for (uint256 i = 0; i < 32; i++) {
      result ^= (bytes32(0xff00000000000000000000000000000000000000000000000000000000000000)&data[i+pos])>>(i*8);
    }
  }

  function extract20(bytes data, uint pos) pure internal returns (bytes20 result) {
    for (uint256 i = 0; i < 20; i++) {
      result ^= (bytes20(0xff00000000000000000000000000000000000000)&data[i+pos])>>(i*8);
    }
  }

  function extract4(bytes data, uint pos) pure internal returns (bytes4 result) {
    for (uint256 i = 0; i < 4; i++) {
      result ^= (bytes4(0xff000000)&data[i+pos])>>(i*8);
    }
  }

  function extract2(bytes data, uint pos) pure internal returns (bytes2  result) {
    for (uint256 i = 0; i < 2; i++) {
      result ^= (bytes2(0xff00)&data[i+pos])>>(i*8);
    }
  }

  function extract1(bytes data, uint pos) pure internal returns (bytes1  result) {
    for (uint256 i = 0; i < 1; i++) {
      result ^= (bytes1(0xff)&data[i+pos])>>(i*8);
    }
  }

  //
  // events
  //

  // when block header submitted
  event HeaderSubmittedEvent(address indexed _signer, uint32 indexed _blockNumber, bytes32 indexed _blockHash);
  // when someone deposit
  event DepositEvent(address indexed _from, uint256 indexed _amount, uint256 indexed _depositIndex);

  // debug fucntion
  function updateLastBlockNumber(uint32 _blockNumber) public onlyOwner returns (bool success) {
    lastBlockNumber = uint256(uint32(_blockNumber));
    return true;
  }

  //
  // submit plasma block header
  //

  bytes32 public previousHash0;
  bytes32 public previousHash1;
  bytes32 public previousHash2;
  bytes32 public previousHash3;
  bytes32 public previousHash4;
  bytes32 public previousHash5;
  bytes32 public previousHash6;
  bytes32 public previousHash7;
  bytes32 public previousHash8;

  uint256 public submitBlock3_1;
  uint8 public submitBlock3_2;
  uint8 public submitBlock3_3;
  address public submitBlock3_4;
  bytes32 public submitBlock3_5;
  uint8 public submitBlock3_6;

  bytes32 public newBlockHash0;
  bytes32 public newBlockHash1;
  bytes32 public newBlockHash2;
  bytes32 public newBlockHash3;
  bytes32 public newBlockHash4;
  bytes32 public newBlockHash5;


  // submit plasma block header
  function submitBlock(bytes header) public onlyOwner returns (bool success) {

      if (header.length != blockHeaderLength) {
        revert();
      }

      uint32 blockNumber = uint32(extract4(header, 0));
      uint32 numTransactions = uint32(extract4(header, BlockNumberLength));
      bytes32 previousBlockHash = extract32(header, BlockNumberLength + TxNumberLength);
      bytes32 merkleRootHash = extract32(header, BlockNumberLength + TxNumberLength + PreviousHashLength);
      uint8 v = uint8(extract1(header, BlockNumberLength + TxNumberLength + PreviousHashLength + MerkleRootHashLength));
      bytes32 r = extract32(header, BlockNumberLength + TxNumberLength + PreviousHashLength + MerkleRootHashLength + 1);
      bytes32 s = extract32(header, BlockNumberLength + TxNumberLength + PreviousHashLength + MerkleRootHashLength + 33);
      uint256 newBlockNumber = uint256(uint32(blockNumber));

      if (newBlockNumber != lastBlockNumber+1) {
        revert();
      }

      if (lastBlockNumber != 0) {
          Header storage previousHeader = headers[lastBlockNumber];
          bytes32 previousHash = keccak256(PersonalMessagePrefixBytes, bytes32(PreviousBlockPersonalHashLength), previousHeader.blockNumber, previousHeader.numTransactions, previousHeader.previousBlockHash, previousHeader.merkleRootHash, previousHeader.v, previousHeader.r, previousHeader.s);

          if (previousHash != previousBlockHash) {
            revert();
          }
      }

      bytes32 newBlockHash = keccak256(PersonalMessagePrefixBytes, bytes32(NewBlockPersonalHashLength), blockNumber, numTransactions, previousBlockHash, merkleRootHash);

      if (v < 27) {
          v = v+27;
      }
      address signer = ecrecover(newBlockHash, v, r, s);
      if (signer != owner ) {
        revert();
      }

      Header memory newHeader = Header({
          blockNumber: blockNumber,
          numTransactions: numTransactions,
          previousBlockHash: previousBlockHash,
          merkleRootHash: merkleRootHash,
          v: v,
          r: r,
          s: s
      });
      lastBlockNumber = lastBlockNumber+1;
      headers[lastBlockNumber] = newHeader;
      HeaderSubmittedEvent(signer, blockNumber, newBlockHash);
      return true;
  }




  function submitBlock3(bytes header) public onlyOwner returns (bool success) {
      /* require(operators[msg.sender]); */
      /* require(header.length == blockHeaderLength); */

      submitBlock3_1 = 0;
      submitBlock3_3 = 0;
      submitBlock3_4 = 0;
      submitBlock3_6 = 0;

      if (header.length != blockHeaderLength) {
        submitBlock3_1 = header.length;
        return true;
      }
      submitBlock3_1 = 9;

      uint32 blockNumber = uint32(extract4(header, 0));
      uint32 numTransactions = uint32(extract4(header, BlockNumberLength));
      bytes32 previousBlockHash = extract32(header, BlockNumberLength + TxNumberLength);
      bytes32 merkleRootHash = extract32(header, BlockNumberLength + TxNumberLength + PreviousHashLength);
      uint8 v = uint8(extract1(header, BlockNumberLength + TxNumberLength + PreviousHashLength + MerkleRootHashLength));
      bytes32 r = extract32(header, BlockNumberLength + TxNumberLength + PreviousHashLength + MerkleRootHashLength + 1);
      bytes32 s = extract32(header, BlockNumberLength + TxNumberLength + PreviousHashLength + MerkleRootHashLength + 33);
      uint256 newBlockNumber = uint256(uint32(blockNumber));

      /* require(newBlockNumber == lastBlockNumber+1); */
      if (newBlockNumber != lastBlockNumber+1) {
        submitBlock3_2 = 5;
        return true;
      }
      submitBlock3_2 = 9;

      if (lastBlockNumber != 0) {
          Header storage previousHeader = headers[lastBlockNumber];
          bytes32 previousHash = keccak256(PersonalMessagePrefixBytes, bytes32(PreviousBlockPersonalHashLength), previousHeader.blockNumber, previousHeader.numTransactions, previousHeader.previousBlockHash, previousHeader.merkleRootHash, previousHeader.v, previousHeader.r, previousHeader.s);
          /* bytes32 previousHash = keccak256(PersonalMessagePrefixBytes, PreviousBlockPersonalHashLength, previousHeader.blockNumber, previousHeader.numTransactions, previousHeader.previousBlockHash, previousHeader.merkleRootHash,previousHeader.v, previousHeader.r,previousHeader.s); */

          // require(previousHash == previousBlockHash);
          if (previousHash != previousBlockHash) {
            submitBlock3_3 = uint8(PreviousBlockPersonalHashLength);
            previousHash1 = previousHash;
            return true;
          }
          submitBlock3_3 = 9;
      }

      bytes32 newBlockHash = keccak256(PersonalMessagePrefixBytes, bytes32(NewBlockPersonalHashLength), blockNumber, numTransactions, previousBlockHash, merkleRootHash);
      /* bytes32 newBlockHash = keccak256(blockNumber, numTransactions, previousBlockHash, merkleRootHash); */
      /* bytes32 newBlockHash = keccak256(merkleRootHash); */

      newBlockHash0 = newBlockHash;

      newBlockHash1 = keccak256(PersonalMessagePrefixBytes);
      newBlockHash2 = keccak256(PersonalMessagePrefixBytes, bytes32(NewBlockPersonalHashLength));
      newBlockHash3 = keccak256(PersonalMessagePrefixBytes, bytes32(NewBlockPersonalHashLength), blockNumber);
      newBlockHash4 = keccak256(PersonalMessagePrefixBytes, bytes32(NewBlockPersonalHashLength), blockNumber, numTransactions);
      newBlockHash5 = keccak256(PersonalMessagePrefixBytes, bytes32(NewBlockPersonalHashLength), blockNumber, numTransactions, previousBlockHash);

      if (v < 27) {
          v = v+27;
      }
      address signer = ecrecover(newBlockHash, v, r, s);
      /* require(operators[signer]); */
      // if( signer != ownerAddress ) revert();
      if (signer != owner ) {
        submitBlock3_4 = signer;
        submitBlock3_5 = newBlockHash;
        return true;
      }

      submitBlock3_6 = 9;

      Header memory newHeader = Header({
          blockNumber: blockNumber,
          numTransactions: numTransactions,
          previousBlockHash: previousBlockHash,
          merkleRootHash: merkleRootHash,
          v: v,
          r: r,
          s: s
      });
      lastBlockNumber = lastBlockNumber+1;
      headers[lastBlockNumber] = newHeader;
      HeaderSubmittedEvent(signer, blockNumber, newBlockHash);
      return true;
  }


  // function deposit(uint256 _amount) public returns (uint256 idx1, uint256 idx2, uint256 idx3) public onlyToken {
  /* function deposit(address _address, uint256 _amount) public returns (uint256 idx1, uint256 idx2, uint256 idx3) { */
  function deposit(address _address, uint256 _amount) public onlyTokenOrOwner returns (uint256 idx) {
    // lastEthBlockNumber is not updatede at all...
    // depositCounterInBlock may not be used yet...
    if (block.number != lastEthBlockNumber) {
        depositCounterInBlock = 0;
    }

    // seems to generate unique depositIndex
    uint256 depositIndex = block.number << 32 + depositCounterInBlock;

    // then create new DepositRecord object
    DepositRecord storage record = depositRecords[depositIndex];
    require(record.index == 0);
    require(record.status == DepositStatus.NoRecord);

    record.index = depositIndex;
    record.from = _address;
    record.amount = _amount;
    record.status = DepositStatus.Deposited;
    depositCounterInBlock = depositCounterInBlock + 1;
    userDepositRecords[_address].push(depositIndex);

    /* DepositEvent(msg.sender, msg.value, depositIndex); */
    DepositEvent(_address, _amount, depositIndex);
    return (depositIndex);
  }

  function updateDepositRecord(uint256 _depositIndex, uint8 _status) public onlyOwner returns (bool success) {
    DepositRecord storage record = depositRecords[_depositIndex];
    if (record.status == DepositStatus.NoRecord) revert();

    if (_status == 5) {
      record.status = DepositStatus.DepositConfirmed;
    }

    return true;
  }

  // helper function for debug
  function depositRecordsForUser(address _user) public view returns (uint256[]) {
      return userDepositRecords[_user];
  }



  function createPersonalMessageTypeHash(bytes memory message) public view returns (bytes32 msgHash) {
      // bytes memory prefixBytes = "\x19Ethereum Signed Message:\n";
      bytes memory lengthBytes = message.length.uintToBytes();
      // bytes memory prefix = prefixBytes.concat(lengthBytes);
      bytes memory prefix = PersonalMessagePrefixBytes.concat(lengthBytes);
      return keccak256(prefix, message);
  }


  function checkProof(
    bytes32 root,
    bytes data,
    bytes proof,
    bool convertToMessageHash) view public returns (bool) {

    bytes32 h;
    if (convertToMessageHash) {
      h = createPersonalMessageTypeHash(data);
    } else {
      h = keccak256(data);
    }

    bytes32 elProvided;
    uint8 rightElementProvided;
    uint32 loc;
    uint32 elLoc;

    for (uint32 i = 32; i <= uint32(proof.length); i += 33) {
      assembly {
        loc  := proof
        elLoc := add(loc, add(i, 1))
        elProvided := mload(elLoc)
      }
      rightElementProvided = uint8(bytes1(0xff)&proof[i-32]);
      if (rightElementProvided > 0) {
        h = keccak256(h, elProvided);
      } else {
        h = keccak256(elProvided, h);
      }
    }
    return h == root;
  }

  uint public cp_text = 0;

  // working!!!
  function checkProofText2(uint256 _bn, uint32 _txIdx, bytes _rawTx, bytes _proof) {

    cp_text = 1;

    Header header = headers[_bn];

    cp_text = 2;

    bool validProof = checkProof(header.merkleRootHash, _rawTx, _proof, false);
    if ( validProof == false ) {
      cp_text = 3;
      return;
    }
    cp_text = 4;
  }


  mapping (uint256 => mapping(uint32 => uint8) ) public exitRecords;

  // exit success
  event ExitFromChildEvent(address indexed _address, uint256 _amount, uint256 _bn, uint32 _txIdx);

  // move token after check
  function exitFromChild(
    uint256 _bn,
    uint32 _txIdx,
    bytes _rawTx,
    bytes _proof,
    address _address,
    uint256 _value
    ) {

      cp_text = 0;

      if (address(token) == 0) {
        cp_text = 7;
        return;
      }

      // check proof
      Header header = headers[_bn];
      bool validProof = checkProof(header.merkleRootHash, _rawTx, _proof, false);
      if ( validProof == false ) {
        cp_text = 3;
        return;
      }
      cp_text = 4;

      if ( exitRecords[_bn][_txIdx] != 0 ) {
        cp_text = 5;
        return;
      }

      cp_text = 6;

      exitRecords[_bn][_txIdx] = 1;
      TokenReceiver(token).transfer(_address, _value);
      /* token.transfer(_address, _value); */

      ExitFromChildEvent( _address, _value, _bn, _txIdx );
  }

  // move token after check
  function exitFromChild2(
    uint256 _bn,
    uint32 _txIdx,
    bytes _rawTx,
    bytes _proof,
    address _address,
    uint256 _value
    ) {

      cp_text = 0;

      // check proof
      Header header = headers[_bn];
      bool validProof = checkProof(header.merkleRootHash, _rawTx, _proof, false);
      if ( validProof == false ) {
        cp_text = 3;
        return;
      }
      cp_text = 4;

      if ( exitRecords[_bn][_txIdx] != 0 ) {
        cp_text = 5;
        return;
      }

      exitRecords[_bn][_txIdx] = 1;
      TokenReceiver(token).transfer(_address, _value);
      /* token.transfer(_address, _value); */

      cp_text = 6;

      ExitFromChildEvent( _address, _value, _bn, _txIdx );
  }


  function tokenFallback(address _from, uint256 _value, bytes _data){

  }

}
