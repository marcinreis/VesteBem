/*
 * Script CLI para criar (ou promover) um usuario admin do VesteBem.
 *
 * Uso:
 *   node scripts/criar-admin.js <email> <senha> [nome]
 *
 * Exemplo:
 *   node scripts/criar-admin.js admin@vestebem.com Admin@123 "Saulo Admin"
 *
 * Se o email ja existir no Firebase Auth, o script promove o usuario
 * existente a admin (sem alterar a senha).
 */
import 'dotenv/config'
import { auth, db, admin } from '../src/config/firebase.js'

const SENHA_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

function fail(msg, code = 1) {
  console.error(`[ERRO] ${msg}`)
  process.exit(code)
}

async function main() {
  const [, , email, senha, ...nomeParts] = process.argv
  const nome = nomeParts.join(' ').trim() || 'Administrador'

  if (!email || !senha) {
    fail('Uso: node scripts/criar-admin.js <email> <senha> [nome]')
  }
  if (!SENHA_REGEX.test(senha)) {
    fail('Senha deve ter 8+ caracteres com letras, numeros e simbolos (RGN01).')
  }

  let user
  try {
    user = await auth.createUser({ email, password: senha, displayName: nome })
    console.log(`[OK] Conta criada no Firebase Auth: uid=${user.uid}`)
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      user = await auth.getUserByEmail(email)
      console.log(`[INFO] Usuario ja existe no Auth (uid=${user.uid}). Promovendo a admin...`)
    } else {
      fail(`Falha ao criar usuario: ${err.message}`)
    }
  }

  const ref = db.collection('usuarios').doc(user.uid)
  const snap = await ref.get()

  if (snap.exists) {
    await ref.update({
      perfil: 'admin',
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`[OK] Perfil do documento Firestore atualizado para 'admin'.`)
  } else {
    await ref.set({
      nome,
      email,
      telefone: null,
      endereco: null,
      perfil: 'admin',
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`[OK] Documento Firestore criado com perfil 'admin'.`)
  }

  console.log('')
  console.log('Admin pronto para usar:')
  console.log(`  email: ${email}`)
  console.log(`  uid:   ${user.uid}`)
  console.log(`  nome:  ${nome}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('[ERRO inesperado]', err)
  process.exit(1)
})
