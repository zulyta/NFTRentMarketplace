const { ethers } = require('hardhat');
const { expect } = require('chai');

const { getRole, deploySC, ex, pEth } = require('../utils');

describe('NFT_v2_2 testing', function () {
  var nftContract;
  var owner, relayer, gnosisSafe;
  var MINTER_ROLE = getRole('MINTER_ROLE');
  var BURNER_ROLE = getRole('BURNER_ROLE');
  var UPGRADER_ROLE = getRole('UPGRADER_ROLE');

  beforeEach(async function () {
    [owner, relayer, gnosisSafe] = await ethers.getSigners();

    nftContract = await deploySC('NFTv2_2', []);
    await nftContract.grantRole(MINTER_ROLE, relayer.address);
    await nftContract.grantRole(BURNER_ROLE, relayer.address);
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

  describe('NFT Contract - v2.2', function () {
    it('Should create a new car NFT', async function () {
      const contract = await createCarNFT();
      const car = await nftContract.getCar(0);
      expect(car.name).to.equal(contract.data.name);
      expect(car.imageURI).to.equal(contract.data.imageURI);
      expect(car.features).to.equal(contract.data.features);
      expect(car.licensePlate).to.equal(contract.data.licensePlate);
      expect(car.rentalPricePerDay).to.equal(contract.data.rentalPricePerDay);
      expect(car.rentalGuarantee).to.equal(contract.data.rentalGuarantee);
      expect(car.lateReturnInterest).to.equal(contract.data.lateReturnInterest);
    });

    it('Should get car details by tokenId', async function () {
      const contract = await createCarNFT();
      const tokenId = 0;
      const car = await nftContract.getCar(tokenId);
      expect(car.name).to.equal(contract.data.name);
      expect(car.imageURI).to.equal(contract.data.imageURI);
      expect(car.features).to.equal(contract.data.features);
      expect(car.licensePlate).to.equal(contract.data.licensePlate);
      expect(car.rentalPricePerDay).to.equal(contract.data.rentalPricePerDay);
      expect(car.rentalGuarantee).to.equal(contract.data.rentalGuarantee);
      expect(car.lateReturnInterest).to.equal(contract.data.lateReturnInterest);
    });

    it('Should revert when tokenId does not exist', async function () {
      const tokenId = 1;
      await expect(nftContract.getCar(tokenId)).to.be.revertedWith(
        'El token no existe'
      );
    });

    it('Should get a list of all car NFTs', async function () {
      await createCarNFT();
      await createCarNFT();
      await createCarNFT();

      const cars = await nftContract.getCars();
      const car0 = await nftContract.getCar(0);
      const car1 = await nftContract.getCar(1);
      const car2 = await nftContract.getCar(2);

      expect(cars).to.have.lengthOf(3);
      expect(cars[0].tokenId).to.equal(car0.tokenId);
      expect(cars[1].tokenId).to.equal(car1.tokenId);
      expect(cars[2].tokenId).to.equal(car2.tokenId);
    });
    it('Should get a list of all car NFTs by owner', async function () {
      await createCarNFT();
      await createCarNFT();
      await createCarNFT();

      const car0 = await nftContract.ownerOf(0);
      const car1 = await nftContract.ownerOf(1);
      const car2 = await nftContract.ownerOf(2);

      expect(car0).to.equal(owner.address);
      expect(car1).to.equal(owner.address);
      expect(car2).to.equal(owner.address);
    });

    it('Should return the total supply of car NFTs by owner', async function () {
      await createCarNFT();
      await createCarNFT();
      await createCarNFT();

      const totalSupplyByOwner = await nftContract.balanceOf(owner.address);
      expect(totalSupplyByOwner).to.equal(3);
    });

    it('Should return the total supply of car NFTs', async function () {
      await createCarNFT();
      await createCarNFT();
      await createCarNFT();

      const totalSupply = await nftContract.totalSupply();
      expect(totalSupply).to.equal(3);
    });

    it('Should return zero if no car NFTs exist', async function () {
      const totalSupply = await nftContract.totalSupply();
      expect(totalSupply).to.equal(0);
    });
  });
});