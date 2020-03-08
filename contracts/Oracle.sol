pragma solidity >=0.4.21 <0.7.0;

contract Oracle {
  uint256 public requestAmount;

  constructor(uint256 _requestAmount) public {
    requestAmount = _requestAmount;
  }

  function requestData() public payable returns (uint256 _value) {
    require(msg.value == requestAmount, "You must send the request amount to get the data!");

    _value = 123;
  }
}
