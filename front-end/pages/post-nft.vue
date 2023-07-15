<template>
  <div class="wrap">
    <UCard class="form-card">
      <template #header>
        <h3>Publica tu Auto</h3>
      </template>
      <UFormGroup name="image" label="Imagen" class="input" required>
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
      <UFormGroup name="name" label="Nombre" class="input" required>
        <UInput
          placeholder="Ingresa el nombre de tu auto"
          v-model="form.nameAuto"
        />
      </UFormGroup>
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
      <UFormGroup name="price" label="Precio" class="input" required>
        <UInput
          placeholder="Ingresa el precio de alquier de tu auto"
          type="number"
          step="0.00001"
          v-model="form.price"
        />
      </UFormGroup>
      <UFormGroup name="guarantee" label="Garantía" class="input" required>
        <UInput
          placeholder="Ingresa el monto de la garantía por tu auto"
          type="number"
          step="0.00000001"
          v-model="form.guarantee"
        />
      </UFormGroup>
      <UFormGroup name="interestRate" label="Interés" class="input" required>
        <UInput
          placeholder="Ingresa el interés por la entrega tardía de tu auto"
          type="number"
          step="0.00000000000000001"
          v-model="form.interestRate"
        />
      </UFormGroup>
      <template #footer>
        <UButton
          label="Publicar"
          color="emerald"
          size="lg"
          block
          @click="createNft()"
        />
      </template>
    </UCard>
    <UNotifications />
  </div>
</template>
<script setup>
import { create } from 'ipfs-http-client';
const config = useRuntimeConfig();
const { currentAccount, mintNft } = useEthers();
const toast = useToast();

const placeImage = ref(
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
);
const form = ref({});

const getImage = (image) => {
  Object.assign(form.value, { image: image });
  const imageURL = URL.createObjectURL(image);
  placeImage.value = imageURL;
};

const createNft = async () => {
  try {
    const checkForm = (object) => {
      return object.hasOwnProperty('image') &&
        object.hasOwnProperty('namAuto') &&
        object.hasOwnProperty('features') &&
        object.hasOwnProperty('price') &&
        object.hasOwnProperty('guarantee') &&
        object.hasOwnProperty('interestRate')
        ? true
        : false;
    };
    if (checkForm) {
      const authorization =
        'Basic ' +
        btoa(
          config.public.INFURA_API_KEY +
            ':' +
            config.public.INFURA_API_KEY_SECRET
        );
      const ipfs = create({
        url: 'https://ipfs.infura.io:5001/api/v0',
        headers: {
          authorization,
        },
      });

      const response = await ipfs.add(form.value.image);

      if (response) {
        const data = {
          to: currentAccount.value,
          uri: `https://rentcarnft.infura-ipfs.io/ipfs/${response.path}`,
          nameAuto: form.value.nameAuto,
          features: form.value.features,
          price: form.value.price,
          guarantee: form.value.guarantee,
          interestRate: form.value.interestRate,
        };

        const minted = await mintNft(data);
        console.log(minted);
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
  }
};
</script>
