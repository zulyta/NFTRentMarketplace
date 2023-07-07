require("dotenv").config();

const { string } = require("hardhat/internal/core/params/argumentTypes");
const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

async function deployMumbai() {
  var relayerAddress = "0xfcB8555bB06b13784E7861ddC9587B9920AF8026";

  var nftContract = await deploySC("NFT", []);
  var implementation = await printAddress("NFT", nftContract.address); 

//var nftContract = await deploySCNoUp("Marketplace", []);
//var implementation = await printAddress("Marketplace", nftContract.address); 



// set up
await ex(nftContract, "grantRole", [MINTER_ROLE, relayerAddress], "GR");
await ex(nftContract, "grantRole", [BURNER_ROLE, relayerAddress], "GR");

await verify(implementation, "NFT", []);
}

async function upgrade() {


nftContract = await upgradeSC("NFT_v2",nftProxy.address);
var implementation = await printAddress("NFT_v2", nftContract.address);

await verify(implementation, "NFT_v2", []);
}

deployMumbai()

  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


