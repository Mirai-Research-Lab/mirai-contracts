const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 0;

async function buyItem() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const IpfsNft = await ethers.getContract("IpfsNft");
  const listing = await nftMarketplace.getListing(IpfsNft.address, TOKEN_ID);

  const price = listing.price.toString();
  const tx = await nftMarketplace.buyItem(IpfsNft.address, TOKEN_ID, {
    value: price,
  });
  await tx.wait(1);
  console.log("NFT Bought!");
  if (network.config.chainId == "31337") {
    await moveBlocks(2, (sleepAmount = 1000));
  }
}

buyItem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
