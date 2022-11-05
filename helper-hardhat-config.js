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
      vrfCoordinatorV2: "VRFCOORDINATOR_ADDRESS",
      gasLane: "GOERLI_GAS_LANE_ADDRESS",
      callbackGasLimit: "500000",
      mintFee: "MINT_FEE",
      subscriptionId: "VRF_COORDINATOR_SUBSCRIPTION_ID",
    },
  },
};
const DECIMALS = "18";
const INITIAL_PRICE = "100000000000000000000";
const INITIAL_TOKEN_SUPPLY = "100000";
const TOKEN_NEEDED_TO_PLAY = "20";

const developmentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
  INITIAL_TOKEN_SUPPLY,
  TOKEN_NEEDED_TO_PLAY,
};
