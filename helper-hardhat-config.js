const networkConfig = {
  31337: {
    name: "localhost",
    ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    mintFee: "0",
    callbackGasLimit: "500000",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "500000",
    mintFee: "0",
    subscriptionId: process.env.subscriptionId,
  },
};
const DECIMALS = "18";
const INITIAL_PRICE = "100000000000000000000";
const INITIAL_TOKEN_SUPPLY = "100000";
const TOKEN_AMOUNT_GIVEN_TO_PLAYER = "20";
const TOKEN_NEEDED_TO_PLAY = "10";
const charTokenURIs = [
  "https://ipfs.io/ipfs/QmcmUUQ1KPWtdzKJTaFFg5Y56wxWZRMiC1dapysW6grRe7",
  "https://ipfs.io/ipfs/QmcmUUQ1KPWtdzKJTaFFg5Y56wxWZRMiC1dapysW6grRe7",
  "https://ipfs.io/ipfs/QmcmUUQ1KPWtdzKJTaFFg5Y56wxWZRMiC1dapysW6grRe7",
];
const developmentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
  INITIAL_TOKEN_SUPPLY,
  TOKEN_AMOUNT_GIVEN_TO_PLAYER,
  TOKEN_NEEDED_TO_PLAY,
  charTokenURIs,
};
