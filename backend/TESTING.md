# Guia de testes — Back-end VesteBem (v1)

Este guia mostra, passo a passo, como testar cada endpoint da API VesteBem usando **Postman**. Não é necessário conhecer o código do back-end para seguir.

> Versão do back: v1 — auth + doações + catálogo (REF01–REF08).

---

## 1. Pré-requisitos

1. **Node.js 18 ou superior** instalado (`node -v` para conferir).
2. **Postman** instalado.
3. Um arquivo `backend/.env` preenchido. Copie de `.env.example` e peça as credenciais Firebase para o responsável (Marcio):
   ```env
   PORT=3000
   FIREBASE_PROJECT_ID=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_WEB_API_KEY=...
   ```
   > A `FIREBASE_PRIVATE_KEY` precisa estar entre aspas duplas e com `\n` literais (a aplicação substitui por quebras de linha em runtime).

4. No Firebase Console, confirme que estão habilitados:
   - **Authentication → Sign-in method → Email/Password**.
   - **Firestore Database** (qualquer região, modo *test* ou *production* tanto faz para v1).

5. Instalar dependências e subir o servidor:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Esperado no console: `Server running on port 3000`.

6. **Importar a coleção Postman:**
   - Abra Postman → *Import* → arquivo `backend/postman/VesteBem.postman_collection.json`.
   - Crie um environment chamado `VesteBem Local` com a variável `baseUrl = http://localhost:3000`.
   - O `idToken` é preenchido automaticamente pelo script de teste do `/auth/login`.

---

## 2. Health check

Primeiro confirme que a API está no ar.

| Item        | Valor                       |
|-------------|-----------------------------|
| Método      | `GET`                       |
| URL         | `{{baseUrl}}/`              |
| Headers     | (nenhum)                    |
| Body        | (nenhum)                    |

**Resposta esperada (200):**
```json
{ "message": "VesteBem API running" }
```

Se isso não funciona, o servidor não está rodando. Volte ao passo 5 dos pré-requisitos.

---

## 3. Endpoints

### 3.1 — Cadastrar usuário (REF01)

| Item        | Valor                                |
|-------------|--------------------------------------|
| Método      | `POST`                               |
| URL         | `{{baseUrl}}/auth/register`          |
| Headers     | `Content-Type: application/json`     |

**Body:**
```json
{
  "email": "doador1@vestebem.dev",
  "senha": "SenhaForte!1",
  "nome": "Maria Doadora",
  "telefone": "85999999999",
  "endereco": { "cidade": "Fortaleza", "uf": "CE" },
  "perfil": "doador"
}
```

**Resposta esperada (201):**
```json
{ "uid": "abc123...", "email": "doador1@vestebem.dev", "perfil": "doador" }
```

**Erros comuns:**
- **400 VALIDATION_ERROR** → senha fraca (precisa de 8+ caracteres com letra, número e símbolo) ou campo faltando. Mensagem detalha qual campo.
- **409 EMAIL_IN_USE** → o email já foi cadastrado.

➡️ **Próximo:** faça login com as mesmas credenciais.

---

### 3.2 — Login (REF02)

| Item        | Valor                                |
|-------------|--------------------------------------|
| Método      | `POST`                               |
| URL         | `{{baseUrl}}/auth/login`             |
| Headers     | `Content-Type: application/json`     |

**Body:**
```json
{ "email": "doador1@vestebem.dev", "senha": "SenhaForte!1" }
```

**Resposta esperada (200):**
```json
{
  "uid": "abc123...",
  "email": "doador1@vestebem.dev",
  "idToken": "eyJhbGciOi...",
  "refreshToken": "...",
  "expiresIn": "3600"
}
```

> A coleção do Postman já tem um *test script* que lê `idToken` e salva em `{{idToken}}`. Os próximos requests usam esse token automaticamente.

**Erros comuns:**
- **401 FIREBASE_AUTH_ERROR** → email ou senha errados, ou `FIREBASE_WEB_API_KEY` não configurada.

➡️ **Próximo:** cadastre uma doação.

---

### 3.3 — Cadastrar doação (REF04)

| Item        | Valor                                                    |
|-------------|----------------------------------------------------------|
| Método      | `POST`                                                   |
| URL         | `{{baseUrl}}/doacoes`                                    |
| Headers     | `Content-Type: application/json`<br>`Authorization: Bearer {{idToken}}` |

**Body:**
```json
{
  "tipoPeca": "Camisa",
  "tamanho": "M",
  "conservacao": "Seminova",
  "descricao": "Camisa de algodao azul",
  "fotoUrl": "https://exemplo.com/camisa.jpg",
  "cidade": "Fortaleza"
}
```

**Resposta esperada (201):**
```json
{
  "id": "DOC_ID_AUTOGERADO",
  "usuarioId": "abc123...",
  "tipoPeca": "Camisa",
  "tamanho": "M",
  "conservacao": "Seminova",
  "descricao": "Camisa de algodao azul",
  "fotoUrl": "https://exemplo.com/camisa.jpg",
  "cidade": "Fortaleza",
  "status": "Disponível"
}
```

> Anote o `id` retornado — você vai usar nos próximos requests. A coleção Postman já guarda em `{{doacaoId}}` automaticamente.

**Erros comuns:**
- **401 UNAUTHORIZED** → header `Authorization` faltando ou mal formatado.
- **400 VALIDATION_ERROR** → campos obrigatórios faltando (`tipoPeca`, `tamanho`, `conservacao`).

➡️ **Próximo:** liste suas doações.

---

### 3.4 — Listar minhas doações (REF07)

| Item        | Valor                                       |
|-------------|---------------------------------------------|
| Método      | `GET`                                       |
| URL         | `{{baseUrl}}/doacoes/me`                    |
| Headers     | `Authorization: Bearer {{idToken}}`         |

**Resposta esperada (200):** array com todas as doações do usuário logado.
```json
[
  { "id": "...", "tipoPeca": "Camisa", "status": "Disponível", ... }
]
```

➡️ **Próximo:** edite uma doação.

---

### 3.5 — Editar doação (REF05)

| Item        | Valor                                                    |
|-------------|----------------------------------------------------------|
| Método      | `PUT`                                                    |
| URL         | `{{baseUrl}}/doacoes/{{doacaoId}}`                       |
| Headers     | `Content-Type: application/json`<br>`Authorization: Bearer {{idToken}}` |

**Body** (envie só os campos que quer mudar):
```json
{ "tamanho": "G", "conservacao": "Nova" }
```

**Resposta esperada (200):** doação atualizada.

**Erros comuns:**
- **403 FORBIDDEN** → você está tentando editar a doação de outro usuário.
- **409 STATUS_INVALIDO** → a doação não está mais com status `Disponível` (foi entregue ou cancelada).
- **404 NOT_FOUND** → ID da doação não existe.

➡️ **Próximo:** liste o catálogo público pra ver a doação aparecendo.

---

### 3.6 — Catálogo público (REF08)

| Item        | Valor                                |
|-------------|--------------------------------------|
| Método      | `GET`                                |
| URL         | `{{baseUrl}}/catalogo`               |
| Headers     | (nenhum — endpoint público)          |
| Query params (opcionais) | `tipo=Camisa`, `tamanho=M`, `cidade=Fortaleza` |

Exemplos:
- `GET /catalogo` → todas as doações `Disponível`.
- `GET /catalogo?tipo=Camisa&cidade=Fortaleza` → filtradas.

**Resposta esperada (200):** array de doações `Disponível`. **O campo `usuarioId` é omitido por privacidade.**

➡️ **Próximo:** confirme a entrega.

---

### 3.7 — Confirmar entrega (REF06a)

| Item        | Valor                                       |
|-------------|---------------------------------------------|
| Método      | `PATCH`                                     |
| URL         | `{{baseUrl}}/doacoes/{{doacaoId}}/entregar` |
| Headers     | `Authorization: Bearer {{idToken}}`         |
| Body        | (nenhum)                                    |

**Resposta esperada (200):** doação com `status: "Entregue"`.

> ⚠️ **RGN03:** essa ação é **irreversível** sem intervenção do administrador. Uma doação `Entregue` não volta para `Disponível` por nenhum endpoint.

**Erros comuns:**
- **403 FORBIDDEN** → não é o dono.
- **409 STATUS_INVALIDO** → tentativa de entregar uma doação cancelada.

➡️ **Próximo:** confira que a doação **sumiu** do catálogo (`GET /catalogo`).

---

### 3.8 — Cancelar doação (REF06b)

| Item        | Valor                                       |
|-------------|---------------------------------------------|
| Método      | `PATCH`                                     |
| URL         | `{{baseUrl}}/doacoes/{{doacaoId}}/cancelar` |
| Headers     | `Authorization: Bearer {{idToken}}`         |
| Body        | (nenhum)                                    |

**Resposta esperada (200):** doação com `status: "Cancelada"`.

**Erros comuns:**
- **409 STATUS_INVALIDO** → a doação não está mais `Disponível` (RGN03b — não dá pra cancelar uma `Entregue`).

> Cancele uma doação **diferente** da que você marcou como entregue, ou crie uma nova só pra testar.

---

### 3.9 — Logout (REF02b)

| Item        | Valor                                |
|-------------|--------------------------------------|
| Método      | `POST`                               |
| URL         | `{{baseUrl}}/auth/logout`            |
| Headers     | `Authorization: Bearer {{idToken}}`  |
| Body        | (nenhum)                             |

**Resposta esperada (204):** sem conteúdo.

> Logout **revoga os refresh tokens** do usuário. Se você tentar usar o `idToken` antigo em outro request, vai receber **401 TOKEN_REVOKED**.

➡️ **Próximo:** teste a recuperação de senha.

---

### 3.10 — Recuperar senha (REF03)

| Item        | Valor                                |
|-------------|--------------------------------------|
| Método      | `POST`                               |
| URL         | `{{baseUrl}}/auth/recover-password`  |
| Headers     | `Content-Type: application/json`     |

**Body:**
```json
{ "email": "doador1@vestebem.dev" }
```

**Resposta esperada (204):** sem conteúdo. Um email de reset chega na caixa de entrada do usuário (cuidado com spam).

---

## 4. Fluxo recomendado de smoke test (5 min)

Execute nesta ordem para validar o sistema inteiro de uma vez:

| # | Ação                                                         | Esperado |
|---|--------------------------------------------------------------|----------|
| 1 | `GET /`                                                      | 200 — `VesteBem API running` |
| 2 | `POST /auth/register` (dados válidos)                        | 201 — `uid` retornado |
| 3 | `POST /auth/register` (senha `12345`)                        | 400 — RGN01 |
| 4 | `POST /auth/login`                                           | 200 — `idToken` salvo na env |
| 5 | `POST /doacoes` **sem** header                               | 401 |
| 6 | `POST /doacoes` **com** header                               | 201 — doação criada `Disponível` |
| 7 | `GET /doacoes/me`                                            | 200 — array com a doação |
| 8 | `PUT /doacoes/:id` mudando `tamanho`                         | 200 — atualizada |
| 9 | `PATCH /doacoes/:id/entregar`                                | 200 — status `Entregue` |
| 10 | `PUT /doacoes/:id` (tentando editar a entregue)             | 409 — RGN03 |
| 11 | `PATCH /doacoes/:id/cancelar` (na mesma entregue)           | 409 — RGN03b |
| 12 | `GET /catalogo`                                             | 200 — entregue **não aparece** |
| 13 | `POST /auth/logout`                                         | 204 |
| 14 | `POST /doacoes` com o token antigo                          | 401 — `TOKEN_REVOKED` |

Se os 14 passos passarem, a v1 está saudável. ✅

---

## 5. Troubleshooting

| Sintoma                                              | Causa provável                                                         | Como resolver |
|------------------------------------------------------|------------------------------------------------------------------------|---------------|
| Servidor crasha ao subir com `Failed to parse private key` | `FIREBASE_PRIVATE_KEY` no `.env` sem aspas ou sem `\n` literais   | Cole a chave entre aspas duplas, mantendo os `\n` exatos como vêm no JSON do service account. |
| `500 CONFIG_ERROR: FIREBASE_WEB_API_KEY nao configurada` | Variável faltando no `.env`                                        | Pegue em Project Settings → General → Web API Key e adicione no `.env`. |
| `401 FIREBASE_AUTH_ERROR INVALID_LOGIN_CREDENTIALS`  | Email não cadastrado, senha errada, ou Email/Password desabilitado     | Confirme as credenciais; habilite Authentication → Sign-in method → Email/Password no Console. |
| `5 NOT_FOUND` ou erro Firestore ao escrever          | Firestore Database não foi criado no projeto                           | Firebase Console → Build → Firestore Database → *Create Database*. |
| `401 TOKEN_EXPIRED`                                  | ID token vence em 1h por padrão                                        | Faça login de novo (`POST /auth/login`). |
| `401 TOKEN_REVOKED`                                  | Você fez logout e o token antigo foi invalidado                         | Faça login de novo. |

---

_Este arquivo é a documentação viva da API até a v2 ganhar Swagger/OpenAPI. Se algum endpoint mudar, atualize aqui também._
