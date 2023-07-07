import { initSCsMumbai } from '../providers/conection'
import { useEffect, useState } from "react";
import { AbstractProvider } from "ethers";

export default function Home() {

  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
   /*
    * Primero nos aseguramos de que tenemos acceso a window.ethereum
    */
    try {
    const { ethereum } = window;
      if (!ethereum) {
        console.log("Asegúrate de que tienes Metamask!");
        return;
    } else {
        console.log("Tenemos el objeto ethereum", ethereum);
    }
    /*
    * Comprobar que estamos autorizados para acceder a la cartera del usuario
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Cartera autorizada encontrada:", account);
        setCurrentAccount(account);
    } else {
        console.log("No se encontró ninguna cuenta autorizada")
      }
    } catch (error) {
    console.log(error);
    }
  }

   /**
  * Implementa tu método connectWallet aquí
  */
   const connectWallet = async () => {
    try {
    const { ethereum } = window;
    if (!ethereum) {
        alert("Descarga Metamask");
        return;
    }
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    console.log("Conectado ", accounts[0]);
    setCurrentAccount(accounts[0]);

    let provider = new AbstractProvider.Web3Provider(ethereum);
    let signer = provider.getSigner(accounts[0]);
    window.signer = signer;
    
    } catch (error) {
    console.log(error)
    }
  }
 /*
  * Esto ejecuta nuestra función cuando se carga la página.
  */

 useEffect(() => {
  initSCsMumbai();
  checkIfWalletIsConnected();
}, []) 

  return (
    <div className="App">
      <h1>Conecta con tu Wallet</h1>
      <p>{currentAccount}</p>
      
      {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
            Conecta tu cartera
        </button>
        )}
    </div>
  )
}