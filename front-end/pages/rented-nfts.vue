<template>
  <div>Rented NFT</div>
</template>
<script setup>
const { getMyNftsRented } = useEthers();

onMounted(async () => {
  await getMyNftsRented();
});
</script>
