pragma solidity ^0.4.18;

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

contract PlasmaChild {

  // library
  using Bytes for *;

  // deposit
  uint256 public lastEthBlockNumber = block.number;
  uint256 public depositCounterInBlock = 0;
  mapping (uint256 => DepositRecord) public depositRecords;
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
  // when someone deposit
  event DepositEvent(address indexed _from, uint256 indexed _amount, uint256 indexed _depositIndex);
  // function deposit(uint256 _amount) public returns (uint256 idx1, uint256 idx2, uint256 idx3) public onlyToken {
  /* function deposit(address _address, uint256 _amount) public returns (uint256 idx1, uint256 idx2, uint256 idx3) { */
  function deposit(address _address, uint256 _amount) public returns (uint256 idx) {
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
  // update deposit record
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

  // new block number (lastEventProcessedBlockPrefix)
  uint32 lastEventProcessedBlockNumber;

  // last block number;
  uint32 lastPlasmaBlockNumber;

  // last block hash
  bytes32 lastPlasmaBlockHash;

  // current block number
  uint32 public currentPlasmaBlockNumber = 1;

  // structs

  // header
  struct PlasmaBlockHeader {
    uint32 blockNumber;
    uint32 numTransactions;
    bytes32 previousBlockHash;
    bytes32 merkleRootHash;
    uint8 v;
    bytes32 r;
    bytes32 s;
  }
  mapping (uint32 => PlasmaBlockHeader) public plasmaBlockHeaders;

  // Owner Address
  address public ownerAddress;

  // Modifiers
  modifier onlyOwner {
    if (msg.sender != ownerAddress) revert();
    _;
  }

  // Constructor
  function PlasmaChild() public {
    ownerAddress = msg.sender;
  }

  // update plasma header once block is created
  function updatePlasmaBlockHeader(
    uint32 _bn,
    uint32 _txCount,
    bytes32 _parentHash,
    bytes32 _merkleRootHash,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
    ) onlyOwner public returns (bool success) {

      PlasmaBlockHeader ph = plasmaBlockHeaders[_bn];
      ph.blockNumber = _bn;
      ph.previousBlockHash = _parentHash;
      ph.merkleRootHash = _merkleRootHash;
      ph.v = _v;
      ph.r = _r;
      ph.s = _s;

      return true;
  }

  // convenient function for debugging
  function updateNumTransactions(uint32 _bn, uint32 _txCount) onlyOwner public returns(bool success) {
    PlasmaBlockHeader ph = plasmaBlockHeaders[_bn];
    ph.numTransactions = _txCount;
    return true;
  }

  // create next block
  function createNextBlock() onlyOwner public returns (bool success) {

    currentPlasmaBlockNumber = currentPlasmaBlockNumber + 1;
    PlasmaBlockHeader ph = plasmaBlockHeaders[currentPlasmaBlockNumber];
    ph.blockNumber = currentPlasmaBlockNumber;

    return true;
  }

  // get block number and transactions of last block
  function getLastBlockNumberandTXcount() public view returns (uint32 _bn, uint32 _numTxs ) {
    if ( currentPlasmaBlockNumber == 0) revert();
    uint32 lastPlasmaBlockNumber = currentPlasmaBlockNumber - 1;
    PlasmaBlockHeader ph = plasmaBlockHeaders[lastPlasmaBlockNumber];
    return ( lastPlasmaBlockNumber, ph.numTransactions);
  }

  // get block number and transactions of current block
  function getCurrentBlockNumberandTXcount() public view returns (uint32 _bn, uint32 _numTxs ) {
    // block number start from 1
    if ( currentPlasmaBlockNumber == 0) revert();
    /* uint32 lastPlasmaBlockNumber = currentPlasmaBlockNumber - 1; */
    PlasmaBlockHeader ph = plasmaBlockHeaders[currentPlasmaBlockNumber];
    return ( currentPlasmaBlockNumber, ph.numTransactions);
  }

  // plasma event
  event PlasmaTransactionEvent(uint32 txIdx, uint32 currentPlasmaBlockNumber, bytes txData);

  // array of plasma transactions
  mapping (uint32 => bytes[]) public plasmaTransactions;

  // add transactin
  function submitPlasmaTransaction(bytes txData) onlyOwner public returns (bool success) {

    // get plasma block header with current plasma block number
    PlasmaBlockHeader ph = plasmaBlockHeaders[currentPlasmaBlockNumber];
    // increase number of transactions
    uint32 lastNumTransactions = ph.numTransactions;
    ph.numTransactions = ph.numTransactions + 1;

    // add transaction
    plasmaTransactions[currentPlasmaBlockNumber].push(txData);

    // send event
    PlasmaTransactionEvent(lastNumTransactions, currentPlasmaBlockNumber, txData);

    return true;
  }

  // change ownerheaders
  function transferOwner(address _address) public onlyOwner {
    ownerAddress = _address;
  }

  // kill contract itself
  function kill() onlyOwner public {
      selfdestruct(ownerAddress);
  }

  function setCurrentPlasmaBlockNumber(uint32 _number) onlyOwner public returns (bool success) {
    currentPlasmaBlockNumber = _number;
    return true;
  }

  // fallback for ether
  function() payable public {
    revert();
  }
}
