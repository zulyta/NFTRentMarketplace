<template>
  <div class="wrap">
    <div class="nft-list" v-if="myNftList.length > 0">
      <div class="nft-item" v-for="nft in myNftList" :key="nft.tokenId">
        <div class="nft-image">
          <UBadge
            color="purple"
            variant="solid"
            size="lg"
            class="absolute z-50 top-2 right-2"
            >{{ getCarStatus(nft) }}</UBadge
          >
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
        <template #footer>
          <UButton
            :class="isSuccess.class"
            label="Devolver monto de garantía"
            color="blue"
            size="lg"
            block
            @click="withdrawal()"
            :loading="isLoading"
            :disabled="!selectedNFT.isReadyForReturn"
          />
          <div
            :class="`flex items-center text-emerald-600 ${
              isSuccess.class ? 'block' : 'hidden'
            }`"
          >
            <div>
              <UIcon name="i-heroicons-check" class="w-6 h-6" />
              <span class="ml-2">Garantía devuelta con éxito</span>

              <UButton
                label="Ver transacción"
                color="white"
                icon="i-heroicons-viewfinder-circle"
                class="ml-auto"
                @click="goScan(isSuccess.txHash)"
              />
            </div>
            <span class="text-xs text-gray-600"
              >* La transacción podría tardar unos minutos en confirmarse.</span
            >
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
<script setup>
const { getMyNfts, myNftList, returnGuarantee } = useEthers();
const router = useRouter();

const isOpen = ref(false);
const isLoading = ref(false);
const isSuccess = ref({});

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

const getCarStatus = (nft) => {
  if (nft.isRented && !nft.isReadyForReturn) {
    return 'Alquilado';
  }

  if (!nft.isRented && nft.isReadyForReturn) {
    return 'Devuelto';
  }

  if (!nft.isRented && !nft.isReadyForReturn) {
    return 'Disponible';
  }
};

const withdrawal = async () => {
  try {
    isLoading.value = true;

    const tx = await returnGuarantee(selectedNFT.value.tokenId);

    if (tx && !tx.errorCode) {
      isLoading.value = false;
      isSuccess.value = {
        class: 'hidden',
        txHash: tx.hash,
      };
    }

    isLoading.value = false;
  } catch (error) {
    console.log(error);
    isLoading.value = false;
  }
};
</script>
