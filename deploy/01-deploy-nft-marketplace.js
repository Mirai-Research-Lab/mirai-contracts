const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  console.log("----Deploying----");
  const marketplace = await deploy("Marketplace", {
    from: deployer,
    log: true,
    args: [],
    waitConfimations: 1,
  });
  console.log("----Deployment Was Successful----");
  if (!developmentChains.includes(network.name)) {
    console.log("-----Verifying-----");
    verify(marketplace.address, []);
    console.log("----Verification was Successful----");
  }
};

module.exports.tags = ["all", "marketplace", "main"];
