import nftTknAbi from "./contracts/NFT.sol/NFT.json";
import rentCarTknAbi from "./contracts/RentCar.sol/RentCar.json";
import { Contract, JsonRpcProvider, ethers } from "ethers";

window.ethers = ethers;

function initSCsMumbai() {
  const urlProvider =
    "https://polygon-mumbai.g.alchemy.com/v2/ImL76Y58Mvk3w8TxYK843RPMK7dNJ8RQ ";
  const provider = new JsonRpcProvider(urlProvider);

  const nftAddress = "0x42F5E1D2cA39eCD348001a9F28ac03D06ffFE9f4";
  const rentcAddress = "0xCDAEb5445Fc45E5548097a18Dc3640A2D84Ef0A8";

  const nftTknContract = new Contract(nftAddress, nftTknAbi.abi, provider);
  const rentCarContract = new Contract(
    rentcAddress,
    rentCarTknAbi.abi,
    provider
  );

  return { nftTknContract, rentCarContract };
}

export const getContracts = () => {
  return initSCsMumbai();
};