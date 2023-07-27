const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

const { getRole, deploySC } = require('../utils');

describe('RentCar_v2_2 testing', function () {
  var nftContract, rentCarContract;
  var owner, renter, relayer, gnosisSafe;

  var DEFAULT_ADMIN_ROLE = getRole('DEFAULT_ADMIN_ROLE');
  var PAUSER_ROLE = getRole('PAUSER_ROLE');
  var MINTER_ROLE = getRole('MINTER_ROLE');
  var UPGRADER_ROLE = getRole('UPGRADER_ROLE');

  beforeEach(async function () {
    [owner, renter, relayer, gnosisSafe] = await ethers.getSigners();

    nftContract = await deploySC('NFTv2_2', []);
    rentCarContract = await deploySC('RentCarV2_2', [
      nftContract.address,
      relayer.address,
    ]);

    await nftContract.grantRole(MINTER_ROLE, relayer.address);
    await nftContract.grantRole(UPGRADER_ROLE, gnosisSafe.address);

    await rentCarContract.grantRole(DEFAULT_ADMIN_ROLE, relayer.address);
    await rentCarContract.grantRole(PAUSER_ROLE, relayer.address);
    await rentCarContract.grantRole(UPGRADER_ROLE, gnosisSafe.address);
  });

  async function createCarNFT() {
    const data = {
      name: 'Car name',
      imageURI: 'car.png',
      features: 'Luxury car with 4 seats',
      licensePlate: 'ABC123',
      rentalPricePerDay: ethers.utils.parseEther('0.1'),
      rentalGuarantee: ethers.utils.parseEther('0.1'),
      lateReturnInterestPerDay: 10,
    };

    const carMinted = await nftContract.mintCarNFT(
      owner.address,
      data.name,
      data.imageURI,
      data.features,
      data.licensePlate,
      data.rentalPricePerDay,
      data.rentalGuarantee,
      data.lateReturnInterestPerDay
    );

    return { data, carMinted, tx: await carMinted.wait(1) };
  }

  async function createNewRental(address, tokenId, value, days = 1) {
    const today = await time.latest();
    const data = {
      tokenId: tokenId,
      startDate: today,
      endDate: today + days * 86401, // Delay de 1 segundo para evitar errores
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
      expect(rental.mintTokenId).to.equal(1);
    });

    it('Should not create a new rental if the renter does not send enough funds', async function () {
      await createCarNFT();
      await expect(
        createNewRental(renter, 0, ethers.utils.parseEther('0.1'))
      ).to.be.revertedWith('Fondos insuficientes');
    });

    it('Should return a rental and calculate interest', async function () {
      await createCarNFT();
      const tx = await createNewRental(
        renter,
        0,
        ethers.utils.parseEther('0.2')
      );
      await time.increase(86000);
      await rentCarContract.returnRental(0);

      const rental = await rentCarContract.getRental(0);
      const totalPrice = await rentCarContract.calculateRentalCost(
        0,
        rental.startDate,
        rental.endDate
      );
      const totalInterest = await rentCarContract.calculateReturnInterest(0);

      expect(rental.tokenId).to.equal(0);
      expect(rental.renter).to.equal(renter.address);
      expect(rental.startDate).to.equal(tx.data.startDate);
      expect(rental.endDate).to.equal(tx.data.endDate);
      expect(rental.totalDays).to.equal(1);
      expect(rental.totalPrice).to.equal(totalPrice);
      expect(rental.totalInterest).to.equal(totalInterest);
      expect(rental.active).to.equal(false);
      expect(rental.returned).to.equal(true);
      expect(rental.mintTokenId).to.equal(1);
    });

    it('Should not return a rental if the rental is not active', async function () {
      await createCarNFT();
      await createNewRental(renter, 0, ethers.utils.parseEther('0.2'));
      await time.increase(86400);
      await rentCarContract.returnRental(0);
      await expect(rentCarContract.returnRental(0)).to.be.revertedWith(
        'El alquiler no esta activo'
      );
    });

    // it('Should revert if rental is not yet finished', async function () {
    //   await createCarNFT();
    //   await createNewRental(renter, 0, ethers.utils.parseEther('0.2'));
    //   await expect(rentCarContract.returnRental(0)).to.be.revertedWith(
    //     'El alquiler aun no ha finalizado'
    //   );
    // });

    it('Should calculate return interest correctly', async function () {
      const nft = await createCarNFT();
      await createNewRental(renter, 0, ethers.utils.parseEther('0.2'));
      await time.increase(86400);
      await rentCarContract.returnRental(0);
      const rental = await rentCarContract.getRental(0);
      const calculate = await rentCarContract.calculateReturnInterest(
        rental.tokenId
      );

      const expectedInterest = ethers.utils
        .parseEther(rental.totalPrice.toString())
        .sub(nft.data.rentalGuarantee)
        .mul(0)
        .mul(nft.data.lateReturnInterestPerDay)
        .div(100);

      expect(calculate).to.equal(expectedInterest);
    });

    it('Should apply late return interest correctly', async function () {
      const nft = await createCarNFT();
      const rental = await createNewRental(
        renter,
        0,
        ethers.utils.parseEther('0.2')
      );
      await time.increase(86400 * 3);
      //await rentCarContract.returnRental(0);

      const lateDays = ((await time.latest()) - rental.data.endDate) / 86400;

      const interest = lateDays * (nft.data.lateReturnInterestPerDay / 100);

      const expectedInterest =
        interest >= nft.data.rentalGuarantee
          ? nft.data.rentalGuarantee
          : nft.data.rentalGuarantee - interest;

      const returnInterest = await rentCarContract.calculateReturnInterest(0);

      expect(returnInterest.toString()).to.equal(expectedInterest.toString());
    });
  });
});

// Run this test with:
// npx hardhat test test/RentCar_v2_2.test.js
