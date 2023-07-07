// import { create } from 'ipfs-http-client'
import { useState } from 'react'
import { create as ipfsHttpClient } from "ipfs-http-client";

const projectId = "2S7zYY8TR6gbg7ScqVdwgQkDdTw"
const projectSecretKey = "09b5890aa31decd755045cb08a7cce49"
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);

export default function Collection() {

    const [images, setImages] = useState([])
    const [nameAut, setNameAut] = useState('')
    const [caract, setCarct] = useState('')
    const [garant, setGarant] = useState()
    const [interes, setInteres] = useState()
    const [price, setPrice] = useState()

  const ipfs = ipfsHttpClient({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization
    }
  })
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const form = event.target;
    const files = (form[0]).files;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }

    const file = files[0];
    // upload files
    const result = await ipfs.add(file);

    setImages([
      ...images,
      {
        cid: result.cid,
        path: result.path,
      },
    ]);

    form.reset();
  };
    

    return (
        <div className="App">
      {ipfs && (
        <>
          <h3>Publica tu auto</h3>
          <form onSubmit={onSubmitHandler}>
           

            <input type="file" name="file" />
            <div>
                <label htmlFor="nameAut">Nombre:</label>
                <input
                type="text"
                id="nameAut"
                value={nameAut}
                onChange={(e) => setNameAut(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="caract">Caracteristicas:</label>
                <input
                type="text"
                id="caract"
                value={caract}
                onChange={(e) => setCarct(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="price">Precio:</label>
                <input
                type="number"
                step="0.01"
                id="price"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                />
            </div>
            <div>
                <label htmlFor="garant">Garantia a solicitar:</label>
                <input
                type="number"
                step="0.01"
                id="garant"
                value={garant}
                onChange={(e) => setGarant(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="interes">Interes por entrega tardia en dias:</label>
                <input
                type="number"
                step="0.01"
                id="interes"
                value={interes}
                onChange={(e) => setInteres(e.target.value)}
                />
            </div>

            <button type="submit">Publicar</button>
          </form>
        </>
      )}
      <div>
        {images.map((image, index) => (
          <img
            alt={`Uploaded #${index + 1}`}
            src={"https://rentcarnft.infura-ipfs.io/ipfs/" + image.path}
            style={{ maxWidth: "400px", margin: "15px" }}
            key={image.cid.toString() + index}
          />
        ))}
      
        
        </div>
        
    </div>
    )
}


