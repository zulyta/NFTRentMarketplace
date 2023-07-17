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
            <UFormGroup class="input" label="Inicio" required>
              <UInput
                placeholder="Selecciona una fecha de inicio"
                :min="date"
                type="date"
                v-model="dates.startDate"
              />
            </UFormGroup>
            <UFormGroup class="input" label="Fin" required>
              <UInput
                placeholder="Selecciona una fecha de finalización"
                :min="minDate"
                type="date"
                v-model="dates.endDate"
              />
            </UFormGroup>
            <!-- <UFormGroup class="input" label="Costo final">
              <UInput placeholder="0.00" v-model="finalPriceNFT" disabled>
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs"
                    >ETHER</span
                  >
                </template>
              </UInput>
            </UFormGroup> -->
          </div>
          <UButton
            label="Alquilar"
            color="emerald"
            size="lg"
            block
            @click="createRent()"
          />
        </footer>
      </div>
    </UModal>
  </div>
</template>
<script setup>
const { getNfts, nftList, rentNft } = useEthers();
const dayjs = useDayjs();

const isOpen = ref(false);
const selectedNFT = ref({});
const finalPriceNFT = ref(null);
const dates = ref({});

const date = dayjs().format('YYYY-MM-DD');
const minDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

onMounted(() => {
  getNfts();
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
    console.log('dates', data.startDate, data.endDate);

    // agregar valor de ethers (wei) precio y garantia

    // const tx = await rentNft(data);

    // if (tx) {
    //   console.log(tx);
    // }
  } catch (error) {
    console.log(error);
  }
};
</script>
