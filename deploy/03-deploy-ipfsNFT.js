const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/upload-to-pinata");
const { tokenUris } = require("../nft-uri/nft-uri");

const imagesPath = "./images/";
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [{}],
};

let tokenUris = tokenUris;

const FUND_AMOUNT = "10000000000000000000"; //10 LINK
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Mock;

  if (process.env.UPLOAD_TO_PINATA == "no") {
    tokenUris = await handleTokenUris();
  }

  let vrfCoordinatorV2Address;
  let subscriptionId;
  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock",
      deployer
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReciept = await tx.wait(1);
    subscriptionId = txReciept.events[0].args[0];
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }
  log("------------------------------------------");
  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId].gasLane,
    networkConfig[chainId].callbackGasLimit,
    tokenUris.length,
    tokenUris,
  ];

  const ipfsNft = await deploy("IpfsNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("--------------------------------------------");
  if (developmentChains.includes(network.name)) {
    const tx = await vrfCoordinatorV2Mock.addConsumer(
      subscriptionId,
      ipfsNft.address
    );
    await tx.wait(1);
  }
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("...verifying...");
    await verify(ipfsNft.address, args);
  }
};

async function handleTokenUris() {
  const { responses, files } = await storeImages(imagesPath);
  const tokenUris = [];

  for (responseIndex in responses) {
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name =
      files[responseIndex].replace(".webp", "") || "Another cool NFT";
    tokenUriMetadata.description = `${tokenUriMetadata.name} just joined you on your adventure`;
    tokenUriMetadata.image = `ipfs://${responses[responseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const uploadedMetadataResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUris.push(`ipfs://${uploadedMetadataResponse.IpfsHash}`);
  }
  console.log("Token URIs are uploaded!");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "ipfs"];
