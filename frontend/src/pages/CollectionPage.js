// import { create } from 'ipfs-http-client'
import { useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { safeMintOwner } from '../providers/NftService';
import { getCurrentAccount } from '../contracts';

// ACUÑACIÓN DE NFT
// SUBIDA DE NFT A INFURA

import { useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { getContracts } from '../configContracts';
import { BrowserProvider } from 'ethers';

const projectId = '2S7zYY8TR6gbg7ScqVdwgQkDdTw';
const projectSecretKey = '09b5890aa31decd755045cb08a7cce49';
const authorization = 'Basic ' + btoa(projectId + ':' + projectSecretKey);

export default function Collection() {
  const [nameAut, setNameAut] = useState('');
  const [caract, setCarct] = useState('');
  const [garant, setGarant] = useState();
  const [interes, setInteres] = useState();
  const [price, setPrice] = useState();
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return setImage(null);
    const imageURL = URL.createObjectURL(file);
    setImage(imageURL);
  };

  const ipfs = ipfsHttpClient({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
      authorization,
    },
  });

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const form = event.target;
    const files = form[0].files;

    if (!files || files.length === 0) {
      return alert('No files selected');
    }

    const file = files[0];
    // upload files
    const result = await ipfs.add(file);

    if (!result || !result.path) {
      return alert('File upload failed');
    }

    const account = await getCurrentAccount();

    try {
      await safeMintOwner({
        to: account,
        features: caract,
        guarantee: +garant,
        interestRate: +interes,
        nameAuto: nameAut,
        price: +price,
        uri: `https://rentcarnft.infura-ipfs.io/ipfs/${result.path}`, //https://rentcarnft.infura-ipfs.io/ipfs/
      });
    } catch (error) {
      console.error(error);
      return alert('Error al publicar');
    }
  };

  return (
    <>
      <h3 className='text-2xl font-bold text-gray-800'>Publica tu auto</h3>
      <div className='flex'>
        {ipfs && (
          <>
            <form onSubmit={onSubmitHandler} className='w-2/3 mr-4'>
              <div className='mb-4'>
                <label htmlFor='file' className='block'>
                  Archivo:
                </label>
                <input
                  type='file'
                  name='file'
                  onChange={handleImageChange}
                  className='border border-gray-300 p-2'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='nameAut' className='block'>
                  Nombre:
                </label>
                <input
                  type='text'
                  id='nameAut'
                  value={nameAut}
                  onChange={(e) => setNameAut(e.target.value)}
                  className='border border-gray-300 p-2'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='caract' className='block'>
                  Características:
                </label>
                <input
                  type='text'
                  id='caract'
                  value={caract}
                  onChange={(e) => setCarct(e.target.value)}
                  className='border border-gray-300 p-2'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='price' className='block'>
                  Precio:
                </label>
                <input
                  type='number'
                  step='0.00001'
                  id='price'
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className='border border-gray-300 p-2'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='garant' className='block'>
                  Garantía a solicitar:
                </label>
                <input
                  type='number'
                  step='0.00000001'
                  id='garant'
                  value={garant}
                  onChange={(e) => setGarant(e.target.value)}
                  className='border border-gray-300 p-2'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='interes' className='block'>
                  Interés por entrega tardía en días:
                </label>
                <input
                  type='number'
                  step='0.00000000000000001'
                  id='interes'
                  value={interes}
                  onChange={(e) => setInteres(e.target.value)}
                  className='border border-gray-300 p-2'
                />
              </div>

              <button
                type='submit'
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >
                Publicar
              </button>
            </form>
          </>
        )}
        {image && (
          <div className='w-1/3'>
            <img src={image} alt='Imagen seleccionada' className='max-w-full' />
          </div>
        )}
      </div>
    </>
  );
}
