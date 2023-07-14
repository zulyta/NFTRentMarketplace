//import { useEffect, useState } from "react";
//import { BrowserProvider } from "ethers";
import { createRental,calculateRentalCost} from "../providers/RentService";
//import { getCurrentAccount } from "../contracts";

export default function CoinPage() {
 
 

   
  return (
    <div className="App text-center mt-4">
      
        <button
          className="waveButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={createRental}
        > realizar transferencia
          
        </button>
        <button
          className="waveButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={calculateRentalCost}
        > Estimado de renta
          
        </button>

    </div>
  );
}
