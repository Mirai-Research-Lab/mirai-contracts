const { network } = require("hardhat");
function sleep(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}
//mines blocks on local blockchain, sleepAmount is given to simulate real life blockchain scenario
async function moveBlocks(amount, sleepAmount = 0) {
  console.log("Moving Blocks");
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
    if (sleepAmount) {
      console.log(`Sleeping for ${sleepAmount}`);
      await sleep(sleepAmount);
    }
  }
}

module.exports = { moveBlocks, sleep };
