const {
  frontEndContractsFile,
  frontEndAbiLocation,
} = require("../helper-hardhat-config");
require("dotenv").config();
const fs = require("fs");
const { network, ethers } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END == "true") {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Front end written!");
  } else {
    console.log("No update frontend!");
  }
};

async function updateAbi() {
  const nftMarketplace = await ethers.getContract("Marketplace");
  fs.writeFileSync(
    `${frontEndAbiLocation}Marketplace.json`,
    nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
  );

  const gameContract = await ethers.getContract("GameContract");
  fs.writeFileSync(
    `${frontEndAbiLocation}GameContract.json`,
    gameContract.interface.format(ethers.utils.FormatTypes.json)
  );

  const IpfsNFT = await ethers.getContract("IpfsNFT");
  fs.writeFileSync(
    `${frontEndAbiLocation}IpfsNFT.json`,
    IpfsNFT.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddresses() {
  const chainId = network.config.chainId.toString();
  const nftMarketplace = await ethers.getContract("Marketplace");
  const gameContract = await ethers.getContract("GameContract");
  const IpfsNFT = await ethers.getContract("IpfsNFT");

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["Marketplace"].includes(
        nftMarketplace.address
      )
    ) {
      contractAddresses[chainId]["Marketplace"].push(nftMarketplace.address);
    }
    if (
      !contractAddresses[chainId]["GameContract"].includes(gameContract.address)
    ) {
      contractAddresses[chainId]["GameContract"].push(gameContract.address);
    }
    if (!contractAddresses[chainId]["IpfsNFT"].includes(IpfsNFT.address)) {
      contractAddresses[chainId]["IpfsNFT"].push(IpfsNFT.address);
    }
  } else {
    contractAddresses[chainId]["Marketplace"] = [gameContract.address];
    contractAddresses[chainId]["GameContract"] = [gameContract.address];
    contractAddresses[chainId]["IpfsNFT"] = [IpfsNFT.address];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend", "main"];
