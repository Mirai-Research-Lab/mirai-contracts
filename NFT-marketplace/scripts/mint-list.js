const { ethers, network } = require("hardhat");
const { moveBlocks, sleep } = require("../utils/move-blocks");
async function main() {
  const nftContract = await ethers.getContract("DefaultNFT");
  const marketplaceContract = await ethers.getContract("Marketplace");
  console.log("----Minting----");
  const mintTx = await nftContract.mintNft();
  const mintReceipt = await mintTx.wait(1);
  console.log(mintReceipt.events[0].args);
  const tokenId = mintReceipt.events[0].args.tokenId;
  console.log("----Successfully Minted----");
  console.log("----Approving Marketplace----");
  const approveTx = await nftContract.approve(
    marketplaceContract.address,
    tokenId
  );
  await approveTx.wait(1);
  console.log("----Successfully approved----");
  console.log("----Adding The Item In The Marketplace----");
  const PRICE = ethers.utils.parseEther("0.01");
  const listingTx = await marketplaceContract.listItem(
    nftContract.address,
    tokenId,
    PRICE
  );
  await listingTx.wait(1);
  console.log("----Successfully Added----");
  if (network.config.chainId === 31337) {
    await moveBlocks(2, (sleepAmount = 1000));
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
