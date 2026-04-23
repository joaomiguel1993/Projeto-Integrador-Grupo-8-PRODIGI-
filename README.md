# 🏥 SIGUI – Sistema Integrado de Gestão de Urgências e Internamentos

Sistema de gestão de urgências e internamentos hospitalares desenvolvido pelo Grupo 8 no âmbito do Projeto Integrador da pós-graduação PRODIGI. O projeto tem como objetivo suportar operações centrais de um serviço de urgência hospitalar, incluindo gestão de utentes, episódios, triagem clínica, internamentos, atos médicos, prescrições, profissionais e autenticação. 

---

## 📌 Objetivo

No âmbito do Projeto Integrador da pós-graduação PRODIGI, o Grupo 8 está a desenvolver uma API backend para suporte a fluxos de urgência hospitalar, permitindo consultar e gerir informação clínica e administrativa relevante. A aplicação utiliza FastAPI, PostgreSQL e Docker, com autenticação e passwords hashedas. 

---

## 📁 Estrutura do Repositório

```text
Projeto-Integrador-Grupo-8-PRODIGI-/
│
├── backend/                              # Código principal da API
│   ├── __init__.py
│   ├── auth/                             # Segurança, hashing e autenticação
│   │   └── security.py
│   ├── models/                           # Schemas Pydantic e modelos de validação
│   │   ├── __init__.py
│   │   ├── ato.py
│   │   ├── episodio.py
│   │   ├── hospital.py
│   │   ├── internamento.py
│   │   ├── medicamento.py
│   │   ├── prescricao.py
│   │   ├── profissional.py
│   │   ├── triagem.py
│   │   ├── utilizador.py
│   │   └── utente.py
│   ├── repositories/                     # Acesso a dados e queries SQL
│   │   ├── __init__.py
│   │   ├── atos_repository.py
│   │   ├── episodios_repository.py
│   │   ├── hospitais_repository.py
│   │   ├── internamentos_repository.py
│   │   ├── medicamentos_repository.py
│   │   ├── prescricoes_repository.py
│   │   ├── profissionais_repository.py
│   │   ├── triagens_repository.py
│   │   └── utentes_repository.py
│   ├── routers/                          # Endpoints da API por domínio
│   │   ├── __init__.py
│   │   ├── ato.py
│   │   ├── auth.py
│   │   ├── episodios.py
│   │   ├── hospital.py
│   │   ├── internamento.py
│   │   ├── medicamento.py
│   │   ├── prescricao.py
│   │   ├── profissionais.py
│   │   ├── triagem.py
│   │   └── utentes.py
│   ├── SQL/                              # Scripts de criação e população da BD
│   │   ├── createTables.sql
│   │   └── populateDB.sql
│   ├── db.py                             # Ligação à base de dados
│   ├── main.py                           # Ponto de entrada da aplicação
│   ├── requirements.txt                  # Dependências Python
│   └── update_passwords.py               # Script de atualização de passwords
│
├── ia/                                   # Módulo de inteligência artificial
│   ├── modelo.py                         # Lógica de previsão
│   ├── treino.py                         # Treino do modelo
│   ├── gerar_dados.py                    # Geração/preparação de dados
│   ├── dados_sinteticos.sql              # Dados sintéticos para treino/teste
│   └── modelo_urgencias.pkl              # Modelo treinado
│
├── web/                                  # Frontend web do sistema
│   ├── login.html
│   ├── triagem.html
│   ├── dashboard.html
│   ├── styles/
│   │   └── styles.css
│   └── scripts/
│       ├── api.js
│       ├── app.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── login.js
│       └── triagem.js
│
├── android/                              # Aplicação móvel Android
│
├── docs/                                 # Documentação complementar
├── Dockerfile                            # Imagem Docker da aplicação
├── docker-compose.yml                    # Orquestração dos serviços
├── .env.example                          # Exemplo de variáveis de ambiente
├── .gitignore                            # Ficheiros ignorados pelo Git
└── README.md                             # Documentação principal do projeto
```

A organização atual do backend está centrada em `routers`, `repositories`, `models`, `auth` e `db.py`, refletindo uma estrutura modular orientada à separação entre endpoints, acesso a dados, validação e segurança. 

---

## 🗄️ Modelo de Dados

O sistema inclui entidades principais como `Utente`, `Hospital`, `Funcionario`, `Utilizador`, `EpUrgencia`, `Triagem`, `Ato`, `Prescreve`, `Internamento`, `Antecedente`, `Medicamento` e respetivas tabelas de associação. O modelo foi desenhado para suportar o registo e acompanhamento de episódios de urgência, triagem, internamentos, prescrições e autenticação de profissionais. 

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| Base de dados | PostgreSQL + pgAdmin |
| Backend / API | FastAPI + Uvicorn |
| Acesso a dados | psycopg2 + SQL puro |
| Autenticação | JWT + passlib + bcrypt |
| Validação de dados | Pydantic |
| Containerização | Docker + Docker Compose |
| Controlo de versões | Git + GitHub |

Estas tecnologias correspondem à base atual do projeto e à forma como o backend foi estruturado e desenvolvido. 

---

## ✅ Estado Atual do Projeto

### Backend
- API funcional com FastAPI. 
- Routers separados por domínio clínico e administrativo. 
- Repositories responsáveis pelo acesso a dados. 
- Ficheiro `db.py` responsável pela ligação à base de dados e execução de queries. 
- Autenticação implementada com hashing de passwords. 

### Base de Dados
- Scripts SQL disponíveis para criação e população da base de dados. 
- Modelo de dados estruturado para urgência hospitalar, internamento, medicação e prescrição. 

### Módulos futuros
- Frontend web. 
- Módulo de IA para apoio à decisão clínica. 
- Possível extensão para aplicação móvel Android. 

---

## 🔌 Endpoints disponíveis

| Módulo | Exemplos |
|--------|----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Utentes | `GET /api/utentes/` |
| Episódios | `GET /api/episodios/` |
| Triagem | `GET /api/triagem/` |
| Internamentos | `GET /api/internamentos/` |
| Profissionais | `GET /api/profissionais/` |
| Atos | `GET /api/atos/` |
| Prescrições | `GET /api/prescricoes/` |
| Hospitais | `GET /api/hospitais/` |
| Medicamentos | `GET /api/medicamentos/` |

Os routers atualmente existentes no projeto incluem `ato.py`, `auth.py`, `episodios.py`, `hospital.py`, `internamento.py`, `medicamento.py`, `prescricao.py`, `profissionais.py`, `triagem.py` e `utentes.py`. 

---

## 🚀 Como executar o projeto

### Docker

```bash
cp .env.example .env
docker compose up --build
```

Para parar os serviços:

```bash
docker compose down
```

### Execução local

```bash
git clone https://github.com/joaomiguel1993/Projeto-Integrador-Grupo-8-PRODIGI-.git
cd Projeto-Integrador-Grupo-8-PRODIGI-
cp .env.example .env
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

O repositório principal do projeto está no GitHub do utilizador e corresponde ao trabalho do Grupo 8. 

---

## 🌐 URLs úteis

| Serviço | URL |
|---------|-----|
| API | `http://localhost:8000` |
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| pgAdmin | `http://localhost:8080` |

---

## 🐍 Comandos úteis

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
python -m backend.update_passwords
```

---

## 📋 Roadmap

### Próximos passos
- Consolidar todos os endpoints CRUD principais.
- Finalizar validação de dados com Pydantic.
- Melhorar tratamento de erros.
- Criar frontend base.
- Adicionar testes aos endpoints principais.
- Desenvolver o módulo de IA.

---

## 📅 Cronograma

| Fase | Data | Estado |
|------|------|--------|
| Intermédia | 17 Abr 2026 | Em progresso |
| Defesa | 25–26 Mai 2026 | Planeado |
| Apresentação | 28 Mai 2026 | Planeado |
| Relatório | 28 Mai 2026 | Planeado |

Estas datas fazem parte do calendário já definido para o Projeto Integrador do Grupo 8. [cite:16]

---

## 👥 Grupo 8

- João Martins
- João Sacramento
- Luis Franco
- Pedro Antunes