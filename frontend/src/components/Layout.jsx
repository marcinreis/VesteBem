import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />   {/* ← aqui renderiza a página atual */}
      <Footer/>
    </>
  );
}