/* src/App.js */
import "./App.css";
import Nav from "./componets/Nav";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <>
      <Nav />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
