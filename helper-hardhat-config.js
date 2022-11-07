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
const INITIAL_PRICE = "100000000000000000000";
const INITIAL_TOKEN_SUPPLY = "1000000000000000000000000";
const TOKEN_AMOUNT_GIVEN_TO_PLAYER = "20";
const TOKEN_NEEDED_TO_PLAY = "10";

const developmentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
  INITIAL_TOKEN_SUPPLY,
  TOKEN_AMOUNT_GIVEN_TO_PLAYER,
  TOKEN_NEEDED_TO_PLAY,
};
