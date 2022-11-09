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
      describe("Testing the requestNft function", function () {
        it("Should emit the event NftRequested", async function () {
          expect(await IpfsNft.requestNft()).to.emit(IpfsNft, "NftRequested");
        });
        it("Should increment the token counter", async function () {
          const tx = await IpfsNft.requestNft();
          const receipt = await tx.wait(1);
          const receiptId = receipt.events[1].args[2];

          const tx2 = await VRFCoordinatorV2Mock.fulfillRandomWords(
            receiptId,
            IpfsNft.address
          );
          await tx2.wait(1);

          assert.equal((await IpfsNft.getTokenCounter()).toString(), "1");
        });
      });
      describe("Testing the fulfillRandomWords function", function () {
        it("Should emit the event NftCreated", async function () {
          const requestTx = await IpfsNft.requestNft();
          const reqeustReciept = await requestTx.wait(1);
          expect(
            await VRFCoordinatorV2Mock.fulfillRandomWords(
              reqeustReciept.events[1].args[2],
              IpfsNft.address
            )
          ).to.emit(IpfsNft, "NftCreated");
        });
        it("Should mint a token", async function () {
          const requestTx = await IpfsNft.requestNft();
          const reqeustReciept = await requestTx.wait(1);
          const nftTx = await VRFCoordinatorV2Mock.fulfillRandomWords(
            reqeustReciept.events[1].args[2],
            IpfsNft.address
          );
          await nftTx.wait(1);
          assert.equal(
            (await IpfsNft.balanceOf(deployer.address)).toString(),
            "1"
          );
        });
      });
    });
