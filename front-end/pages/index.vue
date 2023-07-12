<template>
  <div>index</div>
</template>
<script setup>
const { checkIfMetaMaskIsInstalled, checkIfWalletIsConnected } = useEthers();
onMounted(() => {
  checkIfMetaMaskIsInstalled();
  checkIfWalletIsConnected();
});
</script>
