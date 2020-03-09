pragma solidity >=0.4.21 <0.7.0;

contract Oracle {
  uint256 public totalMintedSupply;               // The current total minted supply
  uint256 public requiredStakeAmount;             // Amount of ETH required to begin staking
  uint256 public requestAmount;                   // Amount in ETH required for a request

  mapping(address => bool) public pendingStakers; // Stakers who have paid ETH but not begun

  constructor(uint256 _requiredStakeAmount, uint256 _requestAmount) public {
    totalMintedSupply = 0;
    requiredStakeAmount = _requiredStakeAmount;
    requestAmount = _requestAmount;
  }

  function requestData() public payable returns (uint256 _value) {
    require(msg.value == requestAmount, "You must send the request amount to get the data!");

    _value = 123;
  }

  function submitIntentionToStake() public payable {
    require(msg.value == requiredStakeAmount, "You must the required amount to begin staking!");

    pendingStakers[msg.sender] = true;
  }
}
