
# 🏥 PRODIGI — Projeto Integrador Grupo 8

Sistema de gestão de urgências hospitalares desenvolvido no âmbito do Projeto Integrador.

---

## 📁 Estrutura do Repositório


```text
Projeto-Integrador-Grupo-8-PRODIGI-/
│
├── backend/
│   ├── SQL/
│   │   ├── createTables.sql      ✅ já existe
│   │   └── populateDB.sql        ✅ já existe
│   ├── routers/                  ✅ endpoints por módulo
│   │   ├── utentes.py            ✅
│   │   ├── episodios.py          ✅
│   │   ├── triagem.py            ✅
│   │   ├── internados.py         ✅
│   │   ├── proficionais.py       ✅
│   │   └── auth.py               ✅
│   ├── models/                   ❌ criar (modelos Pydantic)
│   ├── auth/
│   │   └── security.py           ✅
│   ├── db.py                     ✅ já existe
│   ├── main.py                   ✅ já existe
│   └── requirements.txt          ✅ já existe
│
├── web/
│   ├── Urgencias.html            ✅ já existe
│   ├── login.html                ❌ criar
│   ├── triagem.html              ❌ criar
│   ├── dashboard.html            ❌ criar
│   └── styles.css / scripts/     ❌ criar
│
├── android/                      ❌ vazio, começar
│
├── ia/
│   └── modelo.py                 ❌ criar
│
├── docs/                         ✅ ficheiros de apoio
│
├── .env (local, não subir)       ✅ configurar
├── .gitignore                    ✅ já existe
├── README.md                     este ficheiro
└── update_prof.sh                ✅ já existe
```

---


---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Base de dados** | PostgreSQL + pgAdmin |
| **Backend / API** | FastAPI (Python) |
| **Frontend Web** | HTML + CSS + JavaScript |
| **App Móvel** | Android (Kotlin) |
| **IA** | scikit-learn |
| **Controlo de versões** | Git + GitHub |
| **Editor** | VS Code |
| **Containerização** | Docker + Docker Compose |

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

