import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
// Cadastro
export async function cadastrar(email, password, dadosExtras) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Salva dados extras (nome, role, telefone...) no Firestore
  await setDoc(doc(db, "usuarios", cred.user.uid), {
    uid: cred.user.uid,
    email,
    ...dadosExtras,
    criadoEm: new Date()
  });

  return cred.user;
}
// Login
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}
// Recuperar senha
export async function recuperarSenha(email) {
  await sendPasswordResetEmail(auth, email);
}
// Logout
export async function logout() {
  await signOut(auth);
}