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
          <UBadge
            color="purple"
            variant="solid"
            size="lg"
            class="absolute z-50 top-2 right-2"
            v-if="nft.isRented"
            >Alquilado</UBadge
          >
          <img :src="nft.imageURI" />
        </div>
        <div class="nft-footer">
          <h3>{{ nft.name }}</h3>
          <h4># {{ nft.tokenId }}</h4>
          <UButton
            label="Ver detalle de NFT"
            color="emerald"
            variant="soft"
            size="lg"
            block
            @click="showDetailNFT(nft)"
          />
        </div>
      </div>
    </div>
    <UModal :ui="{ width: 'max-w-2xl' }" v-model="isOpen" prevent-close>
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
          <div class="nft-inputs">
            <UFormGroup class="input" label="Fecha de inicio" required>
              <UInput
                placeholder="Selecciona una fecha de inicio"
                :min="date"
                type="date"
                v-model="dates.startDate"
                :disabled="
                  isSuccess.disabled ||
                  selectedNFT.isRented ||
                  selectedNFT.isReadyForReturn
                "
              />
            </UFormGroup>
            <UFormGroup class="input" label="Fecha fin" required>
              <UInput
                placeholder="Selecciona una fecha de finalización"
                :min="minDate"
                type="date"
                v-model="dates.endDate"
                :disabled="
                  isSuccess.disabled ||
                  selectedNFT.isRented ||
                  selectedNFT.isReadyForReturn
                "
              />
            </UFormGroup>
          </div>
          <UButton
            :class="isSuccess.class"
            :label="!selectedNFT.isRented ? 'Alquilar' : 'Alquilado'"
            color="emerald"
            size="lg"
            :variant="!selectedNFT.isRented ? 'solid' : 'outline'"
            block
            @click="createRent()"
            :loading="isLoading"
            :disabled="selectedNFT.isRented"
          />
          <div>
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
const { getNfts, nftList, rentNft } = useEthers();
const config = useRuntimeConfig();
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

// const getPriceNFT = (value, price) => {
//   finalPriceNFT.value = BigInt(value) * price;
// };

const createRent = async () => {
  try {
    const { startDate, endDate } = dates.value;
    const { tokenId } = selectedNFT.value;
    const data = {
      tokenId: tokenId,
      startDate: dayjs(startDate).unix(),
      endDate: dayjs(endDate).unix(),
    };

    isLoading.value = true;

    const tx = await rentNft({
      ...data,
      rentalPricePerDay: selectedNFT.value.rentalPricePerDay,
      rentalGuarantee: selectedNFT.value.rentalGuarantee,
    });

    if (tx && !tx.errorCode) {
      isLoading.value = false;
      isSuccess.value = {
        class: 'hidden',
        disabled: true,
        txHash: tx.hash,
      };
    }

    isLoading.value = false;
  } catch (error) {
    console.log(error);
    isLoading.value = false;
  }
};

const goScan = (hash) => {
  window.open(`${config.public.ETHERSCAN_GOERLI}/tx/${hash}`, '_blank');
};
</script>
