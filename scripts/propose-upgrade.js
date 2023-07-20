// scripts/propose-upgrade.js
require('dotenv').config();
const { defender } = require('hardhat');

async function proposeUpgrade() {
  const proxyAddress = process.env.PROXY_ADDRESS_NFT;

  const newImplementationContract = await ethers.getContractFactory(
    'name of contract to upgrade to'
  );
  console.log('Preparing proposal...');
  const proposal = await defender.proposeUpgrade(
    proxyAddress,
    newImplementationContract,
    {
      title: 'title of proposal',
    }
  );
  console.log('Upgrade proposal created at:', proposal.url);
}

proposeUpgrade()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Run this script with:
// npx hardhat run scripts/propose-upgrade.js --network goerli
