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
  const { subscriptionId, gasLane, callbackGasLimit, maxNFT } = process.env;
  let subId;
  if (chainId == 31337) {
    VRFCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
    VRFCoordinatorV2Address = VRFCoordinatorV2.address;
    const tx = await VRFCoordinatorV2.createSubscription();
    const txReciept = await tx.wait(1);
    subId = txReciept.events[0].args.subId;
  } else {
    VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subId = subscriptionId;
  }
  console.log("----Deploying----");
  const IpfsNFTContract = await deploy("IpfsNFT", {
    from: deployer,
    log: true,
    args: [
      VRFCoordinatorV2Address,
      subId.toString(),
      gasLane.toString(),
      callbackGasLimit.toString(),
      maxNFT.toString(),
      charTokenURIs,
    ],
    waitConfimations: 1,
  });
  if (chainId == 31337) {
    await VRFCoordinatorV2.addConsumer(subId, IpfsNFTContract.address);
  }

  console.log("----Deployment Was Successful----");
  if (!developmentChains.includes(network.name)) {
    console.log("-----Verifying-----");
    verify(IpfsNFTContract.address, []);
    console.log("----Verification was Successful----");
  }
};

module.exports.tags = ["all", "game", "main"];
