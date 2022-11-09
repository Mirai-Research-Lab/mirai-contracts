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
  : describe("Game Contract Staging Test", function () {
      let gameContract, deployer, user, player1, player2, player3, IpfsNFT;
      beforeEach(async () => {
        gameContract = await ethers.getContract("GameContract", deployer);
        IpfsNFT = await ethers.getContract("IpfsNFT", deployer);
        deployer = (await getNamedAccounts()).deployer;
        let players = await ethers.getSigners();
        [deployer, user, player1, player2, player3] = players;
      });

      it("should distribute token on first intialization", async function () {
        const oldTokenBalance = await gameContract.getTokenOf(player1.address);
        console.log("TokenBalance Before Siging in", oldTokenBalance);

        const tx = await gameContract.signIn(player1.address);
        const txReciept = await tx.wait(1);
        const newTokenBalance = await IpfsNFT.getTokenOf(player1.address);
        console.log("Token Balance After Siging in", newTokenBalance);
        assert(newTokenBalance > oldTokenBalance);
      });

      describe("playGame", function () {
        it("should play gameContract", async function () {
          await gameContract.signIn(player1.address);
          await gameContract.signIn(player2.address);
          await gameContract.signIn(player3.address);

          expect(
            await gameContract.distributeToken(
              player1.address,
              player2.address,
              player3.address
            )
          ).to.emit("WinnersPaid");
        });

        it("gives correct amount to winners", async function () {
          await gameContract.signIn(player1.address);
          await gameContract.signIn(player2.address);
          await gameContract.signIn(player3.address);

          // transfer 50 eth to gameContract contract
          await gameContract.buyToken(deployer.address, {
            value: ethers.utils.parseEther("50"),
          });

          const gameContractBalance = await ethers.provider.getBalance(
            gameContract.address
          );

          const tokenBalanceBefore = await ethers.provider
            .getBalance(player1.address)
            .toString();

          const ownerBalanceBefore = (
            await ethers.provider.getBalance(deployer.address)
          ).toString();

          const tx = await gameContract.distributeToken(
            player1.address,
            player2.address,
            player3.address
          );
          const receipt = await tx.wait(1);

          const tokenBalanceAfter = (
            await ethers.provider.getBalance(player1.address)
          ).toString();
          const ownerBalanceAfter = (
            await ethers.provider.getBalance(deployer.address)
          ).toString();

          console.log(
            "player1 balance before",
            tokenBalanceBefore,
            "\nafter",
            tokenBalanceAfter
          );

          console.log(
            "owner balance before",
            ownerBalanceBefore,
            "\nafter",
            ownerBalanceAfter
          );

          assert.notEqual(
            tokenBalanceAfter.toString(),
            tokenBalanceBefore.toString()
          );
        });
      });
    });
