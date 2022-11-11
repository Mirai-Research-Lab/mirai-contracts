// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MiraiToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("Mirai", "MRI") {
    _mint(msg.sender, initialSupply);
  }

  function customApprove(
    address owner,
    address spender,
    uint256 amount
  ) public returns (bool) {
    _approve(owner, spender, amount);
    return true;
  }
}
