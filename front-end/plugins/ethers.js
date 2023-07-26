import { ethers } from 'ethers';
import { getParsedEthersError } from '@enzoferey/ethers-error-parser';
import nftTknAbi from '../../artifacts/contracts/NFTv2_2.sol/NFTv2_2.json';
import rentCarTknAbi from '../../artifacts/contracts/RentCarV2_2.sol/RentCarV2_2.json';

export default defineNuxtPlugin({
  name: 'ethers-config',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    const config = useRuntimeConfig();
    const nftTokenAddress = config.public.NFT_PROXY_ADDRESS_GOERLI;
    const rentCarAddress = config.public.RENTCAR_PROXY_ADDRESS_GOERLI;

    const provider = ref(null);
    const currentAccount = ref(null);
    const currentAccountBalance = ref(0);
    const nftList = ref([]);
    const myNftList = ref([]);

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
            `${config.public.ALCHEMY_PROVIDER_NETWORK}`,
            `${config.public.ALCHEMY_API_KEY}`
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

        const data = await contract.getCars();

        data.forEach(async (car) => {
          var object = {
            tokenId: Number(car.tokenId),
            name: car.name,
            imageURI: car.imageURI,
            features: car.features,
            licensePlate: car.licensePlate,
            rentalPricePerDay: car.rentalPricePerDay,
            rentalGuarantee: car.rentalGuarantee,
            lateReturnInterestPerDay: car.lateReturnInterestPerDay,
            isRented: car.isRented,
          };
          nftList.value.push(object);
        });
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
        const tx = await contract.mintCarNFT(
          data.owner,
          data.name,
          data.imageURI,
          data.features,
          data.licensePlate,
          data.rentalPricePerDay,
          data.rentalGuarantee,
          data.lateReturnInterestPerDay
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
        const contract = await configContract(nftTokenAddress, nftTknAbi.abi);
        let eventFilter = contract.filters.Transfer(
          '0x0000000000000000000000000000000000000000',
          null,
          null
        );
        let events = await contract.queryFilter(eventFilter);
        events.forEach(async (event) => {
          if (event.args[1].toLowerCase() === currentAccount.value) {
            const tokenURI = await contract.tokenURI(parseInt(event.args[2]));
            const data = await contract.getCar(parseInt(event.args[2]));
            if (data) {
              var object = {
                tokenId: parseInt(event.args[2]),
                image: tokenURI,
                nameAuto: data.nameAuto,
                features: data.features,
                price: data.price,
                guarantee: data.guarantee,
                interestRate: data.interestRate,
              };
              myNftList.value.push(object);
            }
          }
        });
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        return parsedError;
      }
    }

    async function getMyNftsRented() {
      try {
        const contract = await configContract(
          rentCarAddress,
          rentCarTknAbi.abi
        );
        const rentals = await contract.getRenterRentals(currentAccount.value);
        // let events = await contract.queryFilter(eventFilter);

        console.log(rentals);

        // events.forEach(async (event) => {
        //   if (event.args[1].toLowerCase() === currentAccount.value) {
        //     const tokenURI = await contract.tokenURI(parseInt(event.args[2]));
        //     const data = await contract.getCar(parseInt(event.args[2]));
        //   }
        // });
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
      myNftList,
      getMyNftsRented,
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
