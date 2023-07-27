# NFT Marketplace para Alquiler de Autos

## Descripcion del Proyecto
El proyecto consiste en la creación de un Marketplace de alquiler de autos basado en la tecnología blockchain de Ethereum. Para ello, se implementarán dos contratos inteligentes actualizables: el contrato NFT y el contrato RentCar.

El contrato NFT se encargará de crear y gestionar los NFTs que representan los autos disponibles para alquiler. Los propietarios de los autos podrán registrar sus vehículos en el Marketplace, establecer la garantía asociada y el costo de interés por demora en la entrega. Cada auto estará representado por un NFT creado  utilizando IPFS (Infura), una vez que se realiza una transacción de alquiler, el propietario recibirá un NFT como prueba.

El contrato RentCar permitirá a los arrendatarios buscar autos disponibles según el período de alquiler deseado, calculará el costo del alquiler, incluyendo la garantía y la comisión del 10% para el dueño del Marketplace. Al realizar el alquiler, se transferirá el pago y la comisión al propietario del auto, generando un NFT para el arrendatario. Al devolver el auto, se confirmará la devolución y se realizará la transferencia de la garantía, calculando el monto a devolver según la fecha de entrega.

El proyecto tiene como objetivo brindar un Marketplace descentralizado y seguro para alquiler de autos, donde los propietarios y arrendatarios puedan interactuar y realizar transacciones transparentes y confiables utilizando la tecnología blockchain y los contratos inteligentes.
## Estructura
![image]([https://github.com/zulyta/NFTRentMarketplace/assets/32932810/ce97cf53-a7e0-4187-8c90-e2cc58f353da](https://www.canva.com/design/DAFpl2F3T-o/tJEwHDtxHxhzRNEm9Frvmg/view?utm_content=DAFpl2F3T-o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink))

## Diagramas UML
### Diagrama de Secuencia
![Dsecuencia](https://www.plantuml.com/plantuml/png/ZLN1RXCn4BtlLumg8S411DSSKAkWdYXKfU8KgPhOiyN2QozZRqNvfnuGdv0VOxnUf-icJNfB9c_cpRoPvvo6Y1o7pZODgkWPJYxPzuOaQZneid0sH7y26A1__A5WpvZ9QKonZC4Sg42V1jhypRKka7zIx2qg6k5w8ETlkiTeq_J8qIZJeujmSixUHIauWjlfImrPIf0nUlXoVZt2r1IuSMry1df5BYwHQpXBK25B1pC1tdxSqYvWoOGCJBScH4u30OesAoSa26X_3SOIDmKlkLKl9L_wX363x9ZVp44rOO8g9jH2ylgI1rfZOXMq2wYKsVnpRog-7JqNS9t0BR79p6YXhnSy3Q5yvw7Voz4qyxNMBNuZIuBo3XbQKZ_IKkcm64Nf1NnTos_4OmUIPqBldLbR2Yj7BkdJ4syUlFOGjZJQDqyBrHrzbksWBkkfwxvea9IsdwHUP-c-Pv8yk8TRP7Hnyu1PrfTLMQ9LWqMMS8Xv8KMzbPkF3GTgpezqfmoeJ27AxSsTQxA0xyIcDGh7pGFzDY8XLlKEY2WEQmrtKx8cwF6sQkROHLnbSo63HY6kKtUxtt_oPshe9aax4wPMB7nu_shbqeUiTFGHRKLmT5kLcxHfIN3AuChjTrLjxMUQNMvxnDosncO7zdHDExQUkJVD21Oh1vSzLkhN1IzyrZrx9ak2MZxUZmG-7RlHVcxDrcJzgaV_q6DnoLvH6AsfwSxR8JTNv3fo6qSElnmk15Ei0apHi_D03jQYQNxkjKcEeZIPnVne0OM8QqlAQ3nCK_oQA3g9USXgP-yR1CoZtH5B_RH216j2zFdDBmrfscOS-CDHavsa4XDQymUtkdathv46L1YyP31JUkuqlZiYvmMoclQTpqTA3sJbs_tioMoQKwamTBRv3m00)

## Getting Started 
### Requerimientos
  - Open Zeppelin (Relayer)
  - Gnosis Safe
  - Infura (IPFS)
    
### Instalacion   
1. Clone el repositorio desde GitHub:

```bash
git clone https://github.com/zulyta/NFTRentMarketplace.git
```
2. Ubicarte en el branch main y luego instalar los paquetes de NPM

  ```npm install```

3. Abrir un terminal en la carpeta raíz. Correr el siguiente comando y verificar errores:

  ```npx hardhat compile ```

4. Crear archivo de Secrets para desplegar los Smart Contracts .env duplicando el archivo .env-sample

  ``` cp .env-sample .env```
  
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
   ```
9. Ejecutar la aplicacion en localmente,  ingresa a ```cd front-end```, rellena las claves del archivo secrets ```.env``` duplicando el archivo ```.env-sample```
    
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
10. Iniciar la aplicación utilizando estos comandos  ```yarn install``` y  ```yarn dev ```
      
## Contacto 
Para dudas y sugerencias contactar con:  
 - Rolando Marzano Email: rolomarzano@gmail.com
 - Luz Ticona Email: luzta48@gmail.com
 


