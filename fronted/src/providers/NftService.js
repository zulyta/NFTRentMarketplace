import { getNftTknContract, INft } from "../contracts";
import { isAddress } from "ethers";


export const safeMintOwner = async ({
  to,
  uri,
  nameAuto,
  features,
  price,
  guarantee,
  interestRate,
}) => {
  const contract = await getNftTknContract();
  console.log("to", to);
  if (!to || typeof to !== "string" || !isAddress(to)) {
    console.error('La dirección "to" es inválida');
    return; // o realiza alguna acción adecuada en este caso
  }

  console.table(
    {
      to,
      uri,
      nameAuto,
      features,
      price,
      guarantee,
      interestRate
    }
  )

  try {
    const nft = await contract.safeMintOwner(
      to,
      uri,
      nameAuto,
      features,
      price,
      guarantee,
      interestRate
    );

    console.log("nft", nft);
  } catch (error) {
    console.error(error);
  }
};

export const getCars = async () => {

  try {
    const contract = await getNftTknContract();
    const listCar = await contract.getCars();

    console.log("Llamada exitosa", listCar.toString());

    return [];
  } catch (error) {
    console.error(error);
  }

}

export const gtotalSupply = async () => {

  try {
    
    console.log("Hola..");
    const contract = await getNftTknContract();
    console.log("Hola.22.");

    const  tsuply = await contract.totalSupply();
    console.log("Hola.33.");

    console.log("# Tokens creados", tsuply.toString());

    return [];
  } catch (error) {
    console.error(error);
  }

}


export const tokenURI = async (tokenId) => {

  try {
    const contract = await getNftTknContract();
   const  tknuri = await contract.tokenURI(0);
    console.log(INft.hasFunction("getCars"));

    console.log("# URL URI: ", tknuri.toString());

    return [];
  } catch (error) {
    console.error(error);
  }

}

