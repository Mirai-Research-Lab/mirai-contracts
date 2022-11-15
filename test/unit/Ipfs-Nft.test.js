const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("IpfsNft Unit Tests", function () {
      let IpfsNft, VRFCoordinatorV2Mock;
      let tokenId = "0";
      let accounts, deployer, user;
      beforeEach(async () => {
        accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        IpfsNft = await ethers.getContract("IpfsNFT", deployer);
        VRFCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("Testing The Constructor", function () {
        it("Should set corrector intiailizer variables", async function () {
          assert.equal((await IpfsNft.getTokenCounter()).toString(), "0");
        });
      });

      describe("Testing the staticMint function", function () {
        it("Should emit the event NftRequested", async function () {
          expect(await IpfsNft.staticMint()).to.emit(IpfsNft, "Nft_Minted");
        });

        it("Should increment the token counter", async function () {
          const tx = await IpfsNft.staticMint();
          const receipt = await tx.wait(1);
          const receiptId = receipt.events[1].args[2];

          assert.equal((await IpfsNft.getTokenCounter()).toString(), "1");
        });
      });
    });
