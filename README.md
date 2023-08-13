# NFT Marketplace para Alquiler de Autos

## Descripcion del Proyecto

El proyecto consiste en la creación de un Marketplace de alquiler de autos basado en la tecnología blockchain de Ethereum. Para ello, se implementarán dos contratos inteligentes actualizables: el contrato NFT y el contrato RentCar.

El contrato NFT se encargará de crear y gestionar los NFTs que representan los autos disponibles para alquiler. Los propietarios de los autos podrán registrar sus vehículos en el Marketplace, establecer la garantía asociada y el costo de interés por demora en la entrega. Cada auto estará representado por un NFT creado utilizando IPFS (Infura), una vez que se realiza una transacción de alquiler, el propietario recibirá un NFT como prueba.

El contrato RentCar permitirá a los arrendatarios buscar autos disponibles según el período de alquiler deseado, calculará el costo del alquiler, incluyendo la garantía y la comisión del 10% para el dueño del Marketplace. Al realizar el alquiler, se transferirá el pago y la comisión al propietario del auto, generando un NFT para el arrendatario. Al devolver el auto, se confirmará la devolución y se realizará la transferencia de la garantía, calculando el monto a devolver según la fecha de entrega.

El proyecto tiene como objetivo brindar un Marketplace descentralizado y seguro para alquiler de autos, donde los propietarios y arrendatarios puedan interactuar y realizar transacciones transparentes y confiables utilizando la tecnología blockchain y los contratos inteligentes.

## Estructura

![Captura de pantalla 2023-07-27 180631](https://github.com/zulyta/NFTRentMarketplace/assets/32932810/e1374374-1852-4815-a757-8250f119c29c)

## Getting Started

### Requerimientos

- Open Zeppelin (Relayer)
- Gnosis Safe
- Infura (IPFS)

### Instalación

1. Clone el repositorio desde GitHub:

```bash
git clone https://github.com/zulyta/NFTRentMarketplace.git
```

2. Ubicarte en el branch main y luego instalar los paquetes de NPM

`npm install`

3. Abrir un terminal en la carpeta raíz. Correr el siguiente comando y verificar errores:

`npx hardhat compile `

4. Crear archivo de Secrets para desplegar los Smart Contracts .env duplicando el archivo .env-sample

` cp .env-sample .env`

5. Rellenar las claves del archivo .env

   ```bash
   ADMIN_ACCOUNT_PRIVATE_KEY=
   MUMBAI_TESNET_URL=
   GOERLI_TESNET_URL=
   ETHERSCAN_API_KEY=
   POLYGONSCAN_API_KEY=

   # Contracts
   RELAYER_ADDRESS_GOERLI=
   GNOSIS_SAFE_ADDRESS_GOERLI=

   ```

6. Ejecutar los tests, utiliza el siguiente comando

   ```bash
   // Contrato NFT
   npx hardhat test test/NFT_v2_2.test.js

   // Contrato RentCar
   npx hardhat test test/RentCar_v2_2.test.js
   ```

7. Despliega los Smart Contracts

   ```bash
   // Contrato NFT
   npx hardhat run scripts/deploy-nft-goerli.js --network goerli

   // Contrato RentCar
   npx hardhat run scripts/deploy-rentcar-goerli.js --network goerli
   ```

8. Agregar los Address en el archivo .env
   ```bash
   NFT_PROXY_ADDRESS_GOERLI=
   RENTCAR_PROXY_ADDRESS_GOERLI=
   MARKETPLACE_OWNER_ADDRESS_GOERLI=0x77F6bA9bc602578eaeb73669fC73f0E540350149
   ```
9. Ejecutar la aplicacion en localmente, ingresa a `cd front-end`, rellena las claves del archivo secrets `.env` duplicando el archivo `.env-sample`

```bash
NUXT_INFURA_API_KEY=
NUXT_INFURA_API_KEY_SECRET=
NUXT_INFURA_ENDPOINT=
NUXT_INFURA_DEDICATED_GATEWAY_SUBDOMAIN=

NUXT_ALCHEMY_API_KEY=
NUXT_ALCHEMY_PROVIDER_NETWORK=

NUXT_ETHERSCAN_GOERLI=

# Contracts
NUXT_NFT_PROXY_ADDRESS_GOERLI=
NUXT_RENTCAR_PROXY_ADDRESS_GOERLI=

```

10. Iniciar la aplicación utilizando estos comandos `yarn install` y `yarn dev `

## Contacto

Para dudas y sugerencias contactar con:

- Rolando Marzano - Email: rolo.marzano@gmail.com
- Luz Ticona - Email: luzta48@gmail.com
