<template>
  <header class="header">
    <nav class="container">
      <div class="logo">
        <NuxtLink to="/">NFT Rent</NuxtLink>
      </div>
      <ul class="header-list">
        <li v-for="(url, i) in urls" :key="i">
          <NuxtLink :to="url.path">{{ url.name }}</NuxtLink>
        </li>
      </ul>
      <button class="btn-connect-wallet" @click="btnConnect()">
        {{ btnText() }}
      </button>
    </nav>
  </header>
</template>

<script setup>
const {
  checkIfMetaMaskIsInstalled,
  checkIfWalletIsConnected,
  connectWallet,
  currentAccount,
} = useEthers();

onMounted(() => {
  checkIfMetaMaskIsInstalled();
  checkIfWalletIsConnected();
});

const urls = [
  { name: 'Publicar NFT', path: '/post-nft' },
  { name: 'Perfil', path: '/profile' },
];

const btnConnect = () => {
  checkIfWalletIsConnected ? null : connectWallet();
};

const btnText = () => {
  var text = 'Conectar wallet';

  if (checkIfWalletIsConnected && currentAccount.value) {
    const prefix = currentAccount.value.slice(0, 4);
    const suffix = currentAccount.value.slice(-4);
    text = `${prefix}...${suffix}`;
  }

  return text;
};
</script>
