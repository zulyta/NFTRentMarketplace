require('dotenv').config();
const { getRole, verify, ex, printAddress, deploySC } = require('../utils');

var MINTER_ROLE = getRole('MINTER_ROLE');
var BURNER_ROLE = getRole('BURNER_ROLE');
var UPGRADER_ROLE = getRole('UPGRADER_ROLE');
var gnosisSafe = process.env.GNOSIS_SAFE_ADDRESS_GOERLI;

async function deployNftGoerli() {
  let relayerAddress = process.env.RELAYER_ADDRESS_GOERLI;
  let nftContract = await deploySC('NFTv2_2', []);
  let implementation = await printAddress('NFTv2_2', nftContract.address);

  // await ex(
  //   nftContract,
  //   'grantRole',
  //   [MINTER_ROLE, relayerAddress],
  //   'Error granting MINTER_ROLE'
  // );

  // await ex(
  //   nftContract,
  //   'grantRole',
  //   [BURNER_ROLE, relayerAddress],
  //   'Error granting BURNER_ROLE'
  // );

  await ex(
    nftContract,
    'grantRole',
    [UPGRADER_ROLE, gnosisSafe],
    'Error granting UPGRADER_ROLE'
  );

  await verify(implementation, 'NFT', []);
}

deployNftGoerli().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Run this script with:
// npx hardhat run scripts/deploy-nft-goerli.js --network goerli
