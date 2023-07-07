/* src/App.js */
import './App.css'
import Home from './pages/HomePage'
import Collection from './pages/CollectionPage'
import Nav from './componets/Nav'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/collection",
    element: <Collection/>,
  }
]);

function App() {
  return (
    <div>
      <Nav/>
      <RouterProvider router={router} />
    </div>
  );
}

export default App