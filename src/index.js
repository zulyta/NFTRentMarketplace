import { BigNumber, Contract, providers, ethers, utils } from "ethers";



//import miPrimerTknAbi from "../artifacts/contracts/MiPrimerToken.sol/MiPrimerToken.json";

import nftTknAbi from "../artifacts/contracts/NFT.sol/NFT.json";
import rentCarTknAbi from "../artifacts/contracts/RentCar.sol/RentCar.json";


window.ethers = ethers;

let provider, signer, account;
let pubSContractAdd;
let usdcTkContract, miPrTokenContract, nftTknContract, rentCarContract;

// REQUIRED
// Conectar con metamask
// OPTIONAL
// No require conexion con Metamask
// Usar JSON-RPC
// Se pueden escuchar eventos de los contratos usando el provider con RPC
function initSCsMumbai() {

  const urlProvider = "https://polygon-mumbai.g.alchemy.com/v2/ImL76Y58Mvk3w8TxYK843RPMK7dNJ8RQ ";
  provider = new ethers.providers.JsonRpcProvider(urlProvider);

  const nftAddress = "0x42F5E1D2cA39eCD348001a9F28ac03D06ffFE9f4";
  const rentcAddress = "0xCDAEb5445Fc45E5548097a18Dc3640A2D84Ef0A8";
  nftTknContract = new Contract(nftAddress,nftTknAbi.abi, provider);
  rentCarContract = new Contract(rentcAddress,rentCarTknAbi.abi, provider)

}

function setUpListeners() {
  // Connect to Metamask
  var btnConnect = document.getElementById("connect");
  btnConnect.addEventListener("click", async function () {
    if (window.ethereum) {
      [account] = await ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Billetera metamask", account);

      provider = new providers.Web3Provider(window.ethereum);
      signer = provider.getSigner(account);
      window.signer = signer;

      //var balanceOfUsdc = await usdcTkContract.connect(signer).balanceOf(account);
      //var usdcBalance = document.getElementById("usdcBalance");
      //usdcBalance.textContent = balanceOfUsdc.toString();

      //var balanceOfTkn = await miPrTokenContract.connect(signer).balanceOf(account);
      //var miPrimerTknBalance = document.getElementById("miPrimerTknBalance");
      //miPrimerTknBalance.textContent = balanceOfTkn.toString();
    }
  });

  //Cambiar a Mumbai
  var btnSwitch = document.getElementById("switch");
  btnSwitch.addEventListener("click", async function () {
    if (window.ethereum) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: utils.hexValue(Number("80001")),
          chainName: "Mumbai (Polygon) Testnet",
          nativeCurrency: {name:"MATIC",symbol:"MATIC", decimals:18},
          rpcUrls: ["https://polygon-mumbai.g.alchemy.com/v2/ImL76Y58Mvk3w8TxYK843RPMK7dNJ8RQ"],
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
        }]
      });
    } else{
      console.log("Not metamask detected");
    }
  });

  //USD Coin Balance Refresh
  var btnUsdcUpdate = document.getElementById("usdcUpdate");
  btnUsdcUpdate.addEventListener("click", async function () {

    var balanceOfUsdc = await usdcTkContract.connect(signer).balanceOf(account);
    console.log("balance of Usdc ",balanceOfUsdc.toString());
    var usdcBalance = document.getElementById("usdcBalance");
    usdcBalance.textContent = balanceOfUsdc.toString();
  });

  //Mi Primer Token Balance Refresh
  var btnTkn = document.getElementById("miPrimerTknUpdate");
  btnTkn.addEventListener("click", async function () {

    var balanceOfTkn = await miPrTokenContract.connect(signer).balanceOf(account);
    console.log("balance of MiPrimerToken ",balanceOfTkn.toString());
    var miPrimerTknBalance = document.getElementById("miPrimerTknBalance");
    miPrimerTknBalance.textContent = balanceOfTkn.toString();
  });

  //Approve Mi Primer Token
  var btnApprove = document.getElementById("approveButton");
  btnApprove.addEventListener("click", async function () {
    
    var txtApprove = document.getElementById("approveInput").value;
    var amount = BigNumber.from(`${txtApprove}000000000000000000`);
        
    var tx = await miPrTokenContract.connect(signer).approve(pubSContract.address, amount);
    return await tx.wait();
  });

  //Purchase By Id
  var btnPurchaseId = document.getElementById("purchaseButton");
  btnPurchaseId.addEventListener("click", async function () {

    //var spanError = document.getElementById("purchaseError");
    var txtPurchase = document.getElementById("purchaseInput").value;
    var value = BigNumber.from(`${txtPurchase}`);
    
    var tx = await pubSContract.connect(signer).purchaseNftById(value)
    var response = await tx.wait();
    
    return response;
  });

  //Purchase Nft (with Ether)
  var btnPurchaseEth = document.getElementById("purchaseEthButton"); 
  btnPurchaseEth.addEventListener("click", async function () {

    const transaction = {
      value: ethers.utils.parseEther("0.01"),
    };

    var tx = await pubSContract.connect(signer).depositEthForARandomNft(transaction);

    var response = await tx.wait();
    console.log(response);
    return response;

  });

  //Send Ether to Contract
  var btnSendEth = document.getElementById("sendEtherButton");   
  btnSendEth.addEventListener("click", async function () {
       
    var tx = await signer.sendTransaction({
      to: pubSContractAdd,
      value: ethers.utils.parseEther("0.01"),
      gasLimit: 1200000,
    });

    return await tx.wait();
  });
}

function setUpEventsContracts() {
  // nftTknContract.on
  nftTknContract.on("Transfer", (from, to, id) => {
    console.log("from", from);
    console.log("to", to);
    console.log("tokenId", id);
    var ul = document.getElementById("nftList");
    var li = document.createElement("li");
    var children = ul.children.length + 1
    li.setAttribute("id", "element" + children)
    li.appendChild(document.createTextNode("Transfer from " + from + " to " + to + " tokenId " + id));
    ul.appendChild(li)
  });
}

async function setUp() {
  
  initSCsMumbai();
  await setUpListeners();
  setUpEventsContracts();
}

setUp()
  .then()
  .catch((e) => console.log(e));
