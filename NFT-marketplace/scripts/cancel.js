const { ethers, network } = require("hardhat");
const { moveBlocks, sleep } = require("../utils/move-blocks");

//set token-id by checking moralis server db
const TOKEN_ID = 0;

async function main() {
  const marketplaceContract = ethers.getContract("Marketplace");
  const nftContract = ethers.getContract("DefaultNFT");
  const tx = await marketplaceContract.cancelItem(
    nftContract.address,
    TOKEN_ID
  );
  await tx.wait(1);
  console.log("----Item Cancelled----");
  if (network.config.chainId == "31337") {
    await moveBlocks(2, (sleepAmount = 1000));
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
