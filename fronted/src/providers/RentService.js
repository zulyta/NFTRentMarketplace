import { getRentCarContract, IRecntCarTkn } from "../contracts";
import { isAddress } from "ethers";

const isodate = "2023-07-12T09:00:00Z";
const date = new Date(isodate);
const startDate = Date.now(); // Fecha de inicio en milisegundos desde el 1 de enero de 1970 (Epoch)
const endDate = startDate + (24 * 60 * 60 * 1000); // Fecha de fin, sumando 24 horas al inicio

export const calculateRentalCost = async () => {

  const contract = await getRentCarContract();

  try {
    const totalCost = await contract.calculateRentalEstimateCost(2, startDate, endDate);
    console.log(totalCost)
  } catch (error) {
    console.log(error)
  }
}

export const createRental = async () => {
  const carIndex = 0;
  const tokenId = 0;

  const isodate = "2023-07-12T09:00:00Z";
  const date = new Date(isodate);
  const startDate = date.getMilliseconds(); // Fecha de inicio en milisegundos desde el 1 de enero de 1970 (Epoch)
  const endDate = startDate + (24 * 60 * 60 * 1000); // Fecha de fin, sumando 24 horas al inicio

  const contract = await getRentCarContract();
  try {
    const nft = await contract.createRental(
      carIndex,
      tokenId,
      startDate,
      endDate
    );

    console.log("rent: ", nft);
  } catch (error) {
    console.error(error);
  }
}


//getRentCarContract