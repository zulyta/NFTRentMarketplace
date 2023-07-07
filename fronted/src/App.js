/* src/App.js */
import "./App.css";
import Nav from "./componets/Nav";
import { createContext } from "react";
import { getContracts } from "./configContracts";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";

export const ContractsContext = createContext();

const contracts = getContracts();

function App() {
  return (
    <>
      <ContractsContext.Provider value={contracts}>
        <Nav />
        <RouterProvider router={router} />
      </ContractsContext.Provider>
    </>
  );
}

export default App;
