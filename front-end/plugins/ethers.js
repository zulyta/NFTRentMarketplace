import { ethers } from 'ethers';
import { getParsedEthersError } from '@enzoferey/ethers-error-parser';
import nftTknAbi from '../../artifacts/contracts/NFTv2_2.sol/NFTv2_2.json';
import rentCarTknAbi from '../../artifacts/contracts/RentCarV2_2.sol/RentCarV2_2.json';

export default defineNuxtPlugin({
  name: 'ethers-config',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    const config = useRuntimeConfig();
    const toast = useToast();

    const nftTokenAddress = config.public.NFT_PROXY_ADDRESS_GOERLI;
    const rentCarAddress = config.public.RENTCAR_PROXY_ADDRESS_GOERLI;

    const provider = ref(null);
    const currentAccount = ref(null);
    const currentAccountBalance = ref(0);
    const nftList = ref([]);
    const myNftList = ref([]);
    const myRentalList = ref([]);

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
        toastError(parsedError);
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
        toastError(parsedError);
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
        toastError(parsedError);
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
        toastError(parsedError);
        return parsedError;
      }
    }

    async function getNfts() {
      try {
        const contract = await configContract(nftTokenAddress, nftTknAbi.abi);

        const data = await contract.getCars();

        data.forEach(async (car) => {
          if (car.name != '') {
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
          }
        });
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        toastError(parsedError);
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
        toastError(parsedError);
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
          ethers.toBigInt(data.rentalPricePerDay) *
            ethers.toBigInt(rentalDuration) +
          ethers.toBigInt(data.rentalGuarantee);

        const tx = await contract.createRental(
          data.tokenId,
          data.startDate,
          data.endDate,
          { value: rentalPrice }
        );
        return tx;
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        toastError(parsedError);
        return parsedError;
      }
    }

    async function getMyNfts() {
      try {
        const contract = await configContract(nftTokenAddress, nftTknAbi.abi);
        const eventFilter = contract.filters.Transfer(
          '0x0000000000000000000000000000000000000000',
          null,
          null
        );
        const events = await contract.queryFilter(eventFilter);
        events.forEach(async (event) => {
          if (event.args[1].toLowerCase() === currentAccount.value) {
            const data = await contract.getCar(parseInt(event.args[2]));
            if (data && data.name != '') {
              var object = {
                tokenId: parseInt(event.args[2]),
                name: data.name,
                imageURI: data.imageURI,
                features: data.features,
                licensePlate: data.licensePlate,
                rentalPricePerDay: data.rentalPricePerDay,
                rentalGuarantee: data.rentalGuarantee,
                lateReturnInterestPerDay: data.lateReturnInterestPerDay,
                isRented: data.isRented,
                isReadyForReturn: data.isReadyForReturn,
              };
              myNftList.value.push(object);
            }
          }
        });
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        toastError(parsedError);
        return parsedError;
      }
    }

    async function getMyNftsRented() {
      try {
        const rentCarContract = await configContract(
          rentCarAddress,
          rentCarTknAbi.abi
        );

        const nftContract = await configContract(
          nftTokenAddress,
          nftTknAbi.abi
        );

        const rentals = await rentCarContract.getRenterRentals(
          currentAccount.value
        );
        rentals.forEach(async (rentalId) => {
          const rental = await rentCarContract.getRental(parseInt(rentalId));
          const nft = await nftContract.getCar(parseInt(rental[0]));
          var object = {
            rentalId: rentalId,
            tokenId: rental.tokenId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            totalDays: rental.totalDays,
            totalPrice: rental.totalPrice,
            active: rental.active,
            returned: rental.returned,
            name: nft.name,
            imageURI: nft.imageURI,
            features: nft.features,
            licensePlate: nft.licensePlate,
          };
          myRentalList.value.push(object);
        });
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        toastError(parsedError);
        return parsedError;
      }
    }

    async function returnNft(rentalId) {
      try {
        const contract = await configContract(
          rentCarAddress,
          rentCarTknAbi.abi,
          true
        );
        const tx = await contract.returnRental(rentalId);
        return tx;
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        toastError(parsedError);
        return parsedError;
      }
    }

    async function returnGuarantee(tokenId) {
      try {
        const contract = await configContract(
          rentCarAddress,
          rentCarTknAbi.abi,
          true
        );

        const rentals = await contract.getCarRentals(currentAccount.value);

        rentals.forEach(async (rentalId) => {
          const rental = await contract.getRental(rentalId);
          if (rental.tokenId == tokenId) {
            const tx = await contract.guaranteeRefund(rentalId);
            return tx;
          }
        });
      } catch (error) {
        const parsedError = getParsedEthersError(error);
        toastError(parsedError);
        return parsedError;
      }
    }

    function toastError(error) {
      toast.add({
        title: 'Error en la transacción',
        description: error.context + ' Código de error: ' + error.errorCode,
        icon: 'i-heroicons-x-circle',

        ui: {
          progress: {
            background: 'bg-red-500',
          },
          icon: {
            color: 'bg-red-500',
          },
        },
      });
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
      myRentalList,
      returnNft,
      returnGuarantee,
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
