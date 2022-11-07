const { network, ethers } = require("hardhat");
const {
  developmentChains,
  charTokenURIs,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  let VRFCoordinatorV2;
  let VRFCoordinatorV2Address;

  if (chainId == 31337) {
    VRFCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
    VRFCoordinatorV2Address = VRFCoordinatorV2.address;
  } else {
    VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
  }
  const { subscriptionId, gasLane, callbackGasLimit, maxNFT } = process.env;
  console.log("----Deploying----");
  const IpfsNFTContract = await deploy("IpfsNFT", {
    from: deployer,
    log: true,
    args: [
      VRFCoordinatorV2Address,
      subscriptionId.toString(),
      gasLane.toString(),
      callbackGasLimit.toString(),
      maxNFT.toString(),
      charTokenURIs,
    ],
    waitConfimations: 1,
  });
  const consumerTx = await VRFCoordinatorV2.addConsumer(
    subscriptionId,
    IpfsNFTContract.address
  );

  console.log("----Deployment Was Successful----");
  if (!developmentChains.includes(network.name)) {
    console.log("-----Verifying-----");
    verify(IpfsNFTContract.address, []);
    console.log("----Verification was Successful----");
  }
};

module.exports.tags = ["all", "game", "main"];
