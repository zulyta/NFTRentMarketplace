import { ethers } from 'ethers';
import nftTknAbi from '../../artifacts/contracts/NFT.sol/NFT.json';
import rentCarTknAbi from '../../artifacts/contracts/RentCar.sol/RentCar.json';

export default defineNuxtPlugin({
  name: 'ethers-config',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    const provider = ref(null);
    const currentAccount = ref(null);
    const currentAccountBalance = ref(0);

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

    async function getNFTs() {
      try {
        const provider = new ethers.JsonRpcProvider(
          'https://polygon-mumbai.g.alchemy.com/v2/qsTcAHsFE1ZaO10FZfkCsXYdxL5cVax4'
        );
        const nftTokenAddress = '0xAb68c60C5d74720c6456319F9132E6f47d22D7d3';
        const rentCarAddress = '0xcdCC6a394d8f30DC43Be1Bc9aE9f42D98d2c8d13';
        const nftTokenContract = new ethers.Contract(
          nftTokenAddress,
          nftTknAbi.abi,
          provider
        );
        const rentCarContract = new ethers.Contract(
          rentCarAddress,
          rentCarTknAbi.abi,
          provider
        );
        const totalSupply = await nftTokenContract.totalSupply();
        for (let i = 0; i < totalSupply; i++) {
          const tokenURI = await nftTokenContract.tokenURI(i);
          console.log(tokenURI);
        }
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
