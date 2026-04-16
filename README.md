# 🏥 PRODIGI — Projeto Integrador Grupo 8

Sistema de gestão de urgências e internamentos hospitalares desenvolvido no âmbito do Projeto Integrador.

O projeto tem como objetivo suportar operações centrais de um serviço de urgência hospitalar, incluindo gestão de utentes, episódios, triagem clínica, internamentos, atos médicos, prescrições, profissionais e autenticação, com suporte a inteligência artificial para apoio à decisão clínica.

---

## 📌 Objetivo

O PRODIGI pretende disponibilizar uma API backend para suporte a fluxos de urgência hospitalar, permitindo consultar e gerir informação clínica e administrativa relevante. A aplicação está a ser desenvolvida com FastAPI, PostgreSQL e Docker, com autenticação baseada em JWT e passwords hashedas, que é uma abordagem comum e recomendada para APIs modernas em FastAPI.

---

## 📁 Estrutura do Repositório

**Legenda:** ✅ existente no repositório · 🟡 precisa de atualização · ❌ ainda por implementar

```text
Projeto-Integrador-Grupo-8-PRODIGI-/
│
├── backend/                                      ✅
│   ├── __init__.py                               ✅
│   ├── SQL/                                      ✅
│   │   ├── createTables.sql                      🟡 atualizar com modelo final
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
├── ia/                                           ❌
│   ├── modelo.py                                 ❌
│   ├── treino.py                                 ❌
│   ├── gerar_dados.py                            ❌
│   ├── dados_sinteticos.sql                      ❌
│   └── modelo_urgencias.pkl                      ❌
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
├── docs/                                         ✅
├── Dockerfile                                    ✅
├── docker-compose.yml                            ✅
├── .env.example                                  ✅
├── .gitignore                                    ✅
└── README.md                                     ✅
```

---

## 🗄️ Modelo de Dados

### Entidades e Atributos

| Entidade | Atributos Principais | Relações |
|---|---|---|
| **Utente** | NumUtent (PK), NIF (UNIQUE), Nome, DataNasc, Sexo, Localidade, Contacto, Morada | 1:N EpUrgencia |
| **Hospital** | IdHosp (PK), Nome, Localizacao | 1:N EpUrgencia |
| **EpUrgencia** | CodEpUrgenc (PK), NumUtent (FK), IdHosp (FK), DataHoraEntr, DtaHoraSaida, MotivoUrgencia, Estado | 1:1 Triagem, 1:N Ato, 0:N Internamento |
| **Triagem** | CodEpUrgenc (PK/FK), DataHoraInicio, DataHoraFim, CorTriagem, Sintomas, FreqCard, SpO2, Sistolica, Diastolica, Temperatura | — |
| **Antecedente** | CodAntecedente (PK), Nome, Tipo | N:N Utente |
| **UtenteAntecedente** | NumUtent (PK/FK), CodAntecedente (PK/FK), DataRegisto | — |
| **Funcionario** | IdFunc (PK), NumFunc (UNIQUE), Nome, TipoFunc, Sexo, Contacto | 1:N Ato, 1:N Internamento |
| **Medico** | IdFunc (PK/FK), Especialidade, Estagiario | — |
| **Enfermeiro** | IdFunc (PK/FK) | — |
| **Utilizador** | IdUtilizador (PK), IdFunc (FK/UNIQUE), UserName (UNIQUE), Password, Funcao | — |
| **Ato** | IdAto (PK), CodEpUrgenc (FK), IdFunc (FK), Tipo, DataHoraInicio, DataHoraFim | 1:N Prescreve |
| **Prescreve** | IdPrescricao (PK), IdAto (FK), Descricao, DataHoraPresc | — |
| **Internamento** | CodInternamento (PK), CodEpUrgenc (FK), IdFunc (FK), DataHoraInt, DataHoraConsulta, DataHoraAlta, MotivoInt, NumeroCama, Servico, TipoAlta | — |

### Relações
Utente 1:N EpUrgencia
Hospital 1:N EpUrgencia
EpUrgencia 1:1 Triagem
Utente N:N Antecedente (via UtenteAntecedente)
Funcionario 1:1 Medico (especialização disjunta)
Funcionario 1:1 Enfermeiro (especialização disjunta)
Funcionario 1:1 Utilizador
EpUrgencia 1:N Ato
Funcionario 1:N Ato
Ato 1:N Prescreve
EpUrgencia 0:N Internamento
Funcionario 1:N Internamento
---

### Cores da Triagem (Protocolo Manchester — Portugal)

| Cor | Prioridade |
|---|---|
| 🔴 Vermelho | Imediata |
| 🟠 Laranja | Muito urgente |
| 🟡 Amarelo | Urgente |
| 🟢 Verde | Pouco urgente |
| 🔵 Azul | Não urgente |

---

## 📊 Diagrama de Fluxo de Dados

**Foco:** o que acontece aos dados — registo, validação e transformação.

### f1 — Autenticação de Utilizador
Utilizador

| username + password

▼
[Validar credenciais] ←——→ [BD Utilizadores]
| IdUtilizador, UserName, Password, Funcao
▼
[Carregar perfil funcionário] ——→ [BD Funcionários]
| IdFunc, NumFunc, Nome, TipoFunc, Sexo
▼
[Determinar tipo de acesso]
| médico / enfermeiro / admin
▼
[Conceder acesso ao sistema]
▼
Utilizador (autenticado)


### f2 — Registo de Utente e Antecedentes
Utente

| dados pessoais

▼
[Registar utente] ——→ [BD Utentes]
| NumUtent, Nome, NIF, DataNasc, Sexo, Localidade
▼
[Registar antecedente clínico] ——→ [BD Antecedentes]
| CodAntecedente, Nome do antecedente
▼
[Associar antecedente ao utente] ——→ [BD UtenteAntecedente]
| DataRegisto
▼
Utente (com historial registado)


### f3 — Gestão de Internamento
Utente

| pedido de internamento

▼
[Criar internamento] ——→ [BD Internamentos] ←—— Funcionário
| CodInternamento, DataHoraInt, DataHoraConsulta, MotivoInt
▼
[Atribuir cama e serviço] ——→ [BD Internamentos]
| NumeroCama, Servico
▼
[Registar alta] ——→ [BD Internamentos]
| TipoAlta, DataHoraAlta
▼
Utente (com alta)


### f4 — Episódio de Urgência e Triagem Clínica
Utente

| entrada na urgência

▼
[Registar ep. urgência] ——→ [BD Ep. Urgência]
| CodEpUrgenc, DataHoraEntr, DtaHoraSaida, Estado
| └——→ Hospital (IdHosp, Nome, Localizacao)
▼
[Realizar triagem clínica] ——→ [BD Triagens] ←—— Enfermeiro
| DataHoraInicio, DataHoraFim, CorTriagem, Sintomas
| FreqCard, SpO2, Sistolica, Diastolica, Temperatura
▼
[Actualizar estado ep.] ——→ [BD Ep. Urgência]
| Estado, DtaHoraSaida
▼
[Gerar internamento] - - → [BD Internamentos] (se necessário)
▼
Utente (tratado)


### f5 — Atos Médicos e Prescrições
Médico / Enfermeiro

| tipo de ato, datas

▼
[Registar ato médico] ——→ [BD Atos]
| Tipo, DataHoraInicio, DataHoraFim
| └——→ [BD Ep. Urgência] (relação associa)
▼
[Verificar competência] ——→ [BD Funcionários]
| só médico pode emitir prescrição
▼
[Emitir prescrição] ——→ [BD Prescrições] ←—— Médico
| Descricao, DataHoraPresc
▼
[Associar prescrição ao ato] ——→ [BD Atos] (relação Origina)
▼
Médico / Enfermeiro (concluído)


### f6 — Administrador do Sistema
Administrador

| credenciais admin

▼
[Autenticar como admin] ——→ [BD Utilizadores]
▼
[Criar conta funcionário] ——→ [BD Funcionários]
| IdFunc, NumFunc, Nome, TipoFunc, Sexo
▼
[Atribuir credenciais de acesso] ——→ [BD Utilizadores]
| IdUtilizador, UserName, Password, Funcao
▼
[Definir subtipo de funcionário] ——→ [BD Funcionários]
| médico: Especialidade, Estagiario
| enfermeiro: sem atributos adicionais
▼
[Consultar registos e relatórios] ——→ [BD Utentes]
| └——→ [BD Internamentos]
| └——→ [BD Ep. Urgência]
▼
Administrador (gestão concluída)


---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Estado |
|--------|------------|--------|
| Base de dados | PostgreSQL + pgAdmin | ✅ Implementado |
| Backend / API | FastAPI + Uvicorn | ✅ Implementado |
| Acesso a dados | psycopg2 + SQL puro | ✅ Implementado |
| Autenticação | JWT + passlib + bcrypt | ✅ Implementado |
| Validação de dados | Pydantic v2 | 🟡 Parcial |
| Arquitetura modular | Routers + DAO + Repositories | ✅ Implementado |
| Frontend Web | HTML5 + CSS3 + JavaScript | ❌ Não implementado |
| Containerização | Docker + Docker Compose | ✅ Implementado |
| Controlo de versões | Git + GitHub | ✅ Implementado |
| App Móvel | Android | ❌ Planeado |
| IA / ML | scikit-learn + pandas + numpy | ❌ Planeado |
| Testes | pytest + FastAPI TestClient | ❌ Planeado |

### Bibliotecas principais

- `fastapi` `uvicorn` `psycopg2` `pydantic` `python-jose`
- `passlib` `bcrypt` `python-multipart` `python-dotenv`

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
- Modelo de dados com 13 tabelas normalizadas, PK/FK e ENUMs controlados.
- `createTables.sql` a atualizar com modelo de dados final.
- Suporte a execução com Docker Compose.

### IA
- Estrutura da pasta `ia/` prevista mas ainda por implementar.
- Módulo de previsão de cor de triagem e tempo de espera planeado.

### Frontend
- Pasta `web/` prevista mas ainda por implementar.

### Mobile
- Pasta `android/` prevista mas ainda por iniciar.

---

## 🤖 Inteligência Artificial

### Problema a Tratar

O módulo de IA tem dois objetivos:

1. **Sugestão automática de cor de triagem** — com base nos dados clínicos do utente, a IA sugere a cor da pulseira seguindo o protocolo de Triagem de Manchester: vermelho / laranja / amarelo / verde / azul

2. **Previsão de tempo de espera** — com base no histórico de episódios e dados clínicos atuais, estima o tempo de espera até ao atendimento.

### Variáveis de Entrada

- Idade do utente
- Sexo
- Motivo da urgência
- Sintomas registados na triagem
- Sinais vitais: FreqCard, SpO2, Sistolica, Diastolica, Temperatura
- Antecedentes clínicos
- Hora de entrada no episódio

### Variáveis de Saída

- `cor_triagem` — vermelho / laranja / amarelo / verde / azul
- `tempo_espera` — estimativa em minutos

### Endpoints IA

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/ia/triagem/cor` | Sugestão automática de cor |
| `POST` | `/api/ia/triagem/tempo_espera` | Previsão de tempo de espera |

> O modelo é treinado com dados sintéticos gerados a partir de padrões clínicos reais e guardado em `modelo_urgencias.pkl`.

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

### Opção 2 — Execução local

```bash
git clone https://github.com/joaomiguel1993/Projeto-Integrador-Grupo-8-PRODIGI-.git
cd Projeto-Integrador-Grupo-8-PRODIGI-
cp .env.example .env
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
.venv\Scripts\activate           # Windows
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

---

## 🌐 URLs úteis

| Serviço | URL |
|---------|-----|
| API | `http://localhost:8000` |
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| pgAdmin | `http://localhost:8080` |

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
| IA — Cor | ❌ | `POST /api/ia/triagem/cor` |
| IA — Espera | ❌ | `POST /api/ia/triagem/tempo_espera` |

---

## 🔐 Autenticação

O projeto utiliza autenticação baseada em JWT com passwords hashedas antes de serem armazenadas. O fluxo de autenticação com bearer token é uma das abordagens centrais documentadas pelo FastAPI para APIs seguras.

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
SELECT * FROM utente LIMIT 5;
SELECT * FROM epurgencia LIMIT 5;
SELECT * FROM triagem LIMIT 5;
SELECT * FROM internamento LIMIT 5;
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
- Atualizar `createTables.sql` com modelo de dados final.
- Consolidar ligação dos routers aos repositories.
- Finalizar validação com Pydantic.
- Criar frontend base.

### Média prioridade
- Adicionar endpoints POST, PUT e DELETE em falta.
- Melhorar tratamento de erros.
- Criar testes para endpoints principais.

### Baixa prioridade
- Implementar módulo `ia/`.
- Iniciar módulo Android.
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