# NFT Marketplace para Alquiler de Autos

El propósito de este proyecto es desarrollar un Marketplace para el alquiler de autos mediante el uso de contratos inteligentes basados en la red Goerli y la billetera MetaMask. Se utilizarán dos contratos inteligentes que interactuarán entre el propietario del auto, el arrendatario y el dueño del Marketplace. El frontend del proyecto se implementará utilizando Nuxt y Vue.

## Características del Proyecto

### Contrato NFT

Este contrato será actualizable y cumplirá con los estándares ERC721, ERC721Enumerable y ERC721URIStorage, encargándose de la creación de tokens no fungibles (NFTs) para representar los autos disponibles para alquiler.

Las características principales del contrato NFT son las siguientes:

- El propietario del auto podrá crear o registrar los autos disponibles para alquiler en el Marketplace.
- Se permitirá al propietario del auto establecer la garantía asociada al auto.
- El propietario del auto tendrá la opción de establecer el costo de interés por día en caso de demora en la entrega del auto por parte del arrendatario.
- Cada auto disponible para alquiler será representado por un NFT que se creará utilizando la biblioteca IPFS y el frontend del proyecto.
- Una vez creado el NFT, el dueño del Marketplace transferirá un NFT al propietario del auto como prueba de que la transacción se ha realizado correctamente.

### Contrato RentCar

Este contrato inteligente también será actualizable y será responsable de todas las funcionalidades relacionadas con el alquiler de autos en el Marketplace.

Las funcionalidades principales del contrato RentCar son las siguientes:

- Basado en la fecha de inicio y fin de alquiler ingresada por el arrendatario en el frontend, se mostrará un listado de los autos disponibles en ese período, obteniendo esta información del contrato NFT que registra los detalles y descripciones de los autos.
- Se implementará una función para calcular el costo del alquiler, tomando en cuenta el tokenId del NFT (auto) seleccionado, el tiempo de inicio y fin del alquiler, y sumando la garantía ingresada por el propietario del auto en el contrato NFT.
- El contrato tendrá una función para realizar el proceso de alquiler, permitiendo seleccionar el auto deseado, verificando que el NFT (auto) esté disponible para alquilar y que las fechas de inicio y fin sean correctas. Además, se verificará que el arrendatario tenga suficientes fondos para cubrir el costo del alquiler y la garantía.
- Durante el proceso de alquiler, se registrarán los datos relevantes y se calculará la comisión correspondiente al 10% del costo total del alquiler para el dueño del Marketplace. Esta comisión se acumulará hasta que el dueño decida retirar los fondos acumulados a su billetera MetaMask. La diferencia restante del pago del alquiler se transferirá al propietario del auto.
- Una vez realizada la transferencia del pago del alquiler y la comisión, el dueño del Marketplace generará o transferirá al arrendatario un NFT como prueba de que la transacción se ha realizado exitosamente.
- El perfil del arrendatario y el propietario del auto mostrará todos los autos que haya alquilado y los NFT obtenidos como parte de los alquileres realizados.
-El propietario del auto deberá aprobar la devolución del auto al final del período de alquiler.
- El contrato inteligente confirmará la devolución del auto y agregará el auto nuevamente a la lista de autos disponibles para alquiler. En caso de que el auto no se entregue en la fecha establecida, se comenzará a contabilizar el cobro de interés por día establecido por el propietario del auto en el contrato NFT, y este monto se descontará de la garantía depositada.
- El contrato inteligente tendrá una función encargada de la devolución de la garantía, que realizará el propietario del auto al arrendatario. Además, verificará si el arrendatario devolvió el auto a tiempo o con retraso, y en base a ello calculará el monto total a devolver.
- Una vez transferida la garantía, el proceso de alquiler se considerará finalizado.
## Estructura
![image](https://github.com/zulyta/NFTRentMarketplace/assets/32932810/ce97cf53-a7e0-4187-8c90-e2cc58f353da)
![Dsecuencia](D:\PF-Blockchain\Diagrama e secuenca PF 07.png)
## Diagrama de secuencia

## Cómo Desplegar el Proyecto

1. Clone el repositorio desde GitHub:

```bash
git clone https://github.com/zulyta/NFTRentMarketplace.git
