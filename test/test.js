const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 17 de Junio del 2023 GMT
var startDate = 1686960000;

var makeBN = (num) => ethers.BigNumber.from(String(num));

describe("MI PRIMER TOKEN TESTING", function () {
  var nftContract, publicSale, miPrimerToken, usdc;
  var owner, gnosis, alice, bob, carl, deysi;
  var nameToken = "MiPrimerToken";
  var symbolToken = "MPRTKN";
  var decimalsToken = 18;
  var nameUSDC = "USD Coin";
  var symbolUSDC = "USDC";
  var decimalsUSDC = 6;
  var nameNFT = "MiPrimerNft";
  var symbolNFT = "MPRNFT";

  before(async () => {
    [owner, gnosis, alice, bob, carl, deysi] = await ethers.getSigners();
  });

  // Estos dos métodos a continuación publican los contratos en cada red
  // Se usan en distintos tests de manera independiente
  // Ver ejemplo de como instanciar los contratos en deploy.js
  async function deployMPRTKN() {
    miPrimerToken = await deploySC("MiPrimerToken", []);
  }

  async function deployUSDC(){
    usdc = await deploySCNoUp("USDCoin", []);
  }

  async function deployNftSC() {
    nftContract = await deploySC("MiPrimerNft", []);
  }

  async function deployPublicSaleSC() {
    gnosis = ethers.utils.getAddress("0x34C2BCC3a6CEeC2bd6F995A0f749Ceb55464C503");
    publicSale = await deploySC("PublicSale", []);    
    publicSale.setMiPrimerToken(miPrimerToken.address);
    publicSale.setGnosisWalletAdd(gnosis);
  }

  describe("MiPrimerToken Smart Contract", () => {
    // Se publica el contrato antes de cada test
    beforeEach(async () => {
      await deployMPRTKN();
    });

    it("Verifica nombre", async () => {
      expect(await miPrimerToken.name()).to.be.equal(nameToken);
    });

    it("Verifica símbolo", async () => {
      expect(await miPrimerToken.symbol()).to.be.equal(symbolToken);
    });

    it("Verifica Decimales ", async () => {
      expect(await miPrimerToken.decimals()).to.be.equal(decimalsToken);
    });
  });

  describe("USDC Smart Contract", () => {
    
    beforeEach(async () => {
      await deployUSDC();
    });

    it("Verifica nombre", async () => {
      expect(await usdc.name()).to.be.equal(nameUSDC);
    });

    it("Verifica símbolo", async () => {
      expect(await usdc.symbol()).to.be.equal(symbolUSDC);
    });

    it("Verifica Decimales ", async () => {
      expect(await usdc.decimals()).to.be.equal(decimalsUSDC);
    });
  });

  describe("Mi Primer Nft Smart Contract", () => {
    
    beforeEach(async () => {
      await deployNftSC();
    });

    it("Verifica nombre colección", async () => {
      expect(await nftContract.name()).to.be.equal(nameNFT);
    });

    it("Verifica símbolo de colección", async () => {
      expect(await nftContract.symbol()).to.be.equal(symbolNFT);
    });

    it("No permite acuñar sin privilegio", async () => {
      await expect(
        nftContract.connect(alice).safeMint(alice.address,1)
      ).to.be.revertedWith(`AccessControl: account ${alice.address.toLowerCase()} is missing role ${MINTER_ROLE}`);
    });

    it("No permite acuñar doble id de Nft", async () => {
      //grant role
      await nftContract.grantRole(MINTER_ROLE, alice.address);

      //mint
      await expect(
        nftContract.connect(alice).safeMint(alice.address,1)
      ).to.changeTokenBalance(nftContract, alice.address, 1);

      //mint again
      await expect(
        nftContract.connect(alice).safeMint(alice.address,1)
      ).to.be.revertedWith("NFT: ID has been minted");
    });

    it("Verifica rango de Nft: [1, 30]", async () => {
      // Mensaje error: "NFT: Token id out of range"
      await expect(
        nftContract.connect(owner).safeMint(alice.address,0)
      ).to.be.revertedWith("NFT: Token id out of range");

      await expect(
        nftContract.connect(owner).safeMint(alice.address,31)
      ).to.be.revertedWith("NFT: Token id out of range");
    });

    it("Se pueden acuñar todos (30) los Nfts", async () => {
      var addressZero = "0x0000000000000000000000000000000000000000";
      for (let index = 1; index <= 30; index++) {
        //console.log(`mint ${index}`);
        await expect(
          nftContract.connect(owner).safeMint(alice.address,index)
        ).to.emit(nftContract, "Transfer")
            .withArgs(addressZero, alice.address, index);
      }
    });
  });

  describe("Public Sale Smart Contract", () => {
    // Se publica el contrato antes de cada test
    beforeEach(async () => {
      await deployMPRTKN();
      await deployPublicSaleSC();
    });

    it("No se puede comprar otra vez el mismo ID", async () => {
      
      //bob tiene los tokens disponibles
      await miPrimerToken.connect(owner).mint(bob.address, pEth("2000"));
      
      //bob otorga permisos a publicSale
      await miPrimerToken.connect(bob).approve(publicSale.address, pEth("2000"));

      await publicSale.connect(bob).purchaseNftById(1);
      
      await expect(
        publicSale.connect(bob).purchaseNftById(1)
      ).to.revertedWith('Public Sale: id not available');

    });

    it("IDs aceptables: [1, 30]", async () => {

      //bob tiene los tokens disponibles
      await miPrimerToken.connect(owner).mint(bob.address, pEth("2000"));

      //bob otorga permisos a publicSale
      await miPrimerToken.connect(bob).approve(publicSale.address, pEth("2000"));

      await expect(
        publicSale.connect(bob).purchaseNftById(0)
      ).to.be.revertedWith("NFT: Token id out of range");

      await expect(
        publicSale.connect(bob).purchaseNftById(31)
      ).to.be.revertedWith("NFT: Token id out of range");

    });

    it("Usuario no dio permiso de MiPrimerToken a Public Sale", async () => {
      
      //bob tiene los tokens disponibles
      await miPrimerToken.connect(owner).mint(bob.address, pEth("2000"));

      await expect(
        publicSale.connect(bob).purchaseNftById(5)
      ).to.be.revertedWith("Public Sale: Not enough allowance");

    });

    it("Usuario no tiene suficientes MiPrimerToken para comprar", async () => {

      //bob otorga permisos a publicSale (sin tener saldo)
      await miPrimerToken.connect(bob).approve(publicSale.address, pEth("2000"));

      await expect(
        publicSale.connect(bob).purchaseNftById(5)
      ).to.be.revertedWith("Public Sale: Not enough token balance");

    });

    describe("Compra grupo 1 de NFT: 1 - 10", () => {
      it("Emite evento luego de comprar", async () => {

        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("2000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("2000"));
        
        await expect(
          publicSale.connect(bob).purchaseNftById(5)
        ).to.emit(publicSale, "DeliverNft")
            .withArgs(bob.address, 5);
      });

      it("Disminuye balance de MiPrimerToken luego de compra", async () => {

        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("2000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("2000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(5)
        ).to.changeTokenBalance(miPrimerToken, bob.address, pEth("-500"));  //costo:500
      });

      it("Gnosis safe recibe comisión del 10% luego de compra", async () => {
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("2000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("2000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(5)
        ).to.changeTokenBalance(miPrimerToken, gnosis, pEth("50"));

      });

      it("Smart contract recibe neto (90%) luego de compra", async () => {
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("2000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("2000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(5)
        ).to.changeTokenBalance(miPrimerToken, publicSale.address, pEth("450"));
      });
    });

    describe("Compra grupo 2 de NFT: 11 - 20", () => {
      it("Emite evento luego de comprar", async () => {
        // ID = 15 ==> COSTO = 15000
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("20000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("20000"));
        
        await expect(
          publicSale.connect(bob).purchaseNftById(15)
        ).to.emit(publicSale, "DeliverNft")
            .withArgs(bob.address, 15);
      });

      it("Disminuye balance de MiPrimerToken luego de compra", async () => {
        // ID = 15 ==> COSTO = 15000
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("20000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("20000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(15)
        ).to.changeTokenBalance(miPrimerToken, bob.address, pEth("-15000"));
      });

      it("Gnosis safe recibe comisión del 10% luego de compra", async () => {
        // ID = 15 ==> COSTO = 15000
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("20000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("20000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(15)
        ).to.changeTokenBalance(miPrimerToken, gnosis, pEth("1500"));
      });

      it("Smart contract recibe neto (90%) luego de compra", async () => {
        // ID = 15 ==> COSTO = 15000
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("20000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("20000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(15)
        ).to.changeTokenBalance(miPrimerToken, publicSale.address, pEth("13500"));
      });
    });

    describe("Compra grupo 3 de NFT: 21 - 30", () => {
      var id =24, priceNFT, fee, net;
      before(async () => {
        var basePrice = 10000;
        var now = Math.floor(new Date().getTime() / 1000.0)
        var hourElapsed = Math.floor((now - startDate) / 3600);
        priceNFT = basePrice + hourElapsed * 1000;
        if (priceNFT > 50000) {
          priceNFT = 50000;
        }
        fee = (priceNFT * 10) / 100;
        net = priceNFT - fee;
      });

      it("Disminuye balance de MiPrimerToken luego de compra", async () => {
        // ID = 25 ==> COSTO MAXIMO= 50000
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("50000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("50000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(id)
        ).to.changeTokenBalance(miPrimerToken, bob.address, pEth(String(-priceNFT)));
      });

      it("Gnosis safe recibe comisión del 10% luego de compra", async () => {
        // ID = 25 ==> COSTO MAXIMO= 50000
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("50000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("50000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(id)
        ).to.changeTokenBalance(miPrimerToken, gnosis, pEth(String(fee)));
      });

      it("Smart contract recibe neto (90%) luego de compra", async () => {
        // ID = 25 ==> COSTO MAXIMO= 50000
        //bob tiene los tokens disponibles
        await miPrimerToken.connect(owner).mint(bob.address, pEth("50000"));

        //bob otorga permisos a publicSale
        await miPrimerToken.connect(bob).approve(publicSale.address, pEth("50000"));

        await expect(
          publicSale.connect(bob).purchaseNftById(id)
        ).to.changeTokenBalance(miPrimerToken, publicSale.address, pEth(String(net)));
      });
    });

    describe("Depositando Ether para Random NFT", () => {
      it("Método emite evento (30 veces) ", async () => {
        
        const transaction = {
          value: pEth("0.01"),
        };
        for (let index = 1; index <= 30; index++) {
          
          const tx = await publicSale.connect(owner).depositEthForARandomNft(transaction);
          // get all events of the tx
          const  result  = await tx.wait();
          //console.log(result);

          expect(result.events[0].event).to.equal("DeliverNft");

          
        }
      });

      it("Método falla la vez 31", async () => {
          const transaction = {
            value: pEth("0.01"),
          };
          for (let index = 1; index <= 30; index++) {
            
            const tx = await publicSale.connect(owner).depositEthForARandomNft(transaction);
            // get all events of the tx
            const  result  = await tx.wait();
            
            expect(result.events[0].event).to.equal("DeliverNft");
          }
          
          await expect(
            publicSale.connect(owner).depositEthForARandomNft(transaction)
          ).to.be.revertedWith("Public Sale: NFT not available");
      });

      it("Envío de Ether y emite Evento (30 veces)", async () => {

          const transaction = {
            to: publicSale.address,
            value: pEth("0.01")
          };

          for (let index = 1; index <= 30; index++) {
            const tx = await owner.sendTransaction(transaction);
            const  result  = await tx.wait();
          }
      });

      it("Envío de Ether falla la vez 31", async () => {
          const transaction = {
            to: publicSale.address,
            value: pEth("0.01")
          };

          for (let index = 1; index <= 30; index++) {
            const tx = await owner.sendTransaction(transaction);
            const  result  = await tx.wait();
          }
          await expect(
           bob.sendTransaction(transaction)
          ).to.be.revertedWith("Public Sale: NFT not available");
      });

      it("Da vuelto cuando y gnosis recibe Ether", async () => {
          
          const transaction = {
            to: publicSale.address,
            value: pEth("0.05")
          };
          await expect(
            await owner.sendTransaction(transaction)
          ).to.changeEtherBalances(   
               [owner.address, gnosis],
               [pEth("-0.01"), pEth("0.01")]
              );
      });
    });
  })
  
});

