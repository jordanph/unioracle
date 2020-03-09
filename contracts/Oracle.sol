pragma solidity >=0.4.21 <0.7.0;

import { SafeMath } from "./vendors/SafeMath.sol";

contract Oracle {
  uint256 public totalStakeIntentionSupply;       // The current total ETH in waiting

  uint256 public totalMintedSupply;               // The current total minted supply
  uint256 public requiredStakeAmount;             // Amount of ETH required to begin staking
  uint256 public requestAmount;                   // Amount in ETH required for a request

  enum StakerType {
    INACTIVE,
    PENDING,
    ACTIVE
  }

  mapping(address => StakerType) public stakers;  // Current stakers
  mapping(address => uint256) public balanceOf;   // Balance of the staker

  constructor(uint256 _requiredStakeAmount, uint256 _requestAmount) public {
    totalStakeIntentionSupply = 0;
    totalMintedSupply = 0;
    requiredStakeAmount = _requiredStakeAmount;
    requestAmount = _requestAmount;
  }

  function activateStake() public {
    require(stakers[msg.sender] == StakerType.PENDING, "Must intially be a pending staker to activate...");

    if(totalMintedSupply > 0) {
      uint256 currentBalance = address(this).balance - totalStakeIntentionSupply;
      uint256 mintAmount = SafeMath.mul(requiredStakeAmount, totalMintedSupply)/currentBalance;

      totalMintedSupply = SafeMath.add(totalMintedSupply, mintAmount);
      balanceOf[msg.sender] = SafeMath.add(balanceOf[msg.sender], mintAmount);
    } else {
      uint256 initialMinted = requiredStakeAmount;
      totalMintedSupply = initialMinted;
      balanceOf[msg.sender] = initialMinted;
    }

    stakers[msg.sender] = StakerType.ACTIVE;
    totalStakeIntentionSupply -= requiredStakeAmount;
  }

  function requestData() public payable returns (uint256 _value) {
    require(msg.value == requestAmount, "You must send the request amount to get the data!");

    _value = 123;
  }

  function submitIntentionToStake() public payable {
    require(msg.value == requiredStakeAmount, "You must send the required amount to begin staking!");
    require(stakers[msg.sender] == StakerType.INACTIVE, "You must not be in a pending or active state.");

    totalStakeIntentionSupply += msg.value;

    stakers[msg.sender] = StakerType.PENDING;
  }
}
