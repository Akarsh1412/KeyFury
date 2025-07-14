import { Outlet } from "react-router-dom";
import Footer from "./pages/Footer";
import Navbar from "./pages/Navbar";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-gray-100 font-sans">
      <Navbar />
      <Outlet />
      <Footer />
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  )
}

export default App