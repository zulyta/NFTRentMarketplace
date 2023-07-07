/*import { useState } from 'react'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'

 configure Infura auth settings 
const projectId = "2S7zYY8TR6gbg7ScqVdwgQkDdTw"
const projectSecret = "09b5890aa31decd755045cb08a7cce49"
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

create the client 
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: auth,
  },
})

export default function Home() {
    const [fileUrl, updateFileUrl] = useState(``)
    async function onChange(e) {
      const file = e.target.files[0]
      try {
        const added = await client.add(file)
        const url = `https://infura-ipfs.io/ipfs/${added.path}`
        updateFileUrl(url)
        console.log("IPFS URI: ", url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }  
    }


    return (
        <div className="App">
     
      <h1>IPFS Example</h1>
      <input
        type="file"
        onChange={onChange}
      />
      {
        fileUrl && (
          <div>
            <img src={fileUrl} width="600px" />
            <a href={fileUrl} target="_blank">{fileUrl}</a>
          </div>
        )
      }
    </div>
    )
}

    */