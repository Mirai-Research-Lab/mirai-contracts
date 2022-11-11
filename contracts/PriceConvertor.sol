// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

library PriceConverter {
  function getPrice(
    AggregatorV3Interface priceFeed
  ) internal view returns (uint256) {
    (, int256 answer, , , ) = priceFeed.latestRoundData();
    // ETH/USD in 10^8 digit
    return uint256(answer);
  }

  function getResponseDecimals(
    AggregatorV3Interface priceFeed
  ) internal view returns (uint256) {
    return priceFeed.decimals();
  }

  // 1000000000
  function getConversionRate(
    uint256,
    AggregatorV3Interface priceFeed
  ) internal view returns (uint256) {
    uint256 ethPrice = getPrice(priceFeed);
    return ethPrice;
  }
}
