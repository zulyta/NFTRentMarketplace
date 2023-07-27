require('dotenv').config();
const { getRole, verify, ex, printAddress, deploySC } = require('../utils');

var PAUSER_ROLE = getRole('PAUSER_ROLE');
var UPGRADER_ROLE = getRole('UPGRADER_ROLE');
var gnosisSafe = process.env.GNOSIS_SAFE_ADDRESS_GOERLI;

async function deployRentCarGoerli() {
  let relayerAddress = process.env.RELAYER_ADDRESS_GOERLI;
  let nftContractAddress = process.env.NFT_PROXY_ADDRESS_GOERLI;
  let marketplaceOwner = process.env.MARKETPLACE_OWNER_ADDRESS_GOERLI;

  let rentCarContract = await deploySC('RentCarV2_2', [
    nftContractAddress,
    marketplaceOwner,
  ]);
  let implementation = await printAddress(
    'RentCarV2_2',
    rentCarContract.address
  );

  await ex(
    rentCarContract,
    'grantRole',
    [PAUSER_ROLE, relayerAddress],
    'Error granting PAUSER_ROLE'
  );

  await ex(
    rentCarContract,
    'grantRole',
    [PAUSER_ROLE, gnosisSafe],
    'Error granting PAUSER_ROLE'
  );

  await ex(
    rentCarContract,
    'grantRole',
    [UPGRADER_ROLE, gnosisSafe],
    'Error granting UPGRADER_ROLE'
  );

  await verify(implementation, 'RentCarV2_2', []);
}

deployRentCarGoerli().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Run this script with:
// npx hardhat run scripts/deploy-rentcar-goerli.js --network goerli
