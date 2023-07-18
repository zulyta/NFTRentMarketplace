import { ethers } from 'ethers';
import { getParsedEthersError } from '@enzoferey/ethers-error-parser';
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
        const parsedError = getParsedEthersError(error);
        return parsedError;
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
        const parsedError = getParsedEthersError(error);
        return parsedError;
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
        const parsedError = getParsedEthersError(error);
        return parsedError;
      }
    }

    async function configContract(address, abi, type = false) {
      try {
        if (checkIfMetaMaskIsInstalled()) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const alchemyProvider = new ethers.AlchemyProvider(
            'matic-mumbai',
            'G4-y-BXRg4lnQIPRzoKQLOJyh1joSAue'
          );
          const browserProviderSigner = await browserProvider.getSigner();

          return new ethers.Contract(
            address,
            abi,
            type ? browserProviderSigner : alchemyProvider
          );
        }
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        return parsedError;
      }
    }

    async function getNfts() {
      try {
        const contract = await configContract(nftTokenAddress, nftTknAbi.abi);
        const totalSupply = await contract.totalSupply();
        for (let i = 0; i < totalSupply; i++) {
          const tokenURI = await contract.tokenURI(i);
          const data = await contract.getCar(i);
          if (data) {
            var object = {
              tokenId: Number(data.tokenId),
              image: tokenURI,
              nameAuto: data.nameAuto,
              features: data.features,
              price: data.price,
              guarantee: data.guarantee,
              interestRate: data.interestRate,
            };
          }
          nftList.value.push(object);
        }
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        return parsedError;
      }
    }

    async function mintNft(data) {
      try {
        const contract = await configContract(
          nftTokenAddress,
          nftTknAbi.abi,
          true
        );
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
        const parsedError = getParsedEthersError(error);
        return parsedError;
      }
    }

    async function rentNft(data) {
      try {
        const contract = await configContract(
          rentCarAddress,
          rentCarTknAbi.abi,
          true
        );

        const rentalDuration = (data.endDate - data.startDate) / 86400;
        const rentalPrice =
          ethers.toBigInt(data.price) * ethers.toBigInt(rentalDuration) +
          ethers.toBigInt(data.guarantee);

        const tx = await contract.createRental(
          data.carIndex,
          data.tokenId,
          data.startDate,
          data.endDate,
          { value: rentalPrice }
        );
        return tx;
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        return parsedError;
      }
    }

    async function getMyNfts() {
      try {
        console.log('method');
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        return parsedError;
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
      getNfts,
      nftList,
      mintNft,
      rentNft,
      getMyNfts,
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
