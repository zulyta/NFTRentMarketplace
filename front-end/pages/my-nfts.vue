<template>
  <div class="wrap">
    <div class="nft-list" v-if="myNftList.length > 0">
      <div class="nft-item" v-for="nft in myNftList" :key="nft.tokenId">
        <div class="nft-image">
          <img :src="nft.imageURI" />
        </div>
        <div class="nft-footer">
          <h3>{{ nft.name }}</h3>
          <h4># {{ nft.tokenId }}</h4>
          <UButton
            label="Ver detalle de NFT"
            color="blue"
            variant="soft"
            size="lg"
            block
            @click="showDetailNFT(nft)"
          />
        </div>
      </div>
    </div>
    <div class="nft-list-empty" v-else>
      <UIcon name="i-heroicons-no-symbol" class="w-12 h-12 mb-6" />
      <h3>No tienes ningún auto publicado.</h3>
      <h4>Empieza a publicar tu auto NFT para alquiler.</h4>
      <UButton
        label="Publicar NFT"
        color="emerald"
        variant="soft"
        size="lg"
        @click="router.push({ path: '/post-nft' })"
      />
    </div>
    <UModal :ui="{ width: 'max-w-2xl' }" v-model="isOpen">
      <UCard>
        <template #header>
          <div class="modal-header">
            <h3>{{ selectedNFT.name }}</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>
        <div class="nft-detail">
          <img :src="selectedNFT.imageURI" />
          <ul>
            <li><span>Características:</span> {{ selectedNFT.features }}</li>
            <li><span>Placa:</span> {{ selectedNFT.licensePlate }}</li>
            <li>
              <span>Precio de alquiler por día:</span>
              {{ selectedNFT.rentalPricePerDay }}
            </li>
            <li><span>Garantía:</span> {{ selectedNFT.rentalGuarantee }}</li>
            <li>
              <span>Interés diario por devolución tardía:</span>
              {{ selectedNFT.lateReturnInterestPerDay }}
            </li>
          </ul>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
<script setup>
const { getMyNfts, myNftList } = useEthers();
const router = useRouter();
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
