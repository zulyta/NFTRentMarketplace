import nftTknAbi from './contracts/NFT.sol/NFT.json';
import rentCarTknAbi from './contracts/RentCar.sol/RentCar.json';
import { Contract, JsonRpcProvider, ethers } from 'ethers';

// Ethers de manera global
window.ethers = ethers;
var account;

// Inicialización de los contratos en red Mumbai
async function initSCsMumbai() {
  // Proveedor Mumbai usando Alchemy
  const urlProvider =
    'https://polygon-mumbai.g.alchemy.com/v2/qsTcAHsFE1ZaO10FZfkCsXYdxL5cVax4';
  const provider = new JsonRpcProvider(urlProvider);

  // Direcciones de los contratos
  const nftAddress = '0xAb68c60C5d74720c6456319F9132E6f47d22D7d3';
  const rentcAddress = '0xcdCC6a394d8f30DC43Be1Bc9aE9f42D98d2c8d13';

  const number = await provider.getBlockNumber();

  // Look up the current block number (i.e. height)
  console.log('number', number);

  const nftTknContract = new Contract(nftAddress, nftTknAbi.abi, provider);
  const rentCarContract = new Contract(
    rentcAddress,
    rentCarTknAbi.abi,
    provider
  );

  if (window.ethereum) {
    [account] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
  }

  // Get the current balance of an account (by address or ENS name)
  const signer = provider.getSigner(account);
  const address = await nftTknContract.connect(signer).getAddress();
  const balance = await provider.getBalance(address);
  console.log('balance', balance);

  // The symbol name for the token
  const sym = await nftTknContract.symbol();
  console.log('sym', sym);

  // const to = '0x860cb92096D13b34E6d5638f68d6F1B6be77CfC9';
  // const uri =
  //   'https://rentcarnft.infura-ipfs.io/ipfs/QmYXstdC7ZKdoZVW6yy4Yifo8Pa9ogTSGs9zrD4CKU6bex';
  // const nameAuto = 'Tico';
  // const features = 'Caracteristicas';
  // const price = 1523;
  // const guarantee = 1523;
  // const interestRate = 50;

  // const nft = await nftTknContract.safeMintOwner(
  //   to,
  //   uri,
  //   nameAuto,
  //   features,
  //   price,
  //   guarantee,
  //   interestRate
  // );

  // console.log('nft', nft);

  // const sym2 = await rentCarContract.symbol();
  // console.log('sym2', sym2);

  // const balance = await nftTknContract.balanceOf("ethers.eth")
  // console.log('balance',balance)

  return { nftTknContract, rentCarContract };
}

export const getContracts = () => {
  return initSCsMumbai();
};
