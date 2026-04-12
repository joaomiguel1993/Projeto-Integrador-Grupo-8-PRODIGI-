
# 🏥 PRODIGI — Projeto Integrador Grupo 8

Sistema de gestão de urgências hospitalares desenvolvido no âmbito do Projeto Integrador.

---

## 📁 Estrutura do Repositório


```text
Projeto-Integrador-Grupo-8-PRODIGI/
│
├── backend/
│   ├── SQL/
│   │   ├── createTables.sql              ✅ criação da base de dados
│   │   └── populateDB.sql                ✅ dados iniciais / teste
│   │
│   ├── db.py                             ✅ ligação à base de dados
│   │
│   ├── auth/
│   │   └── security.py                   ✅ autenticação / JWT
│   │
│   ├── models/                           ✅ schemas Pydantic (adicionar todos)
│   │   ├── utente.py
│   │   ├── episodio.py
│   │   ├── triagem.py
│   │   ├── ato.py
│   │   ├── prescricao.py
│   │   ├── internamento.py
│   │   ├── hospital.py
│   │   ├── profissional.py
│   │   └── auth.py
│   │
│   ├── dao/                              ✅ adicionar camada SQL como o SIAGUH
│   │   ├── utente_dao.py
│   │   ├── episodio_dao.py
│   │   ├── triagem_dao.py
│   │   ├── ato_dao.py
│   │   ├── prescricao_dao.py
│   │   ├── internamento_dao.py
│   │   ├── hospital_dao.py
│   │   └── profissional_dao.py
│   │
│   ├── mappers/                          ✅ adicionar mapeamento BD ↔ objetos
│   │   ├── utente_mapper.py
│   │   ├── episodio_mapper.py
│   │   ├── triagem_mapper.py
│   │   ├── ato_mapper.py
│   │   ├── prescricao_mapper.py
│   │   ├── internamento_mapper.py
│   │   ├── hospital_mapper.py
│   │   └── profissional_mapper.py
│   │
│   ├── repositories/                     ✅ acesso à BD / lógica de dados
│   │   ├── utente_repository.py
│   │   ├── episodio_repository.py
│   │   ├── triagem_repository.py
│   │   ├── ato_repository.py
│   │   ├── prescricao_repository.py
│   │   ├── internamento_repository.py
│   │   ├── hospital_repository.py
│   │   ├── profissional_repository.py
│   │   └── auth_repository.py
│   │
│   ├── controllers/                      ✅ endpoints HTTP (substitui routers)
│   │   ├── auth_controller.py
│   │   ├── utente_controller.py
│   │   ├── episodio_controller.py
│   │   ├── triagem_controller.py
│   │   ├── ato_controller.py
│   │   ├── prescricao_controller.py
│   │   ├── internamento_controller.py
│   │   ├── hospital_controller.py
│   │   └── profissional_controller.py
│   │
│   ├── services/                         ⚙️ regras de negócio (opcional)
│   │   ├── triagem_service.py
│   │   ├── auth_service.py
│   │   ├── episodio_service.py
│   │   └── previsao_service.py
│   │
│   ├── hash_password.py                  ✅ utilitário
│   ├── main.py                           ✅ ponto de entrada FastAPI
│   ├── requirements.txt                  ✅ dependências Python
│   └── update_passwords.py               ⚙️ utilitário (ex-SIAGUH)
│
├── web/                                  ✅ frontend web
│   ├── index.html                        🔁 unificar com login.html
│   ├── Urgencias.html                    ✅ existente
│   ├── login.html                        ✅ criar / unificar com index
│   ├── triagem.html                      ✅ criar
│   ├── dashboard.html                    ✅ criar
│   ├── styles/
│   │   └── styles.css                    ✅ criar
│   ├── scripts/
│   │   ├── api.js                        ✅ baseado em SIAGUH
│   │   ├── auth.js                       ✅ login / sessão
│   │   ├── app.js                        ✅ navegação / lógica global
│   │   ├── login.js                      ✅ criar
│   │   ├── triagem.js                    ✅ criar
│   │   ├── dashboard.js                  ✅ criar
│   │   └── sections/                     ✅ modularização como SIAGUH
│   │       ├── episodios.js
│   │       ├── utentes.js
│   │       ├── triagens.js
│   │       ├── internamentos.js
│   │       ├── hospitais.js
│   │       ├── profissionais.js
│   │       ├── previsao.js
│   │       ├── atos.js
│   │       ├── prescricoes.js
│   │       ├── painel-recepcao.js
│   │       ├── painel-triagem.js
│   │       └── painel-monitorizacao.js
│   └── templates/                        ✅ se usares Handlebars (opcional)
│       ├── episodios.hbs
│       ├── utentes.hbs
│       ├── triagens.hbs
│       ├── internamentos.hbs
│       ├── hospitais.hbs
│       ├── profissionais.hbs
│       ├── previsao.hbs
│       ├── modais.hbs
│       ├── atos.hbs
│       ├── prescricoes.hbs
│       ├── painel-recepcao.hbs
│       ├── painel-triagem.hbs
│       └── painel-monitorizacao.hbs
│
├── android/                              📱 app móvel (a iniciar)
│   ├── app/
│   ├── src/
│   └── README.md
│
├── ia/                                   🧠 módulo de IA
│   ├── modelo.py
│   ├── treino.py
│   ├── gerar_dados.py                    ➕ do SIAGUH
│   ├── dados_sinteticos.sql              ➕ do SIAGUH
│   ├── modelo_urgencias.pkl              ➕ arquivo .pkl do modelo treinado
│   └── dataset/
│
├── docs/                                 📘 documentação e apoio
│   ├── diagramas/
│   ├── relatorio/
│   └── apresentacao/
│
├── Dockerfile                            ⚙️ atualizar / incluir backend + IA
├── docker-compose.yml                    ⚙️ incluir serviços backend, frontend, IA
├── .env.example                          ✅ variáveis exemplo
├── .dockerignore                         ✅
├── .gitignore                            ✅
├── README.md                             ✅ documentação principal
└── update_prof.sh                        ⚠️ verificar se ainda usado

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

