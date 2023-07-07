import { BigNumber, Contract, providers, ethers, utils } from "ethers";
import nftTknAbi from "../contracts/NFT.sol/NFT.json";
import rentCarTknAbi from "../contracts/RentCar.sol/RentCar.json";

window.ethers = ethers;

let provider, signer, account;
let pubSContractAdd;
let usdcTkContract, miPrTokenContract, nftTknContract, rentCarContract;

export function initSCsMumbai() {
  const urlProvider = "https://polygon-mumbai.g.alchemy.com/v2/ImL76Y58Mvk3w8TxYK843RPMK7dNJ8RQ ";
  provider = new ethers.providers.JsonRpcProvider(urlProvider);

  const nftAddress = "0x42F5E1D2cA39eCD348001a9F28ac03D06ffFE9f4";
  const rentcAddress = "0xCDAEb5445Fc45E5548097a18Dc3640A2D84Ef0A8";
  nftTknContract = new Contract(nftAddress,nftTknAbi.abi, provider);
  rentCarContract = new Contract(rentcAddress,rentCarTknAbi.abi, provider)
}