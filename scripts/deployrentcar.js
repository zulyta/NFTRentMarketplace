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
  var nftContractAddress = "0x42F5E1D2cA39eCD348001a9F28ac03D06ffFE9f4";
  var marketplaceOwner = "0x860cb92096D13b34E6d5638f68d6F1B6be77CfC9";
  var commissionPercentage = 10;

  var rentCarContract = await deploySC("RentCar", [nftContractAddress, marketplaceOwner, commissionPercentage]);
  var implementation = await printAddress("RentCar", rentCarContract.address); 


// set up
await ex(rentCarContract, "grantRole", [MINTER_ROLE, relayerAddress], "GR");
await ex(rentCarContract, "grantRole", [BURNER_ROLE, relayerAddress], "GR");

await verify(implementation, "RentCar", []);
}

async function upgrade() {


rentCarContract = await upgradeSC("RentCar_v2",rentCarContract.address);
var implementation = await printAddress("RentCar_v2", rentCarContract.address);

await verify(implementation, "RentCar_v2", []);
}

deployMumbai()

  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


