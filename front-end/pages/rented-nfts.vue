<template>
  <div class="wrap">
    <div class="nft-list" v-if="myRentalList.length > 0">
      <div
        class="nft-item"
        v-for="rental in myRentalList"
        :key="rental.rentalId"
      >
        <div class="nft-image">
          <UBadge
            color="orange"
            variant="solid"
            size="lg"
            class="absolute z-50 top-2 right-2"
            v-if="rental.returned"
            >Devuelto</UBadge
          >
          <img :src="rental.imageURI" />
        </div>
        <div class="nft-footer">
          <h3>{{ rental.name }}</h3>
          <h4># {{ rental.tokenId }}</h4>
          <UButton
            label="Ver alquiler de NFT"
            color="blue"
            variant="soft"
            size="lg"
            block
            @click="showDetailRental(rental)"
          />
        </div>
      </div>
    </div>
    <div class="nft-list-empty" v-else>
      <UIcon name="i-heroicons-no-symbol" class="w-12 h-12 mb-6" />
      <h3>No tienes ningún alquiler activo.</h3>
      <h4>¡Busca el carro NFT de tu preferencia y alquílalo!.</h4>
      <UButton
        label="Ver todos los NFT"
        color="emerald"
        variant="soft"
        size="lg"
        @click="router.push({ path: '/' })"
      />
    </div>
    <UModal :ui="{ width: 'max-w-2xl' }" v-model="isOpen">
      <UCard>
        <template #header>
          <div class="modal-header">
            <h3>{{ selectedRental.name }}</h3>
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
          <img :src="selectedRental.imageURI" />
          <ul>
            <li><span>Características:</span> {{ selectedRental.features }}</li>
            <li><span>Placa:</span> {{ selectedRental.licensePlate }}</li>
            <li>
              <span>Fecha de inicio:</span>
              {{ dayjs.unix(selectedRental.startDate).format('DD/MM/YYYY') }}
            </li>
            <li>
              <span>Fecha final:</span>
              {{ dayjs.unix(selectedRental.endDate).format('DD/MM/YYYY') }}
            </li>
            <li>
              <span>Días totales de alquiler:</span>
              {{ selectedRental.totalDays }}
            </li>
            <li>
              <span>Precio total del alquiler:</span>
              {{ selectedRental.totalPrice }}
            </li>
          </ul>
        </div>
        <template #footer>
          <UButton
            :class="isSuccess.class"
            :label="
              !selectedRental.returned ? 'Devolver NFT' : 'Carro devuelto'
            "
            color="emerald"
            size="lg"
            :variant="!selectedRental.returned ? 'solid' : 'outline'"
            block
            @click="finishRent()"
            :loading="isLoading"
            :disabled="selectedRental.returned"
          />
          <div v-if="isSuccess.class">
            <div
              :class="`flex items-center text-emerald-600 ${
                isSuccess.class ? 'block' : 'hidden'
              }`"
            >
              <UIcon name="i-heroicons-check" class="w-6 h-6" />
              <span class="ml-2"
                >La devolución del carro se realizó con éxito</span
              >
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
const { getMyNftsRented, myRentalList, returnNft, returnGuarantee } =
  useEthers();
const config = useRuntimeConfig();
const router = useRouter();
const dayjs = useDayjs();

const isOpen = ref(false);
const isLoading = ref(false);
const isSuccess = ref({});

const selectedRental = ref({});

onMounted(async () => {
  await getMyNftsRented();
});

onUnmounted(() => {
  myRentalList.value = [];
});

const showDetailRental = (rental) => {
  isOpen.value = true;
  selectedRental.value = rental;
};

const finishRent = async () => {
  try {
    isLoading.value = true;

    const tx = await returnNft(selectedRental.value.rentalId);

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

const goScan = (hash) => {
  window.open(`${config.public.ETHERSCAN_GOERLI}/tx/${hash}`, '_blank');
};
</script>
