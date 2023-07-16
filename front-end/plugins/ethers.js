import { ethers } from 'ethers';
import nftTknAbi from '../../artifacts/contracts/NFT.sol/NFT.json';
import rentCarTknAbi from '../../artifacts/contracts/RentCar.sol/RentCar.json';
import addresses from '@/content/addresses.json';

const nftTokenAddress = addresses.nft;
const rentCarAddress = addresses.rentCar;

export default defineNuxtPlugin({
  name: 'ethers-config',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    const provider = ref(null);
    const currentAccount = ref(null);
    const currentAccountBalance = ref(0);
    const nftList = ref([]);

    function checkIfMetaMaskIsInstalled() {
      if (window.ethereum) {
        provider.value = window.ethereum;
        console.log('Metamask está instalado!', provider.value);
        return true;
      } else {
        console.log('Asegúrate de instalar Metamask!');
        return false;
      }
    }

    async function checkIfWalletIsConnected() {
      try {
        const accounts = await provider.value.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          currentAccount.value = accounts[0];
          console.log('Cartera autorizada encontrada:', currentAccount.value);
          return true;
        } else {
          console.log('No se encontró ninguna cuenta autorizada');
          return false;
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function connectWallet() {
      try {
        const accounts = await provider.value.request({
          method: 'eth_requestAccounts',
        });

        console.log('Conectado ', accounts[0]);
        currentAccount.value = accounts[0];
      } catch (error) {
        console.log(error);
      }
    }

    async function getBalanceAccount() {
      try {
        const balance = await provider.value.request({
          method: 'eth_getBalance',
          params: [currentAccount.value],
        });

        currentAccountBalance.value = ethers.formatEther(balance);
      } catch (error) {
        console.log(error);
      }
    }

    async function configContract(address, abi) {
      try {
        if (checkIfMetaMaskIsInstalled()) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          return new ethers.Contract(address, abi, signer);
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function getNFTs() {
      try {
        const contract = await configContract(nftTokenAddress, nftTknAbi.abi);
        const totalSupply = await contract.totalSupply();
        for (let i = 0; i < totalSupply; i++) {
          const tokenURI = await contract.tokenURI(i);
          const data = await contract.getCar(i);
          var object = {
            tokenId: Number(data.tokenId),
            image: tokenURI,
            nameAuto: data.nameAuto,
            features: data.features,
            price: data.price,
            guarantee: data.guarantee,
            interestRate: data.interestRate,
          };
          nftList.value.push(object);
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function mintNft(data) {
      try {
        const contract = await configContract(nftTokenAddress, nftTknAbi.abi);
        const tx = await contract.safeMintOwner(
          data.to,
          data.uri,
          data.nameAuto,
          data.features,
          data.price,
          data.guarantee,
          data.interestRate
        );
        return tx;
      } catch (error) {
        console.log(error);
      }
    }

    async function rentCar(tokenId) {
      try {
        const contract = await configContract(
          rentCarAddress,
          rentCarTknAbi.abi
        );
        const rent = await contract.rent(tokenId);
        console.log(rent);
      } catch (error) {
        console.log(error);
      }
    }

    const plugin = {
      ...ethers,
      currentAccount,
      currentAccountBalance,
      checkIfMetaMaskIsInstalled,
      checkIfWalletIsConnected,
      connectWallet,
      getBalanceAccount,
      getNFTs,
      nftList,
      mintNft,
    };

    nuxtApp.provide('ethers', plugin);
  },
  hooks: {
    // You can directly register Nuxt app hooks here
    'app:created'() {
      const nuxtApp = useNuxtApp();
      //
    },
  },
});
