import { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { getCars, gtotalSupply, tokenURI } from '../providers/NftService';
import { getCurrentAccount } from '../contracts';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [balance, setBalance] = useState('');

  const checkIfWalletIsConnected = async () => {
    /*
     * Primero nos aseguramos de que tenemos acceso a window.ethereum
     */
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Asegúrate de que tienes Metamask!');
        return;
      } else {
        console.log('Tenemos el objeto ethereum', ethereum);
      }
      /*
       * Comprobar que estamos autorizados para acceder a la cartera del usuario
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Cartera autorizada encontrada:', account);
        setCurrentAccount(account);
      } else {
        console.log('No se encontró ninguna cuenta autorizada');
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implementa tu método connectWallet aquí
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Descarga Metamask');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Conectado ', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getBalance = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = provider.getSigner(accounts[0]);
    window.signer = signer;
    const address = (await signer).getAddress();
    const balance = await provider.getBalance(address);
    setBalance(balance.toString());
  };
  /*
   * Esto ejecuta nuestra función cuando se carga la página.
   */
  const getTknID = async () => {
    const tonkenID = await getCurrentAccount();
    await tokenURI(tonkenID);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className='App text-center mt-4'>
      <h1 className='text-2xl font-bold text-gray-800'>
        Conecta con tu Wallet
      </h1>
      <p>
        Direcion:{' '}
        <span className='text-base text-gray-600'>{currentAccount}</span>
      </p>
      <p>
        Balance: <span className='text-base text-gray-600'>{balance}</span>
      </p>

      {!currentAccount && (
        <button
          className='waveButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={connectWallet}
        >
          Conecta tu cartera
        </button>
      )}
      {currentAccount && (
        <button
          className='waveButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={getBalance}
        >
          Obtener Balance
        </button>
      )}

      <button
        className='waveButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={getCars}
      >
        Obtener Lista de carros
      </button>

      <button
        className='waveButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={gtotalSupply}
      >
        Numero de tokens creados
      </button>

      <button
        className='waveButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={getTknID}
      >
        Muestra URI
      </button>
    </div>
  );
}
