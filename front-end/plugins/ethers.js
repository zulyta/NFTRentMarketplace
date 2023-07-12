import { ethers } from 'ethers';

export default defineNuxtPlugin({
  name: 'ethers-config',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    const provider = ref(null);
    const currentAccount = ref(null);

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

    function getBalanceAccount() {}

    const plugin = {
      ...ethers,
      checkIfMetaMaskIsInstalled,
      checkIfWalletIsConnected,
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
