pragma solidity ^0.4.18;

contract TokenReceiver {
  function tokenFallback(address _from, uint256 _value, bytes _data);
  function deposit(address _from, uint256 _value) returns (uint256 depositIndex);
}

//
contract TokenParent {

  // ERC20 State
  mapping (address => uint256) public balances;
  mapping (address => mapping (address => uint256)) public allowances;
  uint256 public totalSupply;

  // Human State
  string public name;
  uint8 public decimals;
  string public symbol;
  string public version;

  // Minter State
  address public centralMinter;

  // Backed By Ether State
  bool public onSale;
  uint256 public buyPrice;
  uint256 public sellPrice;

  // Modifiers
  modifier onlyMinter {
    if (msg.sender != centralMinter) revert();
    _;
  }

  // ERC20 Events
  event Transfer(address indexed _from, address indexed _to, uint256 _value, bytes _data);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  // Constructor
  function TokenParent() public {
    balances[msg.sender] = 90000000000;
    totalSupply = 90000000000;
    name = "Hydra Mainnet Token";
    decimals = 18;
    symbol = "HYD";
    version = "0.1";
    centralMinter = msg.sender;
    buyPrice = 100000000000000;
    sellPrice = 90000000000000;
    onSale = false;
  }

  // check if address is contract or not
  function isContract(address _address) private view returns (bool is_contract) {
      uint length;
      assembly {
          length := extcodesize(_address)
      }
      if (length > 0) {
          return true;
      } else {
          return false;
      }
  }

  // ERC20 Methods
  function balanceOf(address _address) constant public returns (uint256 balance) {
    return balances[_address];
  }

  function allowance(address _owner, address _spender) constant public returns (uint256 remaining) {
    return allowances[_owner][_spender];
  }

  // ERC 20
  function transfer(address _to, uint256 _value) public returns (bool success) {
    return transfer(_to, _value, "");
  }

  // ERC 223
  function transfer(address _to, uint256 _value, bytes _data) public returns (bool success) {

    if (isContract(_to)) {

      if(balances[msg.sender] < _value) revert();
      if(balances[_to] + _value < balances[_to]) revert();
      balances[msg.sender] -= _value;
      balances[_to] += _value;

      // call tokenFallback on token
      TokenReceiver receiver = TokenReceiver(_to);
      receiver.tokenFallback(msg.sender, _value, _data);

      Transfer(msg.sender, _to, _value, _data);
      return true;
    } else {
      // nomal address
      if(balances[msg.sender] < _value) revert();
      if(balances[_to] + _value < balances[_to]) revert();
      balances[msg.sender] -= _value;
      balances[_to] += _value;
      Transfer(msg.sender, _to, _value, "");
      return true;
    }
  }

  //
  // Plasma
  //

  // deposit event
  event DepositEvent(address indexed _from, uint256 indexed _amount, uint256 indexed _depositIndex);

  // deposit token on plasma contract
  function deposit(address _to, uint256 _value) public returns (bool success) {

    if(balances[msg.sender] < _value) revert();
    if(balances[_to] + _value < balances[_to]) revert();
    balances[msg.sender] -= _value;
    balances[_to] += _value;

    // call tokenFallback on token
    TokenReceiver receiver = TokenReceiver(_to);
    uint256 depositIndex = receiver.deposit(msg.sender, _value);

    // send event
    Transfer(msg.sender, _to, _value, "deposit");
    /* DepositEvent(msg.sender, _value, depositIndex); */

    return true;
  }


  function approve(address _spender, uint256 _value) public returns (bool success) {
    allowances[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  function transferFrom(address _owner, address _to, uint256 _value) public returns (bool success) {
    if(balances[_owner] < _value) revert();
    if(balances[_to] + _value < balances[_to]) revert();
    if(allowances[_owner][msg.sender] < _value) revert();
    balances[_owner] -= _value;
    balances[_to] += _value;
    allowances[_owner][msg.sender] -= _value;

    Transfer(_owner, _to, _value, "transferFrom");
    return true;
  }

  // Minter Functions
  function mint(uint256 _amountToMint) public onlyMinter {
    balances[centralMinter] += _amountToMint;
    totalSupply += _amountToMint;
    Transfer(this, centralMinter, _amountToMint, "mint");
  }

  function transferMinter(address _newMinter) public onlyMinter {
    centralMinter = _newMinter;
  }

  // Backed By Ether Methods
  // Must create the contract so that it has enough Ether to buy back ALL tokens on the market, or else the contract will be insolvent and users won't be able to sell their tokens
  function setPrices(uint256 _newSellPrice, uint256 _newBuyPrice) public onlyMinter {
    sellPrice = _newSellPrice;
    buyPrice = _newBuyPrice;
  }

  // update onSale
  function updateSaleState(bool _onSale) public onlyMinter returns (bool success) {
    onSale = _onSale;
    return true;
  }

  // buy token with ether
  function buy() payable public returns (uint amount) {
    amount = msg.value / buyPrice;
    if(balances[centralMinter] < amount) revert();            // Validate there are enough tokens minted
    balances[centralMinter] -= amount;
    balances[msg.sender] += amount;
    Transfer(centralMinter, msg.sender, amount, "buy");
    return amount;
  }

  // sell token to get ether
  function sell(uint _amount) public returns (uint revenue) {
    if (balances[msg.sender] < _amount) revert();            // Validate sender has enough tokens to sell
    balances[centralMinter] += _amount;
    balances[msg.sender] -= _amount;
    revenue = _amount * sellPrice;
    if (!msg.sender.send(revenue)) {
      revert();
    } else {
      Transfer(msg.sender, centralMinter, _amount, "sell");
      return revenue;
    }
  }

  // kill contract itself
  function kill() onlyMinter public {
      selfdestruct(centralMinter);
  }

  // fallback for ether
  function() payable public {
    revert();
  }
}
