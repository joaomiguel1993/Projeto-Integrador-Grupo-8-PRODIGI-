# 🏥 PRODIGI — Projeto Integrador Grupo 8

Sistema de gestão de urgências hospitalares desenvolvido no âmbito do Projeto Integrador.

O projeto tem como objetivo suportar operações centrais de um serviço de urgência hospitalar, incluindo gestão de utentes, episódios, triagem, internamentos, atos clínicos, prescrições, profissionais e autenticação.

---

## 📌 Objetivo

O PRODIGI pretende disponibilizar uma API backend para suporte a fluxos de urgência hospitalar, permitindo consultar e gerir informação clínica e administrativa relevante. A aplicação está a ser desenvolvida com FastAPI, PostgreSQL e Docker, com autenticação baseada em JWT e passwords hashedas, que é uma abordagem comum e recomendada para APIs modernas em FastAPI [web:98][web:148][web:150].

---

## 📁 Estrutura do Repositório

**Legenda:** ✅ existente no repositório · ❌ ainda por implementar

```text
Projeto-Integrador-Grupo-8-PRODIGI-/
│
├── backend/                                      ✅
│   ├── __init__.py                               ✅
│   ├── SQL/                                      ✅
│   │   ├── createTables.sql                      ✅
│   │   └── populateDB.sql                        ✅
│   │
│   ├── routers/                                  ✅
│   │   ├── __init__.py                           ✅
│   │   ├── utentes.py                            ✅
│   │   ├── episodios.py                          ✅
│   │   ├── triagem.py                            ✅
│   │   ├── internados.py                         ✅
│   │   ├── internamento.py                       ✅
│   │   ├── proficionais.py                       ✅
│   │   ├── ato.py                                ✅
│   │   ├── prescricao.py                         ✅
│   │   ├── hospital.py                           ✅
│   │   └── auth.py                               ✅
│   │
│   ├── auth/                                     ✅
│   │   └── security.py                           ✅
│   │
│   ├── models/                                   ✅
│   │   ├── __init__.py                           ✅
│   │   ├── utente.py                             ✅
│   │   ├── episodio.py                           ✅
│   │   ├── triagem.py                            ✅
│   │   ├── internamento.py                       ✅
│   │   ├── ato.py                                ✅
│   │   ├── prescricao.py                         ✅
│   │   ├── hospital.py                           ✅
│   │   ├── profissional.py                       ✅
│   │   └── auth.py                               ✅
│   │
│   ├── dao/                                      ✅
│   │   ├── __init__.py                           ✅
│   │   ├── utente_dao.py                         ✅
│   │   ├── episodio_dao.py                       ✅
│   │   ├── triagem_dao.py                        ✅
│   │   ├── internamento_dao.py                   ✅
│   │   ├── ato_dao.py                            ✅
│   │   ├── prescricao_dao.py                     ✅
│   │   ├── hospital_dao.py                       ✅
│   │   └── profissional_dao.py                   ✅
│   │
│   ├── repositories/                             ✅
│   │   ├── __init__.py                           ✅
│   │   ├── utentes_repository.py                 ✅
│   │   ├── episodios_repository.py               ✅
│   │   ├── triagens_repository.py                ✅
│   │   ├── internamentos_repository.py           ✅
│   │   ├── atos_repository.py                    ✅
│   │   ├── prescricoes_repository.py             ✅
│   │   ├── hospitais_repository.py               ✅
│   │   └── profissionais_repository.py           ✅
│   │
│   ├── db.py                                     ✅
│   ├── main.py                                   ✅
│   ├── hash_password.py                          ✅
│   ├── requirements.txt                          ✅
│   └── update_passwords.py                       ✅
│
├── web/                                          ❌
│   ├── login.html                                ❌
│   ├── triagem.html                              ❌
│   ├── dashboard.html                            ❌
│   ├── styles/                                   ❌
│   │   └── styles.css                            ❌
│   └── scripts/                                  ❌
│       ├── login.js                              ❌
│       ├── triagem.js                            ❌
│       ├── dashboard.js                          ❌
│       ├── api.js                                ❌
│       ├── auth.js                               ❌
│       └── app.js                                ❌
│
├── android/                                      ❌
│
├── ia/                                           ❌
│   ├── modelo.py                                 ❌
│   ├── treino.py                                 ❌
│   ├── gerar_dados.py                            ❌
│   ├── dados_sinteticos.sql                      ❌
│   └── modelo_urgencias.pkl                      ❌
│
├── docs/                                         ✅
├── Dockerfile                                    ✅
├── docker-compose.yml                            ✅
├── .env.example                                  ✅
├── .gitignore                                    ✅
└── README.md                                     ✅
```

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Estado |
|--------|------------|--------|
| Base de dados | PostgreSQL + pgAdmin | ✅ Implementado |
| Backend / API | FastAPI + Uvicorn | ✅ Implementado |
| Acesso a dados | psycopg2 + SQL puro | ✅ Implementado |
| Autenticação | JWT + passlib + bcrypt | ✅ Implementado |
| Validação de dados | Pydantic | 🟡 Parcial |
| Arquitetura modular | Routers + DAO + Repositories | ✅ Implementado |
| Frontend Web | HTML5 + CSS3 + JavaScript | ❌ Não implementado |
| Containerização | Docker + Docker Compose | ✅ Implementado |
| Controlo de versões | Git + GitHub | ✅ Implementado |
| App Móvel | Android | ❌ Planeado |
| IA / ML | scikit-learn + pandas + numpy | ❌ Planeado |
| Testes | pytest + FastAPI TestClient | ❌ Planeado |

### Bibliotecas principais
- `fastapi`
- `uvicorn`
- `psycopg2`
- `pydantic`
- `python-jose`
- `passlib`
- `bcrypt`
- `python-multipart`
- `python-dotenv`

A autenticação com bearer token, OAuth2/JWT e hashing de passwords é uma prática documentada na própria documentação do FastAPI para proteger endpoints e evitar armazenamento de passwords em texto simples [web:98][web:140][web:148].

---

## ✅ Estado Atual do Projeto

### Backend
- API funcional com FastAPI.
- Routers separados por domínio.
- Ficheiro `db.py` responsável pela ligação e execução de queries.
- Estrutura modular com `dao/`, `repositories/` e `models/`.
- Autenticação implementada.

### Base de Dados
- Scripts SQL disponíveis para criação e população da base de dados.
- Integração preparada com PostgreSQL.
- Suporte a execução com Docker Compose, um padrão comum para stacks FastAPI + PostgreSQL [web:90][web:93][web:144].

### Frontend
- Ainda não implementado.
- A pasta `web/` está prevista, mas os ficheiros ainda não existem.

### Mobile e IA
- Estrutura prevista, mas ainda por iniciar.

---

## 🚀 Como executar o projeto

### Opção 1 — Docker

```bash
cp .env.example .env
docker compose up --build
```

Parar os serviços:

```bash
docker compose down
```

Reiniciar tudo e apagar volumes:

```bash
docker compose down -v
docker compose up --build
```

Usar Docker Compose para subir FastAPI e PostgreSQL é uma abordagem comum e prática para desenvolvimento local, especialmente quando a app depende de serviços acoplados como base de dados [web:90][web:93][web:144].

### Opção 2 — Execução local

```bash
git clone https://github.com/joaomiguel1993/Projeto-Integrador-Grupo-8-PRODIGI-.git
cd Projeto-Integrador-Grupo-8-PRODIGI-
cp .env.example .env
```

Criar e ativar ambiente virtual:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
```

No Windows:

```bash
.venv\Scripts\activate
```

Instalar dependências:

```bash
pip install -r requirements.txt
```

Executar a API:

```bash
uvicorn backend.main:app --reload
```

A organização de aplicações FastAPI maiores em múltiplos ficheiros e routers é suportada diretamente pela framework e facilita a escalabilidade da aplicação [web:98][web:141].

---

## 🌐 URLs úteis

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- pgAdmin: `http://localhost:8080`

A documentação automática via Swagger UI e ReDoc faz parte das funcionalidades nativas do FastAPI, o que ajuda no teste e validação rápida dos endpoints [web:98].

---

## 🔌 Endpoints disponíveis

| Módulo | Estado | Exemplos |
|--------|--------|----------|
| Auth | ✅ | `POST /auth/login`, `POST /auth/register` |
| Utentes | ✅ | `GET /api/utentes/` |
| Episódios | ✅ | `GET /api/episodios/` |
| Triagem | ✅ | `GET /api/triagem/` |
| Internados | ✅ | `GET /api/internados/` |
| Internamentos | ✅ | `GET /api/internamentos/` |
| Profissionais | ✅ | `GET /api/proficionais/` |
| Atos | ✅ | `GET /api/atos/` |
| Prescrições | ✅ | `GET /api/prescricoes/` |
| Hospitais | ✅ | `GET /api/hospitais/` |

> Nota: os endpoints refletem a estrutura atual do backend e podem ser expandidos com operações POST, PUT e DELETE conforme a evolução do projeto.

---

## 🔐 Autenticação

O projeto utiliza autenticação baseada em JWT com passwords hashedas antes de serem armazenadas, o que é recomendado para reduzir o risco em caso de exposição da base de dados [web:98][web:150]. O fluxo de autenticação com bearer token é uma das abordagens centrais documentadas pelo FastAPI para APIs seguras [web:98][web:148].

---

## 🗄️ Base de dados

Executar os scripts SQL manualmente:

```bash
psql -U postgres -d Projeto_Integrador_G08 -f backend/SQL/createTables.sql
psql -U postgres -d Projeto_Integrador_G08 -f backend/SQL/populateDB.sql
```

Comandos úteis em `psql`:

```sql
\dt
SELECT * FROM utentes LIMIT 5;
SELECT * FROM internados LIMIT 5;
SELECT * FROM profissionais LIMIT 5;
```

---

## 🔄 Git — comandos úteis

### Fluxo diário

```bash
git add .
git commit -m "feat: atualização backend"
git pull origin main
git push origin main
```

### Cheatsheet

| Situação | Comando |
|----------|---------|
| Ver estado | `git status` |
| Ver diferenças | `git diff` |
| Buscar atualizações | `git pull origin main` |
| Histórico simples | `git log --oneline` |
| Primeiro push | `git push -u origin main` |
| Repor branch local | `git fetch origin && git reset --hard origin/main` |

---

## 🐍 Comandos úteis de desenvolvimento

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
python -m backend.update_passwords
```

---

## 📋 Roadmap

### Alta prioridade
- Consolidar ligação dos routers aos repositories.
- Finalizar validação com Pydantic.
- Rever nomes inconsistentes de ficheiros/imports.
- Criar frontend base.

### Média prioridade
- Adicionar endpoints POST, PUT e DELETE em falta.
- Melhorar tratamento de erros.
- Criar testes para endpoints principais.

### Baixa prioridade
- Iniciar módulo Android.
- Desenvolver módulo de IA/ML.
- Preparar deploy.

---

## 📅 Cronograma

| Fase | Data | Peso | Estado |
|------|------|------|--------|
| Intermédia | 17 Abr 2026 | 10% | Em progresso |
| Defesa | 25–26 Mai 2026 | 70% | Planeado |
| Apresentação | 28 Mai 2026 | 5% | Planeado |
| Relatório | 28 Mai 2026 | 15% | Planeado |

---

## 👥 Grupo 8

- João Martins
- João Sacramento
- Luis Franco
- Pedro Antunes