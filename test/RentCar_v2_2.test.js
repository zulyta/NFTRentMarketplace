const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

const { getRole, deploySC, ex, pEth } = require('../utils');

describe('RentCar_v2_2 testing', function () {
  var nftContract, rentCarContract;
  var owner, relayer, gnosisSafe;

  var DEFAULT_ADMIN_ROLE = getRole('DEFAULT_ADMIN_ROLE');
  var UPGRADER_ROLE = getRole('UPGRADER_ROLE');

  beforeEach(async function () {
    [owner, renter, relayer, gnosisSafe] = await ethers.getSigners();

    nftContract = await deploySC('NFTv2_2', []);
    rentCarContract = await deploySC('RentCarV2_2', [
      nftContract.address,
      relayer.address,
    ]);

    await nftContract.grantRole(DEFAULT_ADMIN_ROLE, relayer.address);
    await nftContract.grantRole(UPGRADER_ROLE, gnosisSafe.address);
  });

  async function createCarNFT() {
    const data = {
      name: 'Car name',
      imageURI: 'car.png',
      features: 'Luxury car with 4 seats',
      licensePlate: 'ABC123',
      rentalPricePerDay: ethers.utils.parseEther('0.1'),
      rentalGuarantee: ethers.utils.parseEther('0.1'),
      lateReturnInterest: 10,
    };

    const carMinted = await nftContract.mintCarNFT(
      owner.address,
      data.name,
      data.imageURI,
      data.features,
      data.licensePlate,
      data.rentalPricePerDay,
      data.rentalGuarantee,
      data.lateReturnInterest
    );

    return { carMinted, data };
  }

  async function createNewRental(address, tokenId, days = 86400, value) {
    const data = {
      tokenId: tokenId,
      startDate: await time.latest(),
      endDate: await time.increase(days),
    };

    const rentalCreated = await rentCarContract
      .connect(address)
      .createRental(data.tokenId, data.startDate, data.endDate, {
        value: value,
      });

    return { rentalCreated, data };
  }

  describe('RentCar Contract - v2.2', function () {
    it('Should create a new rental', async function () {
      await createCarNFT();
      const tx = await createNewRental(
        renter,
        0,
        ethers.utils.parseEther('0.2')
      );

      const rental = await rentCarContract.getRental(0);
      const totalPrice = await rentCarContract.calculateRentalCost(
        0,
        tx.data.startDate,
        tx.data.endDate
      );

      expect(rental.tokenId).to.equal(tx.data.tokenId);
      expect(rental.renter).to.equal(renter.address);
      expect(rental.startDate).to.equal(tx.data.startDate);
      expect(rental.endDate).to.equal(tx.data.endDate);
      expect(rental.totalDays).to.equal(1);
      expect(rental.totalPrice).to.equal(totalPrice);
      expect(rental.totalInterest).to.equal(0);
      expect(rental.active).to.equal(true);
      expect(rental.returned).to.equal(false);
    });

    it('Should not create a new rental if the renter does not send enough funds', async function () {
      await createCarNFT();
      await expect(
        createNewRental(renter, 0, ethers.utils.parseEther('0.1'))
      ).to.be.revertedWith('Fondos insuficientes');
    });

    it.only('Should return a rental and calculate interest', async function () {
      await createCarNFT();
      const tx = await createNewRental(
        renter,
        0,
        86400,
        ethers.utils.parseEther('0.2')
      );
      // await time.increase(86400);
      await rentCarContract.returnRental(0);

      const rental = await rentCarContract.getRental(0);
      const totalPrice = await rentCarContract.calculateRentalCost(
        0,
        rental.startDate,
        rental.endDate
      );

      expect(rental.tokenId).to.equal(0);
      expect(rental.renter).to.equal(renter.address);
      expect(rental.startDate).to.equal(tx.data.startDate);
      expect(rental.endDate).to.equal(tx.data.endDate);
      expect(rental.totalDays).to.equal(1);
      expect(rental.totalPrice).to.equal(totalPrice);
      expect(rental.totalInterest).to.equal(0);
      expect(rental.active).to.equal(false);
      expect(rental.returned).to.equal(true);
    });
  });
});
