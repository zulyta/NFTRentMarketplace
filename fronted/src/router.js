import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/HomePage";
import Collection from "./pages/CollectionPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/collection",
    element: <Collection />,
  },
]);
