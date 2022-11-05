const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const {
  INITIAL_TOKEN_SUPPLY,
  TOKEN_NEED_TO_PLAY,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;

  console.log("----Deploying----");
  const marketplace = await deploy("GameContract", {
    from: deployer,
    log: true,
    args: [INITIAL_TOKEN_SUPPLY, TOKEN_NEED_TO_PLAY],
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
