import { BrowserProvider, Contract, Interface } from "ethers";
import nftTknAbi from "./NFT.json";
import rentCarTknAbi from "./RentCar.json";
const adressNFT = "0xBC94F3a8dE24C230182569FbA5ffac3D5E1e4f16";
const addressRentCar = "0x94F978788D5BA7C6467AB59E0a6D41df46d3e09F";

export const INft = new Interface(nftTknAbi);
export const IRecntCarTkn = new Interface(nftTknAbi);

export const getNftTknContract = async () => {
  const ethereum = validateMetamaskIsDowloadAndReturnEthereum();
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new Contract(adressNFT, nftTknAbi, signer);
};

export const getRentCarContract = async () => {
  const ethereum = validateMetamaskIsDowloadAndReturnEthereum();
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new Contract(addressRentCar, rentCarTknAbi, signer);
};

const validateMetamaskIsDowloadAndReturnEthereum = () => {
  const { ethereum } = window;
  if (!ethereum) {
    return alert("Descarga Metamask");
  }
  return ethereum;
};

export const getCurrentAccount = async () => {
  try {
    const ethereum = validateMetamaskIsDowloadAndReturnEthereum();

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log("Conectado ", accounts[0]);
    return accounts[0];
  } catch (error) {
    console.log(error);
  }
};
