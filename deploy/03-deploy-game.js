const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const {
  TOKEN_NEEDED_TO_PLAY,
  TOKEN_AMOUNT_GIVEN_TO_PLAYER,
  INITIAL_TOKEN_SUPPLY,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  let MockV3Aggregator;
  let MockV3AggregatorAddress;

  if (chainId == 31337) {
    MockV3Aggregator = await ethers.getContract("MockV3Aggregator");
    MockV3AggregatorAddress = MockV3Aggregator.address;
  } else {
    MockV3AggregatorAddress = networkConfig[chainId].ethUsdPriceFeed;
  }
  const args = [
    TOKEN_AMOUNT_GIVEN_TO_PLAYER,
    TOKEN_NEEDED_TO_PLAY,
    INITIAL_TOKEN_SUPPLY,
    MockV3AggregatorAddress,
  ];
  console.log("----Deploying----");
  const gameContract = await deploy("GameContract", {
    from: deployer,
    log: true,
    args: args,
    waitConfimations: 1,
  });

  console.log("----Deployment Was Successful----");
  if (!developmentChains.includes(network.name)) {
    console.log("-----Verifying-----");
    verify(gameContract.address, []);
    console.log("----Verification was Successful----");
  }
};

module.exports.tags = ["all", "game", "main"];
