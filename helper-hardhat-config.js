const networkConfig = {
  31337: {
    name: "localhost",
    ethUsdPriceFeed: "PRICE_FEED_ADDRESS_AFTER_LOCAL_DEPLOYMENT",
    gasLane: "HARDHAT_GAS_LANE_ADDRESS",
    mintFee: "MINT_FEE",
    callbackGasLimit: "500000",
    5: {
      name: "goerli",
      ethUsdPriceFeed: "PRICE_FEED_ADDRESS",
      vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
      gasLane: "GOERLI_GAS_LANE_ADDRESS",
      callbackGasLimit: "500000",
      mintFee: "MINT_FEE",
      subscriptionId: "VRF_COORDINATOR_SUBSCRIPTION_ID",
    },
  },
};
const DECIMALS = "18";
const INITIAL_PRICE = "INITIAL_PRICE";
const developmentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
};
