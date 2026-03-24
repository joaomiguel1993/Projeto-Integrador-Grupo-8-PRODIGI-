## 📁 Estrutura do Repositório

```
Projeto-Integrador-Grupo-8-PRODIGI-/
│
├── backend/
│   ├── SQL/
│   │   ├── createTables.sql      ✅ já existe
│   │   └── populateDB.sql        ✅ já existe
│   ├── routers/                  ❌ criar (endpoints por módulo)
│   │   ├── utentes.py
│   │   ├── episodios.py
│   │   ├── triagem.py
│   │   ├── internamento.py
│   │   ├── profissionais.py
│   │   └── auth.py
│   ├── models/                   ❌ criar (modelos Pydantic)
│   ├── auth/                     ❌ criar (JWT + roles)
│   ├── db.py                     ✅ já existe
│   ├── main.py                   ✅ já existe
│   └── requirements.txt          ❌ criar
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
├── .env (local, não subir)        ❌ configurar
├── .gitignore                    ✅ já existe
├── README.md                     este ficheiro
└── update_prof.sh                ✅ já existe
```

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Base de dados | PostgreSQL + pgAdmin |
| Backend / API | FastAPI (Python) |
| Frontend Web | HTML + CSS + JavaScript |
| App Móvel | Android (Kotlin) |
| Inteligência Artificial | scikit-learn |
| Controlo de versões | Git + GitHub |
| Editor de código | VS Code |

---

## 🚀 Como executar o projeto localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/joaomiguel1993/Projeto-Integrador-Grupo-8-PRODIGI-.git
cd Projeto-Integrador-Grupo-8-PRODIGI-
```

### 2. Configurar variáveis de ambiente

Renomear o ficheiro `alterar nome para .env.txt` para `.env` e preencher:

```
POSTGRES18_PORT=XXXX          # porta do PostgreSQL no teu PC
POSTGRES18_PASSWORD=XXXXXX  # password do utilizador postgres
```

### 3. Instalar dependências do backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

### 4. Criar a base de dados

Abrir o pgAdmin, criar uma base de dados chamada `urgencias` e executar os ficheiros:

```
backend/SQL/createTables.sql
backend/SQL/populateDB.sql
```

### 5. Iniciar o servidor

```bash
uvicorn backend.main:app --reload
```

API disponível em: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📋 Módulos do Sistema

### 🗄️ Módulo de Dados
Modelo relacional PostgreSQL com tabelas para utentes, episódios, triagem, atos clínicos, prescrições, internamento e profissionais.

### ⚙️ Módulo Backend / API
FastAPI com endpoints REST organizados por routers. Responsável pela lógica de negócio e exposição de serviços.

### 🔐 Módulo de Autenticação e Autorização
Autenticação com JWT. Roles disponíveis: `rececionista`, `enfermeiro`, `medico`, `administrador`.

### 🏥 Módulo de Gestão Clínica
Gestão de episódios de urgência, triagem (prioridade Manchester), atos clínicos e prescrições.

### 🤖 Módulo de Inteligência Artificial
Modelo de previsão de tempo de espera com scikit-learn, integrado como endpoint da API.

### 🌐 Módulo Frontend Web
Interface web com páginas de login, receção, triagem, dashboard e gestão de episódios.

### 📱 Módulo Android
App móvel em Kotlin que consome a API REST para consulta e registo de episódios.

---

## 📅 Datas de Entrega

| Entrega | Data | Peso |
|---|---|---|
| Entrega intermédia | 17 de abril de 2026 | 10% |
| Discussão & defesa | 25 e 26 de maio de 2026 | 70% |
| Apresentação turma | 28 de maio de 2026 | 5% |
| Relatório final | 28 de maio de 2026 | 15% |

---

## 👥 Grupo 8

- João Martins
- João Sacramento
- Luis Franco
- Pedro Antunes
