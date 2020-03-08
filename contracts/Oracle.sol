pragma solidity >=0.4.21 <0.7.0;

contract Oracle {
  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  function getOwner() public view returns (address _owner) {
    _owner = owner;
  }
}
