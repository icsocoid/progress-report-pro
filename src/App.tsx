import './App.css'
import {Provider} from "react-redux";
import {store} from "@/redux/store.ts";
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {routes} from "@/router/routes.tsx";

function App() {
    const router = createBrowserRouter(routes)
  return (
    <>
      <Provider store={store}>
          <RouterProvider router={router} />
      </Provider>
    </>
  )
}

export default App
