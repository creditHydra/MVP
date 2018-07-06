pragma solidity ^0.4.18;


contract HydraManager {

  // users
  struct HydraUser {
    uint8 status; // 1: created, 2: requested, 3: verified, 4: rejected
    bytes32 phoneNumber;
    mapping (uint256 => MultiHash) userFiles;
    uint256 validatedAt;
    string name;
  }
  mapping (address => HydraUser) public addressToHydraUsers;
  mapping (bytes32 => address) public phoneToHydraUserAddresses;

  uint256 public userCount;

  address public oracleAddress;

  // Modifiers
  modifier onlyOracle {
    if (msg.sender != oracleAddress) revert();
    _;
  }

  // Constructor
  function HydraManager() public {
    oracleAddress = msg.sender;
  }

  struct MultiHash {
    bytes32 hash_val;
    uint8 hash_func;
    uint8 size;
    uint256 timestamp;
    uint8 status; // 0: uploaded, 1: validation requested, 2: validated, 9:rejected
    uint256 fileType; // 1: front, 2: left, 3: right, 4: driver's license
    uint256 docIdx; // document index on address
  }
  mapping (bytes32 => mapping(uint8 => address) ) public ipfsToHydraUserIds;
  mapping (address => MultiHash[]) public ipfsArray;
  mapping (address => uint256) public ipfsCount;


  uint256 public requestCounterInBlock = 0;
  uint256 public lastEthBlockNumber = block.number;

  // validation request
  struct ValidationRequest {
    address userAddr;
    uint8 status; // 0: default, 1: requested, 2: validated, 3: rejected
    uint256 timestamp;
  }
  mapping (uint256 => ValidationRequest) public validationRequests;


  // when request received
  event ValidationRequestEvent(address indexed _address, uint256 _requestIdx);

  // validation process is handled by tradiional db because of complexity
  function addValidationRequest(
      address _address
    ) public onlyOracle returns (bool success) {

    HydraUser user = addressToHydraUsers[_address];
    if (user.status == 0) revert();
    user.status = 2; // requested

    // generate unique number
    if (block.number != lastEthBlockNumber) {
        requestCounterInBlock = 0;
    }
    uint256 requestIdx = block.number << 32 + requestCounterInBlock;

    // add requet
    ValidationRequest memory vq = ValidationRequest({
      userAddr: _address,
      status: 2,
      timestamp: now
    });
    validationRequests[requestIdx] = vq;
    // increase counter
    requestCounterInBlock = requestCounterInBlock + 1;

    ValidationRequestEvent(_address, requestIdx);

    return true;
  }

  function validationCompleted(
      address _address,
      uint256 _requestIdx,
      uint8 _status,
      string _name
    ) public onlyOracle returns (bool success) {

    // request
    ValidationRequest vr = validationRequests[_requestIdx];
    if (vr.status == 0) revert();
    vr.status = _status;

    // user
    HydraUser user = addressToHydraUsers[_address];
    user.status = _status;
    user.name = _name;

    return true;
  }

  function getUser(address _address) public view returns (uint8 _status, bytes32 _phoneNumber, string _name) {
    HydraUser user = addressToHydraUsers[_address];
    return (user.status, user.phoneNumber, user.name);
  }

  // add new user
  function addNewUser(address _address, bytes32 _phoneNumber) public onlyOracle returns (bool success) {
    HydraUser user = addressToHydraUsers[_address];
    
    if (user.status != 0) revert();

    // create user
    user.status = 1;
    user.phoneNumber = _phoneNumber;

    phoneToHydraUserAddresses[_phoneNumber] = _address;

    userCount = userCount + 1;

    return true;
  }

  function updateUser(
    address _address,
    bytes32 _phoneNumber,
    string _name,
    uint8 _status) public onlyOracle returns (bool success) {

      HydraUser user = addressToHydraUsers[_address];
      if (user.status == 0) revert();

      user.name = _name;
      user.phoneNumber = _phoneNumber;
      user.status = _status;

      return true;
  }

  function deleteUser(address _address) public onlyOracle returns (bool success) {
    HydraUser user = addressToHydraUsers[_address];
    if (user.status == 0) revert();
    user.status = 0;

    /* addressToHydraUsers[_address] = address("0x0000000000000000000000000000000000000000");
    phoneToHydraUserAddresses[user.phoneNumber] = address("0x0000000000000000000000000000000000000000");
    ipfsArray[_address] =  */

  }

  // there are 2 types of file
  // Some images can have same fileType Others are not...
  function getUserFileWitType(
      address _address,
      uint256 _fileTypeInt
    ) public view returns (
      bytes32 _hash_val,
      uint8 _hash_func,
      uint8 _size,
      uint256 _timestamp,
      uint8 _status,
      uint256 _fileType,
      uint256 _docIdx
    ) {

    HydraUser user = addressToHydraUsers[_address];
    if (user.status == 0) revert();

    MultiHash mh = user.userFiles[_fileTypeInt];

    return ( mh.hash_val, mh.hash_func, mh.size, mh.timestamp, mh.status, mh.fileType, mh.docIdx );
  }

  // when file is uploaded
  event FileUploadedEvent(address _address, uint256 _docIdx);

  // file is uploaded on ipfs
  // type 1: front, 2: left, 3: right, 4: driver's license
  function fileUploaded(
      address _address,
      bytes32 _value,
      uint8 _func,
      uint8 _size,
      uint256 _fileType
    ) public onlyOracle returns (bool success) {
    // get user id

    HydraUser user = addressToHydraUsers[_address];
    if (user.status == 0) revert();

    // push ipfs hash if not exist
    if (ipfsToHydraUserIds[_value][_func] != 0) revert();

    // set userid
    ipfsToHydraUserIds[_value][_func] = _address;
    uint256 docIdx = ipfsCount[_address];

    MultiHash memory mh = MultiHash({
      hash_val: _value,
      hash_func: _func,
      size: _size,
      timestamp: now,
      status: 0,
      fileType: _fileType,
      docIdx: docIdx
    });
    ipfsArray[_address].push(mh);

    ipfsCount[_address] = ipfsCount[_address] + 1;

    user.userFiles[_fileType] = mh;

    FileUploadedEvent( _address, docIdx );

    return true;
  }

  function transferOracle(address _address) public onlyOracle {
    oracleAddress = _address;
  }

  // kill contract itself
  function kill() onlyOracle public {
      selfdestruct(oracleAddress);
  }

  // fallback for ether
  function() payable public {
    revert();
  }
}
