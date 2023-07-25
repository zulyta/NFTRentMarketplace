const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require('../utils');

describe('RENTAL TESTING', function () {
  var owner, gnosis, alice, bob, carl, deysi;
  var rentCar, nft;

  before(async () => {
    [owner, gnosis, alice, bob, carl, deysi] = await ethers.getSigners();
  });

  async function deployNftSC() {
    nft = await deploySC('NFT', []);
    rentCar = await deploySC('RentCar', [nft.address, owner.address]);
  }

  describe('Rentando', () => {
    it('Crea carro', async () => {
      await deployNftSC();

      var uri = '';
      var nameAuto = 'Auto';
      var features = 'Caracteristica #1';
      var price = 1;
      var guarantee = 1;
      var interestRate = 1;

      await nft
        .connect(alice)
        .safeMintOwner(uri, nameAuto, features, price, guarantee, interestRate);
      // id = 0
    });

    it('Renta carro', async () => {
      var carIndex = 0;
      var tokenId = 0;
      var startDate = await time.latest();
      var endDate = startDate + 86400;

      // Bob Alquila el carro de Alice (id = 0)
      await rentCar
        .connect(bob)
        .createRental(carIndex, tokenId, startDate, endDate, {
          value: 2,
        });
    });

    it('Devuelve el carro', async () => {
      var startDate = await time.latest();

      await time.increase(startDate + 86400);

      // Bob devuelve el carro de Alice (id = 0)
      await rentCar.connect(bob).returnRental(0);
    });

    it('Devuelve garantia', async () => {
      var rental = await rentCar.getRental(0);

      // Verificar que el alquiler esté marcado como listo para devolución
      expect(rental.readyForRefund).to.be.true;

      // Verificar que la fecha de finalización del alquiler haya pasado
      expect(rental.endDate <= (await time.latest())).to.be.true;

      // Devolver la garantía
      const returnAmount = await rentCar.connect(alice).refundGuarantee(0);

      // Imprimir el resultado en la consola
      console.log('returnAmount:', returnAmount.toString());
    });

    // uint8: rango [0, 2^8 -1] = [0, 255]
    // uint256: rango [0, 2^256 - 1] = [0, 23094230948092840928304982309480293840928409289048230480293840928340283049]
    // error overflow es cuando 255 + 1 (pasas fuera encima del rango)
    // error underflow 0 - 1 (pasas por debajo del rango)
  });
});
