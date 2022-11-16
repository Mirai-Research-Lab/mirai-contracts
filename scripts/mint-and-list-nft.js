const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.01");

async function mintAndList() {
  const nftMarketplace = await ethers.getContract("Marketplace");
  let VRFCoordinatorV2Mock;
  if (network.config.chainId == 31337)
    VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  const IpfsNft = await ethers.getContract("IpfsNFT");

  console.log("Minting NFT...");
  const mintTx = await IpfsNft.staticMint({ gasLimit: 1000000 });
  const mintTxReceipt = await mintTx.wait(1);
  console.log(mintTx);
  console.log(mintTxReceipt);
  const tokenId = mintTxReceipt.events[1].args[1].toString();

  console.log("Approving NFT...");
  const approvalTx = await IpfsNft.approve(nftMarketplace.address, tokenId, {
    gasLimit: 100000,
  });
  await approvalTx.wait(1);

  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(IpfsNft.address, tokenId, PRICE);
  await tx.wait(1);
  console.log("NFT Listed!");

  if (network.config.chainId == 31337) {
    await moveBlocks(1, (sleepAmount = 1000));
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
