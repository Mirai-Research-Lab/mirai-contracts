const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.01");

async function mintAndList() {
  const owner = await ethers.getSigners()[0];

  const nftMarketplace = await ethers.getContractAt(
    "Marketplace",
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  );
  let VRFCoordinatorV2Mock;
  if (network.config.chainId == 31337)
    VRFCoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
  const IpfsNft = await ethers.getContractAt(
    "IpfsNFT",
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  );
  IpfsNft.connect(owner);

  console.log("Minting NFT...");
  const mintTx = await IpfsNft.staticMint({ gasLimit: 1000000 });
  const mintTxReceipt = await mintTx.wait(1);
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
