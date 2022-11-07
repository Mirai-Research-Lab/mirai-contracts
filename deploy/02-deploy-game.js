const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const {
  TOKEN_NEED_TO_PLAY,
  TOKEN_AMOUNT_GIVEN_TO_PLAYER,
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
    MockV3AggregatorAddress = networkConfig[chainId].MockV3AggregatorAddress;
  }

  console.log("----Deploying----");
  const marketplace = await deploy("GameContract", {
    from: deployer,
    log: true,
    args: [
      TOKEN_AMOUNT_GIVEN_TO_PLAYER,
      TOKEN_NEED_TO_PLAY,
      MockV3AggregatorAddress,
    ],
    waitConfimations: 1,
  });

  console.log("----Deployment Was Successful----");
  if (!developmentChains.includes(network.name)) {
    console.log("-----Verifying-----");
    verify(marketplace.address, []);
    console.log("----Verification was Successful----");
  }
};

module.exports.tags = ["all", "game", "main"];
