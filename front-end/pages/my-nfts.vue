<!-- <template>
  <div class="wrap">
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
            @click="showDetailNFT(nft)"
          />
        </div>
      </div>
    </div>
    <UModal v-model="isOpen">
      <div class="modal-content">
        <div class="nft-detail">
          <div class="nft-header">
            <h3>{{ selectedNFT.nameAuto }}</h3>
            <img :src="selectedNFT.image" />
          </div>
          <ul>
            <li><b>Características:</b> {{ selectedNFT.features }}</li>
            <li><b>Precio:</b> {{ selectedNFT.price }}</li>
            <li><b>Garantía:</b> {{ selectedNFT.guarantee }}</li>
            <li><b>Interés:</b> {{ selectedNFT.interestRate }}</li>
          </ul>
        </div>
      </div>
    </UModal>
  </div>
</template>
<script setup>
const { getMyNfts, myNftList } = useEthers();

onMounted(() => {
  getMyNfts();
});

onUnmounted(() => {
  myNftList.value = [];
});
</script> -->
<template>
  <div>My Nfts</div>
</template>

<script setup>
const { getMyNfts } = useEthers();

onMounted(() => {
  getMyNfts();
});
</script>
