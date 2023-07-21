require('dotenv').config();
const { getRole, verify, ex, printAddress, deploySC } = require('../utils');

var DEFAULT_ADMIN_ROLE = getRole('DEFAULT_ADMIN_ROLE');
var UPGRADER_ROLE = getRole('UPGRADER_ROLE');
var gnosisSafe = process.env.GNOSIS_SAFE_ADDRESS_GOERLI;

async function deployRentCarGoerli() {
  let relayerAddress = process.env.RELAYER_ADDRESS_GOERLI;
  let nftContractAddress = process.env.NFT_PROXY_ADDRESS_GOERLI;

  let rentCarContract = await deploySC('RentCarV2_1', [
    nftContractAddress,
    relayerAddress,
  ]);
  let implementation = await printAddress(
    'RentCarV2_1',
    rentCarContract.address
  );

  await ex(
    rentCarContract,
    'grantRole',
    [DEFAULT_ADMIN_ROLE, relayerAddress],
    'Error granting DEFAULT_ADMIN_ROLE'
  );

  await ex(
    rentCarContract,
    'grantRole',
    [UPGRADER_ROLE, gnosisSafe],
    'Error granting UPGRADER_ROLE'
  );

  await verify(implementation, 'RentCarV2_1', []);
}

deployRentCarGoerli().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Run this script with:
// npx hardhat run scripts/deploy-rentcar-goerli.js --network goerli
