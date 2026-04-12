
# 🏥 PRODIGI — Projeto Integrador Grupo 8

Sistema de gestão de urgências hospitalares desenvolvido no âmbito do Projeto Integrador.

---

## 📁 Estrutura do Repositório


```text
Projeto-Integrador-Grupo-8-PRODIGI/
│
├── backend/
│   ├── SQL/                              ✅ já tens
│   │   ├── createTables.sql
│   │   └── populateDB.sql
│   │
│   ├── routers/                          ✅ MANTÉM OS TEUS (funcionais!)
│   │   ├── utentes.py                    ✅ já tens
│   │   ├── episodios.py                  ✅ já tens  
│   │   ├── triagem.py                    ✅ já tens
│   │   ├── internados.py                 ✅ já tens
│   │   ├── profissionais.py              ✅ já tens
│   │   ├── auth.py                       ✅ já tens
│   │   ├── ato.py                        ➕ ADICIONAR (do SIAGUH)
│   │   ├── prescricao.py                 ➕ ADICIONAR (do SIAGUH)
│   │   ├── hospital.py                   ➕ ADICIONAR (do SIAGUH)
│   │   └── internamento.py               ➕ ADICIONAR (do SIAGUH)
│   │
│   ├── auth/                             ✅ já tens
│   │   └── security.py
│   │
│   ├── models/                           ❌ CRIAR (schemas Pydantic)
│   │   ├── utente.py
│   │   ├── episodio.py
│   │   ├── triagem.py
│   │   ├── ato.py                        ➕
│   │   ├── prescricao.py                 ➕
│   │   ├── internamento.py               ➕
│   │   ├── hospital.py                   ➕
│   │   ├── profissional.py
│   │   └── auth.py
│   │
│   ├── dao/                              ❌ CRIAR (queries SQL puras)
│   │   ├── utente_dao.py
│   │   ├── episodio_dao.py
│   │   ├── triagem_dao.py
│   │   ├── ato_dao.py                    ➕
│   │   ├── prescricao_dao.py             ➕
│   │   ├── internamento_dao.py           ➕
│   │   ├── hospital_dao.py               ➕
│   │   └── profissional_dao.py
│   │
│   ├── mappers/                          ❌ CRIAR (BD ↔ objetos)
│   │   ├── utente_mapper.py
│   │   ├── episodio_mapper.py
│   │   ├── triagem_mapper.py
│   │   ├── ato_mapper.py                 ➕
│   │   ├── prescricao_mapper.py          ➕
│   │   ├── internamento_mapper.py        ➕
│   │   ├── hospital_mapper.py            ➕
│   │   └── profissional_mapper.py
│   │
│   ├── repositories/                     ❌ CRIAR (DAO + Mapper)
│   │   ├── utentes_repository.py
│   │   ├── episodios_repository.py
│   │   ├── triagem_repository.py
│   │   ├── ato_repository.py             ➕
│   │   ├── prescricao_repository.py      ➕
│   │   ├── internamento_repository.py    ➕
│   │   ├── hospital_repository.py        ➕
│   │   ├── profissionais_repository.py
│   │   └── auth_repository.py
│   │
│   ├── services/                         ❌ CRIAR (opcional)
│   │   ├── triagem_service.py
│   │   ├── auth_service.py
│   │   ├── episodios_service.py
│   │   └── previsao_service.py           ➕
│   │
│   ├── db.py                             ✅ já tens
│   ├── main.py                           ✅ já tens
│   ├── hash_password.py                  ✅ já tens
│   ├── requirements.txt                  ✅ já tens
│   └── update_passwords.py               ➕ ADICIONAR (utilitário)
│
├── web/                                  ❌ COMPLETAR frontend
│   ├── Urgencias.html                    ✅ já tens
│   ├── login.html                        ❌ criar
│   ├── triagem.html                      ❌ criar
│   ├── dashboard.html                    ❌ criar
│   ├── styles/
│   │   └── styles.css                    ❌ criar
│   └── scripts/
│       ├── login.js                      ❌ criar
│       ├── triagem.js                    ❌ criar
│       ├── dashboard.js                  ❌ criar
│       ├── api.js                        ➕
│       ├── auth.js                       ➕
│       └── app.js                        ➕
│
├── android/                              ❌ iniciar
├── ia/                                   ❌ criar
│   ├── modelo.py
│   ├── treino.py
│   ├── gerar_dados.py                    ➕
│   ├── dados_sinteticos.sql              ➕
│   └── modelo_urgencias.pkl
│
├── docs/                                 ✅ já tens
├── Dockerfile                            ✅ já tens  
├── docker-compose.yml                    ✅ já tens
├── .env.example                          ✅ já tens
├── .gitignore                            ✅ já tens
└── README.md                             ✅ já tens
```

---


---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Status |
|--------|------------|--------|
| **Base de dados** | PostgreSQL + pgAdmin | ✅ Implementado |
| **Backend / API** | FastAPI (Python 3.12+) | ✅ Implementado (routers ativos) |
| **Frontend Web** | HTML5 + CSS3 + JavaScript (Vanilla) | ⚠️ Parcial (Urgencias.html) |
| **App Móvel** | Android (Kotlin/Java) | ❌ Planeado |
| **IA/ML** | scikit-learn + pandas + numpy | ❌ Planeado |
| **Controlo de versões** | Git + GitHub | ✅ Implementado |
| **Editor** | VS Code + extensões Python/FastAPI | ✅ Configurado |
| **Containerização** | Docker + Docker Compose | ✅ Implementado |
| **Autenticação** | JWT (python-jose) + bcrypt (passlib) | ✅ Implementado |
| **Validação de dados** | Pydantic v2 | ❌ Planeado (models/) |
| **ORM/Data Layer** | SQLAlchemy Core (opcional) + Repository pattern | ❌ Planeado (repositories/) |
| **Deploy** | Docker + Railway/Heroku (futuro) | ❌ Planeado |
| **Testes** | pytest + FastAPI TestClient | ❌ Planeado |

**Bibliotecas principais (requirements.txt):**

---

## 🚀 Iniciar o Projeto

### 🐳 **Docker (Recomendado)**

```bash
# 1. Configurar .env
cp .env.example .env
# Editar .env com passwords

# 2. Executar
docker compose up --build

# Parar
docker compose down

# Reset volumes (apaga BD)
docker compose down -v && docker compose up --build
```

**URLs:**
- **API**: http://localhost:8000
- **Swagger**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:8080

### 💻 **Manual (Dev Local)**

```bash
# 1. Clonar + .env
git clone https://github.com/joaomiguel1993/Projeto-Integrador-Grupo-8-PRODIGI-.git
cd Projeto-Integrador-Grupo-8-PRODIGI-
cp .env.example .env  # Configurar PostgreSQL local

# 2. Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload  # http://localhost:8000/docs

# 3. BD (pgAdmin)
# createTables.sql → populateDB.sql
```

---

## 🔌 Endpoints Disponíveis

| Módulo | Status | Endpoints Principais |
|--------|--------|---------------------|
| **Auth** | ✅ | `POST /api/auth/register`, `POST /api/auth/login` |
| **Utentes** | ✅ | `GET/POST/PUT/DEL /api/utentes/` |
| **Episódios** | ✅ | `GET/POST/PUT/DEL /api/episodios/` |
| **Triagem** | ✅ | `POST /api/triagem/manchester` |
| **Internados** | ✅ | `GET /api/internados/disponiveis` |
| **Profissionais** | ✅ | `GET /api/proficionais/{role}` |

**Roles**: `rececionista` | `enfermeiro` | `medico` | `administrador`

---

## 📋 Roadmap (Pendentes ❌)

| Componente | Responsável | Prazo | Prioridade |
|------------|-------------|-------|------------|
| `backend/models/` | Todos | **12/04** | 🔴 Alta |
| `web/login.html` | Frontend | 14/04 | 🔴 Alta |
| `web/triagem.html` | Frontend | 15/04 | 🟡 Média |
| `web/dashboard.html` | Frontend | 16/04 | 🟡 Média |
| `android/` | Mobile | 20/04 | 🟢 Baixa |
| `ia/modelo.py` | IA | 22/04 | 🟢 Baixa |

---

## 🔄 **Git - Comandos Essenciais**

### 🌟 **Fluxo Diário (5s)**

```bash
git add .
git commit -m "feat: triagem UI"
git push
```

### ⚡ **Cheatsheet Completo**

| Situação | Comando |
|----------|---------|
| **Ver status** | `git status` |
| **Ver mudanças** | `git diff` |
| **Pull atualizações** | `git pull` |
| **Apagar mudanças** | `git reset --hard` |
| **Histórico** | `git log --oneline` |
| **Desfazer commit** | `git reset HEAD~1` |
| **Primeiro push** | `git push -u origin main` |

### 🆘 **Emergências**

```bash
# Apagar TUDO local (cuidado!)
git fetch origin
git reset --hard origin/main

# Remover venv do git (sem apagar pasta)
git rm -r --cached .venv/
git commit -m "remove venv"
```

---

## 🐍 **Python / Backend - Quick Commands**

```bash
# Dependências
pip install -r requirements.txt
pip freeze > requirements.txt  # Atualizar

# Servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Debug
python -c "from db import engine; print(engine)"
```

**Bibliotecas principais:**

fastapi # API Framework
uvicorn # Server
psycopg2 # PostgreSQL
pydantic # Models/Validação
python-jose # JWT
passlib # Passwords


---

## 🗄️ **PostgreSQL - Quick SQL**

```bash
# Conectar
psql -U postgres -d Projeto_Integrador_G08

# Executar ficheiros
psql -U postgres -d Projeto_Integrador_G08 -f backend/SQL/createTables.sql

# Ver tabelas
\dt
SELECT * FROM utentes LIMIT 5;
```

---

## 📅 **Cronograma Oficial**

| **Fase** | **Data** | **Peso** | **Status** |
|----------|----------|----------|------------|
| Intermédia | 17 Abr 2026 | 10% | 📈 Em progresso |
| Defesa | 25-26 Mai 2026 | 70% | ⏳ Planeado |
| Apresentação | 28 Mai 2026 | 5% | ⏳ Planeado |
| Relatório | 28 Mai 2026 | 15% | ⏳ Planeado |

---

## 👥 **Grupo 8**
**João Martins** • **João Sacramento** • **Luis Franco** • **Pedro Antunes**

