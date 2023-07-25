<template>
  <div class="wrap">
    <div class="nft-list">
      <div
        class="nft-item"
        :v-if="nftList"
        v-for="nft in nftList"
        :key="nft.tokenId"
      >
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
            <UFormGroup class="input" label="Inicio" required>
              <UInput
                placeholder="Selecciona una fecha de inicio"
                :min="date"
                type="date"
                v-model="dates.startDate"
                :disabled="isSuccess.disabled"
              />
            </UFormGroup>
            <UFormGroup class="input" label="Fin" required>
              <UInput
                placeholder="Selecciona una fecha de finalización"
                :min="minDate"
                type="date"
                v-model="dates.endDate"
                :disabled="isSuccess.disabled"
              />
            </UFormGroup>
          </div>
          <UButton
            :class="isSuccess.class"
            label="Alquilar"
            color="emerald"
            size="lg"
            block
            @click="createRent()"
            :loading="isLoading"
          />
          <div
            :class="`flex items-center text-emerald-600 ${
              isSuccess.class ? 'block' : 'hidden'
            }`"
          >
            <UIcon name="i-heroicons-check" class="w-6 h-6" />
            <span class="ml-2">Alquiler realizado con éxito</span>

            <UButton
              label="Ver transacción"
              color="white"
              icon="i-heroicons-viewfinder-circle"
              class="ml-auto"
              @click="goScan(isSuccess.txHash)"
            />
          </div>
        </footer>
      </div>
    </UModal>
    <UNotifications />
  </div>
</template>
<script setup>
const { getNfts, nftList, rentNft } = useEthers();
const toast = useToast();
const dayjs = useDayjs();

const isOpen = ref(false);
const isLoading = ref(false);
const isSuccess = ref({});

const selectedNFT = ref({});
const finalPriceNFT = ref(null);
const dates = ref({});

const date = dayjs().format('YYYY-MM-DD');
const minDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

onMounted(async () => {
  await getNfts();
});

onUnmounted(() => {
  nftList.value = [];
});

const showDetailNFT = (nft) => {
  isOpen.value = true;
  selectedNFT.value = nft;
};

const getPriceNFT = (value, price) => {
  finalPriceNFT.value = BigInt(value) * price;
};

const createRent = async () => {
  try {
    const { startDate, endDate } = dates.value;
    const { tokenId } = selectedNFT.value;
    const data = {
      carIndex: tokenId,
      tokenId: tokenId,
      startDate: dayjs(startDate).unix(),
      endDate: dayjs(endDate).unix(),
    };

    isLoading.value = true;

    const tx = await rentNft({
      ...data,
      price: selectedNFT.value.price,
      guarantee: selectedNFT.value.guarantee,
    });

    if (tx && !tx.errorCode) {
      isLoading.value = false;
      isSuccess.value = {
        class: 'hidden',
        disabled: true,
        txHash: tx.hash,
      };
    }

    if (tx.errorCode) {
      toast.add({
        title: 'Error en la transacción',
        description: tx.context + ' Código de error: ' + tx.errorCode,
        icon: 'i-heroicons-x-circle',

        ui: {
          progress: {
            background: 'bg-red-500',
          },
          icon: {
            color: 'bg-red-500',
          },
        },
      });
    }

    isLoading.value = false;
  } catch (error) {
    console.log(error);
    isLoading.value = false;
  }
};
const goScan = (hash) => {
  window.open(`https://mumbai.polygonscan.com/tx/${hash}`, '_blank');
};
</script>
