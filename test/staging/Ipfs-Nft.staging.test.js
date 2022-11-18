const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  TOKEN_AMOUNT_GIVEN_TO_PLAYER,
  TOKEN_NEEDED_TO_PLAY,
  DECIMALS,
} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Ipfs Nft Staging Test", function () {
      let ipfsNft, deployer;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        ipfsNft = await ethers.getContractAt(
          "IpfsNFT",
          "0x3187669D3f8f0E5EAA199ca08626F96E8c06F99E"
        );
      });

      it("can mint nft using vrf", async () => {
        const tx = await ipfsNft.requestNft({ gasLimit: 500000 });
        await tx.wait(1);
        assert.equal((await ipfsNft.getTokenCounter()).toString(), "1");
      });
    });
