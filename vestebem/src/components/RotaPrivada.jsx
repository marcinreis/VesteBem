import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

export default function RotaPrivada({ children }) {
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsub();
  }, []);

  if (usuario === undefined) return <p>Carregando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;

  return children;
}