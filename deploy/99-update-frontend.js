const {
  frontEndContractsFile,
  frontEndAbiLocation,
} = require("../helper-hardhat-config");
require("dotenv").config();
const fs = require("fs");
const { network } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Front end written!");
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

  const miraiToken = await ethers.getContract("MiraiToken");
  fs.writeFileSync(
    `${frontEndAbiLocation}MiraiToken.json`,
    miraiToken.interface.format(ethers.utils.FormatTypes.json)
  );

  const priceConverter = await ethers.getContract("PriceConverter");
  fs.writeFileSync(
    `${frontEndAbiLocation}PriceConverter.json`,
    priceConverter.interface.format(ethers.utils.FormatTypes.json)
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
  const priceConverter = await ethers.getContract("PriceConverter");
  const IpfsNFT = await ethers.getContract("IpfsNFT");
  const miraiToken = await ethers.getContract("MiraiToken");

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
    if (
      !contractAddresses[chainId]["MiraiToken"].includes(miraiToken.address)
    ) {
      contractAddresses[chainId]["MiraiToken"].push(miraiToken.address);
    }
    if (
      !contractAddresses[chainId]["PriceConverter"].includes(
        priceConverter.address
      )
    ) {
      contractAddresses[chainId]["PriceConverter"].push(priceConverter.address);
    }
  } else {
    contractAddresses[chainId]["Marketplace"] = [nftMarketplace.address];
    contractAddresses[chainId]["GameContract"] = [gameContract.address];
    contractAddresses[chainId]["IpfsNFT"] = [IpfsNFT.address];
    contractAddresses[chainId]["MiraiToken"] = [miraiToken.address];
    contractAddresses[chainId]["PriceConverter"] = [priceConverter.address];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "frontend"];
