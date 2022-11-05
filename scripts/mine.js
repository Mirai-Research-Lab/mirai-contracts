const { moveBlocks, sleep } = require("../utils/move-blocks");
const BLOCKS = 2;
const SLEEP_TIME = 1500;

async function main() {
  await moveBlocks(BLOCKS, (sleepAmount = SLEEP_TIME));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
