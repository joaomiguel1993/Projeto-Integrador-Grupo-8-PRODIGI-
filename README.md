# 🏥 PRODIGI — Projeto Integrador Grupo 8

Sistema de gestão de urgências hospitalares desenvolvido no âmbito da unidade curricular de Projeto Integrador.

O projeto tem como objetivo suportar operações centrais de um serviço de urgência, incluindo gestão de utentes, episódios, triagem, internamentos, atos clínicos, prescrições, profissionais e autenticação.

---

## 📁 Estrutura do Repositório

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
├── web/                                          ✅
│   ├── Urgencias.html                            ✅
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

## ✅ Estado Atual

### Backend
- API em FastAPI com estrutura modular por routers.
- Ligação à base de dados PostgreSQL com `psycopg2`.
- Ficheiro `db.py` centralizado para execução de queries SQL.
- Autenticação com JWT e hashing de passwords.
- Separação progressiva por `dao/` e `repositories/`.

### Base de Dados
- Scripts SQL para criação e população da base de dados.
- Integração com PostgreSQL e suporte a pgAdmin via Docker.

### Frontend
- Estrutura inicial criada.
- `Urgencias.html` já existe.
- Restantes páginas ainda em desenvolvimento.

### Arquitetura
- `routers/` para endpoints.
- `dao/` para queries SQL.
- `repositories/` para organização da lógica de acesso a dados.
- `models/` para schemas Pydantic e validação.

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Estado |
|--------|------------|--------|
| Base de dados | PostgreSQL + pgAdmin | ✅ Implementado |
| Backend / API | FastAPI + Uvicorn | ✅ Implementado |
| Acesso a dados | psycopg2 + SQL puro | ✅ Implementado |
| Autenticação | JWT + passlib + bcrypt | ✅ Implementado |
| Validação | Pydantic | 🟡 Parcial |
| Frontend Web | HTML5 + CSS3 + JavaScript | 🟡 Parcial |
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

---

## 🚀 Como executar

### Docker

```bash
cp .env.example .env
docker compose up --build
```

Parar os serviços:

```bash
docker compose down
```

Recriar tudo e limpar volumes:

```bash
docker compose down -v
docker compose up --build
```

### Execução local

```bash
git clone https://github.com/joaomiguel1993/Projeto-Integrador-Grupo-8-PRODIGI-.git
cd Projeto-Integrador-Grupo-8-PRODIGI-
cp .env.example .env
```

Criar ambiente virtual e instalar dependências:

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

Iniciar a API:

```bash
uvicorn backend.main:app --reload
```

---

## 🌐 URLs úteis

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- pgAdmin: `http://localhost:8080`

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

> Nota: alguns endpoints podem ainda estar em evolução e a nomenclatura depende dos ficheiros atualmente carregados no `main.py`.

---

## 🔐 Autenticação

O projeto inclui autenticação baseada em JWT e hashing seguro de passwords, prática comum em FastAPI para proteger endpoints e validar utilizadores. As passwords não devem ser guardadas em texto simples e devem ser processadas com hashing antes de serem persistidas [web:92][web:95][web:98].

---

## 🗄️ Base de dados

Para inicializar manualmente a base de dados PostgreSQL:

```bash
psql -U postgres -d Projeto_Integrador_G08 -f backend/SQL/createTables.sql
psql -U postgres -d Projeto_Integrador_G08 -f backend/SQL/populateDB.sql
```

Comandos úteis no `psql`:

```sql
\dt
SELECT * FROM utentes LIMIT 5;
SELECT * FROM internados LIMIT 5;
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

## 📋 Roadmap

### Alta prioridade
- Consolidar todos os routers no `main.py`
- Ligar routers aos `repositories`
- Finalizar models Pydantic
- Completar frontend base (`login`, `triagem`, `dashboard`)

### Média prioridade
- Melhorar validação de dados
- Criar endpoints POST/PUT/DELETE em falta
- Normalizar nomes de ficheiros e imports

### Baixa prioridade
- Iniciar app Android
- Desenvolver módulo de IA
- Adicionar testes automatizados

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
