<template>
  <div class="wrap">
    <div class="nft-list">
      <div
        class="nft-item"
        :v-if="myNftList"
        v-for="nft in myNftList"
        :key="nft.tokenId"
      >
        <div class="nft-image">
          <img :src="nft.image" />
        </div>
        <div class="nft-footer">
          <h3>{{ nft.nameAuto }}</h3>
          <h4># {{ nft.tokenId }}</h4>
          <UButton
            label="Ver detalle de NFT"
            color="blue"
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
const isOpen = ref(false);
const selectedNFT = ref({});

onMounted(async () => {
  await getMyNfts();
});

onUnmounted(() => {
  myNftList.value = [];
});

const showDetailNFT = (nft) => {
  isOpen.value = true;
  selectedNFT.value = nft;
};
</script>
