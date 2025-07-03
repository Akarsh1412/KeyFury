import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-gray-100 font-sans">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default App