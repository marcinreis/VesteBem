# VesteBem

Plataforma digital de doação de roupas que conecta doadores a beneficiários e ONGs, com foco em melhorar a distribuição geográfica e a qualidade das peças entregues a pessoas em situação de vulnerabilidade social.

> Projeto acadêmico — Universidade de Fortaleza (UNIFOR), Análise e Desenvolvimento de Sistemas. Versão do documento de requisitos: **2.1**. Conclusão prevista: **13/06/2026**.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Equipe](#equipe)
- [Stack e Ferramentas](#stack-e-ferramentas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar](#como-rodar)
- [Atores do Sistema](#atores-do-sistema)
- [Requisitos Funcionais](#requisitos-funcionais)
- [Requisitos Não Funcionais](#requisitos-não-funcionais)
- [Regras de Negócio](#regras-de-negócio)
- [Casos de Uso](#casos-de-uso)
- [Arquitetura](#arquitetura)
- [Fluxo da Requisição](#fluxo-da-requisição)
- [Glossário](#glossário)

---

## Visão Geral

O VesteBem facilita o processo de doação de roupas, organizando as necessidades dos beneficiários para uma distribuição otimizada e assertiva. A plataforma permite:

- Cadastro de doadores, beneficiários e ONGs com permissões distintas.
- Cadastro, edição e acompanhamento de doações de peças de roupa.
- Agendamento de coletas em domicílio e consulta de pontos de entrega.
- Catálogo de roupas disponíveis com filtros por tipo, tamanho e localização.
- Solicitação de roupas por beneficiários e ONGs.
- Geração de relatórios de impacto social (peças arrecadadas, distribuídas e beneficiários atendidos).

**Restrições de implementação:** sem apoio financeiro, 6h semanais de dedicação, sem turnos em fins de semana ou feriados, IDE Visual Studio, repositório no GitHub, gerenciamento via Trello, interface seguindo as Heurísticas de Nielsen.

---

## Equipe

| Membro              | Responsabilidade        |
|---------------------|-------------------------|
| Saulo Ribeiro       | Back-end (Gerente)      |
| Gabriel Felix Paim  | Banco de Dados          |
| Julio               | Front-end               |
| Marcio Reis         | Front-end / Q.A         |

---

## Stack e Ferramentas

- **IDE:** Visual Studio Code
- **Front-end:** React.js (Vite) + Bootstrap + React Router
- **Back-end:** Node.js + Express
- **Banco de dados / Auth:** Firebase (Firestore + Firebase Auth) via SDK Firebase Admin
- **Repositório:** GitHub
- **Gerenciamento:** Trello
- **Browsers suportados:** Chrome, Firefox, Edge
- **SO mínimo:** Windows 10 ou superior

---

## Estrutura do Projeto

```
VesteBem/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/        # auth, doacao, org, admin
│   │   ├── middlewares/        # aspects: auth, log, validation (POA)
│   │   ├── routes/             # auth, doacao, org, admin
│   │   ├── services/           # regras de negócio + Firebase
│   │   └── index.js            # entrypoint Express
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── pages_css/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Como Rodar

### Back-end

```bash
cd backend
npm install
cp .env.example .env   # preencher credenciais Firebase
npm run dev            # node --watch src/index.js
```

API sobe em `http://localhost:3000`.

### Front-end

```bash
cd frontend
npm install
npm run dev            # vite
```

App sobe em `http://localhost:5173` (porta padrão do Vite).

---

## Atores do Sistema

| ID    | Ator              | Descrição                                                          |
|-------|-------------------|--------------------------------------------------------------------|
| AT01  | Usuário           | Qualquer usuário autenticado.                                      |
| AT02  | Doador            | Cadastra e doa peças de roupa.                                     |
| AT03  | Beneficiário      | Pessoa física que solicita ou recebe roupas.                       |
| AT04  | ONG / Instituição | Entidade que recebe doações para redistribuição.                   |
| AT05  | Administrador     | Gestão da plataforma e geração de relatórios.                      |

---

## Requisitos Funcionais

| ID      | Requisito                  | Descrição                                                                                              |
|---------|----------------------------|--------------------------------------------------------------------------------------------------------|
| REF01   | Cadastro na Plataforma     | Doadores, beneficiários e ONGs devem se cadastrar para acessar funcionalidades.                        |
| REF02   | Logar na Plataforma        | Login via e-mail e senha cadastrados.                                                                  |
| REF02b  | Efetuar Logout             | Encerrar sessão a qualquer momento, redirecionando para a tela de login.                               |
| REF03   | Recuperar Senha            | Recuperação via e-mail cadastrado.                                                                     |
| REF04   | Cadastrar Doação           | Doador informa tipo, tamanho, conservação, foto e descrição da peça.                                   |
| REF05   | Editar Doação              | Doador edita peças que cadastrou enquanto status for `Disponível`.                                     |
| REF06a  | Confirmar Entrega          | Alterar status para `Entregue` após entrega no ponto de coleta. Irreversível sem admin.                |
| REF06b  | Cancelar Doação            | Marcar doação como `Cancelada` enquanto status for `Disponível`.                                       |
| REF07   | Visualizar Minhas Doações  | Doador vê todas as peças cadastradas e seus status.                                                    |
| REF08   | Visualizar Catálogo        | Beneficiário/ONG vê roupas disponíveis com filtros por tipo, tamanho e localização.                    |
| REF09   | Solicitar Roupas           | Beneficiário ou ONG faz solicitação informando tipo, tamanho e quantidade.                             |
| REF10   | Agendar Coleta             | Doador agenda coleta em domicílio ou consulta pontos de entrega.                                       |
| REF11   | Visualizar Pontos de Coleta| Página com pontos físicos parceiros (igrejas, escolas, empresas, centros comunitários).                |
| REF12   | Cadastrar ONG/Instituição  | Cadastro institucional para receber doações organizadas.                                               |
| REF13   | Editar Dados do Usuário    | Editar nome, e-mail, telefone, endereço.                                                               |
| REF14   | Alterar Senha              | Alteração de senha respeitando critérios de RGN01.                                                     |
| REF15   | Gerar Relatório de Impacto | Relatórios com peças arrecadadas, distribuídas e beneficiários atendidos.                              |

---

## Requisitos Não Funcionais

| ID    | Tipo                  | Descrição                                                                              |
|-------|-----------------------|----------------------------------------------------------------------------------------|
| RNF01 | Usabilidade           | Interface intuitiva, responsiva, seguindo Heurísticas de Nielsen.                       |
| RNF02 | Segurança de Acesso   | Acesso controlado por e-mail e senha; somente cadastrados podem usar funcionalidades.   |
| RNF03 | Disponibilidade       | Plataforma disponível 24/7.                                                             |
| RNF04 | Prevenção de Erros    | Mensagens claras de confirmação e validação.                                            |
| RNF05 | Desempenho            | Resposta em até 3 segundos em condições normais.                                        |
| RNF06 | Compatibilidade       | Acessível via Chrome, Firefox e Edge.                                                   |

---

## Regras de Negócio

| ID     | Req. Relacionado     | Descrição                                                                                       |
|--------|----------------------|-------------------------------------------------------------------------------------------------|
| RGN01  | REF01, REF14         | Senha com no mínimo 8 caracteres, incluindo letras, números e símbolos.                         |
| RGN02  | REF04, REF06a, REF06b| Sistema armazena todos os dados das peças junto com seu status atual.                           |
| RGN03  | REF06a               | Peça com status `Entregue` não retorna a `Disponível` sem intervenção do administrador.         |
| RGN03b | REF06b               | Peça só pode ser cancelada com status `Disponível`. Peças `Entregue` não podem ser canceladas.  |
| RGN04  | REF09                | Solicitação só pode ser feita por beneficiários ou ONGs cadastrados e verificados.              |
| RGN05  | REF15                | Relatório de impacto social atualiza automaticamente a cada doação distribuída.                 |

---

## Casos de Uso

| ID     | Atores       | Caso de Uso                       | RF Relacionado |
|--------|--------------|-----------------------------------|----------------|
| UC01   | AT01–AT05    | Realizar Cadastro                 | REF01          |
| UC02   | AT01–AT05    | Recuperar Senha                   | REF03          |
| UC03   | AT01–AT05    | Efetuar Login                     | REF02          |
| UC04   | AT01–AT05    | Efetuar Logout                    | REF02b         |
| UC05   | AT02         | Cadastrar Doação de Roupa         | REF04          |
| UC06   | AT02         | Editar Doação Cadastrada          | REF05          |
| UC07a  | AT02         | Confirmar Entrega da Doação       | REF06a         |
| UC07b  | AT02         | Cancelar Doação                   | REF06b         |
| UC08   | AT02         | Visualizar Minhas Doações         | REF07          |
| UC09   | AT02         | Agendar Coleta                    | REF10          |
| UC10   | AT03, AT04   | Visualizar Catálogo de Roupas     | REF08          |
| UC11   | AT03, AT04   | Solicitar Roupas                  | REF09          |
| UC12   | AT01–AT05    | Visualizar Pontos de Coleta       | REF11          |
| UC13   | AT01–AT05    | Editar Dados do Usuário           | REF13          |
| UC14   | AT05         | Gerar Relatório de Impacto Social | REF15          |

---

## Arquitetura

Arquitetura em **3 camadas** com orientação a aspectos (POA) no back-end:

- **Camada de Apresentação** (navegador web) — perfis Usuário, ONG, Admin.
- **Camada de Aplicação** (Node.js + Express) — módulos de Autenticação, Doações, Catálogo e Relatórios.
- **Camada de Dados** (Firebase / Firestore) — coleções `usuarios`, `doacoes`, `solicitacoes`, `coletas`, `pontos`.

Comunicação Apresentação ↔ Aplicação via **HTTPS**; Aplicação ↔ Dados via **SDK Firebase**.

### Modelo de Domínio (resumo)

- **Usuario** — `id, nome, email, senha, telefone, endereco` (`login`, `logout`, `editarDados`)
- **Doacao** — `id, usuarioId, tipoPeca, tamanho, conservacao, status, fotoUrl, descricao` (`alterarStatus`, `cancelar`)
- **Solicitacao** — `id, usuarioId, tipoPeca, tamanho, quantidade, dataSolicitacao` (`cancelar`)
- **Coleta** — `id, doacaoId, dataAgendada, tipo, endereco` (`confirmar`, `cancelar`)
- **ONG** — `id, cnpj, descricao` (`gerenciarDemanda`, `visualizarCatalogo`)
- **PontoColeta** — `id, nome, endereco, tipo` (`listar`)
- **Administrador** — `id, nivel` (`gerarRelatorio`, `gerenciarUsuarios`)

---

## Fluxo da Requisição

```
Request
  → route       (define o endpoint)
  → aspect      (valida, loga, verifica perfil)   ← POA
  → controller  (lógica + Firebase)
  → response
```

---

## Glossário

| Termo              | Definição                                                                                 |
|--------------------|-------------------------------------------------------------------------------------------|
| VesteBem           | Plataforma digital de doação de roupas conectando doadores a beneficiários e ONGs.        |
| Doador             | Usuário que cadastra e doa peças de roupa.                                                |
| Beneficiário       | Pessoa física em situação de vulnerabilidade social que solicita ou recebe roupas.        |
| ONG                | Organização Não Governamental que recebe doações para redistribuição.                     |
| Administrador      | Responsável pela gestão completa da plataforma e geração de relatórios.                   |
| Triagem            | Classificação e separação das peças de roupa recebidas.                                   |
| Ponto de Coleta    | Local físico parceiro (igrejas, escolas, empresas) onde as roupas são entregues.          |
| SRS                | Software Requirements Specification.                                                      |
| Status Disponível  | Estado inicial de uma peça recém-cadastrada, visível no catálogo.                         |
| Status Entregue    | Estado final após confirmação de entrega. Irreversível sem ação do administrador.         |
| Status Cancelada   | Peça cuja doação foi cancelada pelo doador antes da entrega.                              |

---

_Documento de referência: **VesteBem_v2.1.pdf** — Especificação de Requisitos de Software._
