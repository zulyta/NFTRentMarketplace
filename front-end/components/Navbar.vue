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
        {{ checkIfWalletIsConnected ? currentAccount : 'Conectar wallet' }}
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
  getNFTs,
} = useEthers();

onMounted(() => {
  checkIfMetaMaskIsInstalled();
  checkIfWalletIsConnected();
  getNFTs();
});

const urls = [
  { name: 'Publicar NFT', path: '/lend-nft' },
  { name: 'Perfil', path: '/profile' },
];

function btnConnect() {
  checkIfWalletIsConnected ? null : connectWallet();
}
</script>
