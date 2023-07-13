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
          <UButton
            label="Alquilar NFT"
            color="emerald"
            size="lg"
            block
            @click="isOpen = true"
          />
        </div>
      </div>
    </div>
    <UModal v-model="isOpen">CONTENIDO NFT</UModal>
  </div>
</template>
<script setup>
const { getNFTs, nftList } = useEthers();

onMounted(() => {
  getNFTs();
});

onUnmounted(() => {
  nftList.value = [];
});

const isOpen = ref(false);
</script>
