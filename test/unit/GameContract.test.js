const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Game Unit Tests", function () {
      let gameContract, gameContractContract, IpfsNft, IpfsNftContract;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        console.log("deployer", deployer.address);
        console.log("user", user.address);
        await deployments.fixture(["all"]);
        gameContractContract = await ethers.getContract("GameContract");
        gameContract = gameContractContract.connect(deployer);
        IpfsNftContract = await ethers.getContract("IpfsNFT");
        IpfsNft = IpfsNftContract.connect(deployer);
      });

      describe("buyToken", function () {
        it("emits an event after buying a token", async function () {
          expect(await gameContract.buyToken(user.address)).to.emit(
            "TokenBought"
          );
        });

        it("price should be above zero", async function () {
          console.log("lol");
          await expect(
            gameContract.buyToken(user.address, -1)
          ).to.be.revertedWith("Marketplace__PriceShouldBeAboveZero");
        });

        it("exclusively allows owners to list", async function () {
          gameContract = gameContractContract.connect(user);
          await IpfsNft.approve(user.address, TOKEN_ID);
          await expect(
            gameContract.buyToken(user.address, PRICE)
          ).to.be.revertedWith("NotOwner");
        });

        it("needs approvals to list item", async function () {
          await IpfsNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            gameContract.buyToken(user.address, PRICE)
          ).to.be.revertedWith("Marketplace__NotAppoved()");
        });

        it("Updates listing with seller and price", async function () {
          await gameContract.buyToken(user.address, PRICE);
          const listing = await gameContract.getListing(
            IpfsNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == deployer.address);
        });
      });
    });
