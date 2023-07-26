<template>
  <div class="wrap">
    <UCard class="form-card">
      <template #header>
        <h3>Publica tu auto</h3>
      </template>
      <UFormGroup name="imageURI" label="Imagen" class="input" required>
        <UInput
          placeholder="Sube tu imagen"
          type="file"
          @change="getImage($event.target.files[0])"
          accept="image/x-png,image/gif,image/jpeg"
        />
      </UFormGroup>
      <div class="input">
        <img :src="placeImage" alt="" />
      </div>
      <div class="group-input">
        <UFormGroup name="name" label="Nombre" class="input" required>
          <UInput
            placeholder="Ingresa el nombre de tu auto"
            v-model="form.name"
          />
        </UFormGroup>
        <UFormGroup name="licensePlate" label="Placa" class="input" required>
          <UInput
            placeholder="Ingresa la placa nombre de tu auto"
            v-model="form.licensePlate"
          />
        </UFormGroup>
      </div>
      <UFormGroup
        name="features"
        label="Características"
        class="input"
        required
      >
        <UInput
          placeholder="Ingresa las caracteristicas de tu auto"
          v-model="form.features"
        />
      </UFormGroup>
      <UFormGroup
        name="rentalPricePerDay"
        label="Precio"
        class="input"
        required
      >
        <UInput
          placeholder="Ingresa el precio de alquier por día de tu auto"
          type="number"
          step="0.00001"
          v-model="form.rentalPricePerDay"
        />
      </UFormGroup>
      <UFormGroup
        name="rentalGuarantee"
        label="Garantía"
        class="input"
        required
      >
        <UInput
          placeholder="Ingresa el monto de la garantía por tu auto"
          type="number"
          step="0.00000001"
          v-model="form.rentalGuarantee"
        />
      </UFormGroup>
      <UFormGroup
        name="lateReturnInterestPerDay"
        label="Interés"
        class="input"
        required
      >
        <UInput
          placeholder="Ingresa el interés diario por la entrega tardía de tu auto"
          type="number"
          step="0.00000000000000001"
          v-model="form.lateReturnInterestPerDay"
        />
      </UFormGroup>
      <template #footer>
        <UButton
          label="Publicar"
          color="emerald"
          size="lg"
          block
          @click="createNft()"
          :loading="isLoading"
        />
      </template>
    </UCard>
    <UModal :ui="{ width: 'max-w-2xl' }" v-model="isOpen" prevent-close>
      <UCard>
        <template #header>
          <div class="modal-header">
            <h3>
              {{ form.name }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="redirect()"
            />
          </div>
        </template>
        <div class="nft-detail">
          <img :src="placeImage" />
          <ul>
            <li><span>Características:</span> {{ form.features }}</li>
            <li><span>Placa:</span> {{ form.licensePlate }}</li>
            <li><span>Precio:</span> {{ form.rentalPricePerDay }}</li>
            <li><span>Garantía:</span> {{ form.rentalGuarantee }}</li>
            <li><span>Interés:</span> {{ form.lateReturnInterestPerDay }}</li>
          </ul>
        </div>
        <template #footer>
          <div class="flex items-center text-emerald-600">
            <UIcon name="i-heroicons-check" class="w-6 h-6" />
            <span class="ml-2">Auto publicado con éxito</span>

            <UButton
              label="Ver transacción"
              color="white"
              icon="i-heroicons-viewfinder-circle"
              class="ml-auto"
              @click="goScan(txHash)"
            />
          </div>
          <span class="text-xs text-gray-600"
            >* La transacción podría tardar unos minutos en confirmarse.</span
          >
        </template>
      </UCard>
    </UModal>
    <UNotifications />
  </div>
</template>
<script setup>
import { create } from 'ipfs-http-client';
const config = useRuntimeConfig();
const router = useRouter();
const { currentAccount, mintNft } = useEthers();
const toast = useToast();

const isOpen = ref(false);
const isLoading = ref(false);

const placeImage = ref(
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
);
const form = ref({});
const txHash = ref(null);

const getImage = (image) => {
  Object.assign(form.value, { imageURI: image });
  const imageURL = URL.createObjectURL(image);
  placeImage.value = imageURL;
};

const createNft = async () => {
  try {
    const checkForm = (object) => {
      return object.hasOwnProperty('name') &&
        object.hasOwnProperty('imageURI') &&
        object.hasOwnProperty('features') &&
        object.hasOwnProperty('licensePlate') &&
        object.hasOwnProperty('rentalPricePerDay') &&
        object.hasOwnProperty('rentalGuarantee') &&
        object.hasOwnProperty('lateReturnInterestPerDay')
        ? true
        : false;
    };
    if (checkForm(form.value)) {
      const authorization =
        'Basic ' +
        btoa(
          config.public.INFURA_API_KEY +
            ':' +
            config.public.INFURA_API_KEY_SECRET
        );
      const ipfs = create({
        url: `${config.public.INFURA_ENDPOINT}`,
        headers: {
          authorization,
        },
      });

      isLoading.value = true;

      const response = await ipfs.add(form.value.imageURI);

      if (response) {
        const data = {
          owner: currentAccount.value,
          name: form.value.name,
          imageURI: `${config.public.INFURA_DEDICATED_GATEWAY_SUBDOMAIN}/ipfs/${response.path}`,
          features: form.value.features,
          licensePlate: form.value.licensePlate,
          rentalPricePerDay: form.value.rentalPricePerDay,
          rentalGuarantee: form.value.rentalGuarantee,
          lateReturnInterestPerDay: form.value.lateReturnInterestPerDay,
        };

        const tx = await mintNft(data);
        if (tx && !tx.errorCode) {
          isLoading.value = false;
          txHash.value = tx.hash;
          isOpen.value = true;
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
      }
    } else {
      toast.add({
        title: 'Formulario incompleto',
        description: 'Por favor, completa todos los campos para crear el NFT',
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
  } catch (error) {
    console.log(error);
    isLoading.value = false;
  }
};

const redirect = () => {
  form.value = {};
  isOpen.value = false;
  router.push({ path: '/' });
};

const goScan = (hash) => {
  window.open(`${config.public.ETHERSCAN_GOERLI}/tx/${hash}`, '_blank');
};
</script>
