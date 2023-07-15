<template>
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
        <hr />
        <footer>
          <div class="nft-inputs">
            <UFormGroup class="input" label="Días" required>
              <UInput
                placeholder="Ingresa los días de alquiler"
                type="number"
                @input="getPriceNFT($event.target.value, selectedNFT.price)"
              />
            </UFormGroup>
            <UFormGroup class="input" label="Costo final">
              <UInput placeholder="0.00" v-model="finalPriceNFT" disabled>
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs"
                    >ETHER</span
                  >
                </template>
              </UInput>
            </UFormGroup>
          </div>
          <UButton label="Alquilar" color="emerald" size="lg" block />
        </footer>
      </div>
    </UModal>
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
const selectedNFT = ref({});
const finalPriceNFT = ref(null);

const showDetailNFT = (nft) => {
  isOpen.value = true;
  selectedNFT.value = nft;
};

const getPriceNFT = (value, price) => {
  finalPriceNFT.value = BigInt(value) * price;
};
</script>
