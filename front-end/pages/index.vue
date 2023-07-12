<template>
  <div class="container">
    <div class="nft-list">
      <div class="nft-item" v-for="(nft, index) in nftList" :key="index">
        <div class="nft-image">
          <img :src="nft.image" />
        </div>
        <div class="nft-footer">
          <h3>{{ nft.nameAuto }}</h3>
          <h4># {{ nft.tokenId }}</h4>
          <button class="btn-lend-nft">Alquilar NFT</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const { getNFTs, nftList } = useEthers();
onMounted(() => {
  getNFTs();
});
</script>
