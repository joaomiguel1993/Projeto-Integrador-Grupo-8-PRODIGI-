# 🏥 SIAGUH – Sistema Integrado de Apoio à Gestão de Urgências Hospitalares

Sistema Integrado de Apoio à Gestão de Urgências Hospitalares desenvolvido pelo Grupo 8 no âmbito do Projeto Integrador da pós-graduação PRODIGI. O projeto tem como objetivo suportar operações centrais de um serviço de urgência hospitalar, incluindo gestão de utentes, episódios, triagem clínica, internamentos, atos médicos, prescrições, profissionais e autenticação. 

---

## 📌 Objetivo

No âmbito do Projeto Integrador da pós-graduação PRODIGI, o Grupo 8 está a desenvolver uma API backend para suporte a fluxos de urgência hospitalar, permitindo consultar e gerir informação clínica e administrativa relevante. A aplicação utiliza FastAPI, PostgreSQL e Docker, com autenticação e passwords hashedas. 

---

## 📁 Estrutura do Repositório

```text
Projeto-Integrador-Grupo-8-PRODIGI/
│
├── backend/                                   # API FastAPI
│   ├── __init__.py
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   └── permissions.py
│   │
│   ├── dao/
│   │   ├── __init__.py
│   │   ├── atos_dao.py
│   │   ├── auditoria_dao.py
│   │   ├── episodios_dao.py
│   │   ├── hospitais_dao.py
│   │   ├── internamentos_dao.py
│   │   ├── medicamentos_dao.py
│   │   ├── medicacao_ativa_dao.py
│   │   ├── prescricoes_dao.py
│   │   ├── profissionais_dao.py
│   │   ├── relatorios_dao.py
│   │   ├── triagens_dao.py
│   │   ├── utilizadores_dao.py
│   │   └── utentes_dao.py
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── atos_repository.py
│   │   ├── auditoria_repository.py
│   │   ├── episodios_repository.py
│   │   ├── hospitais_repository.py
│   │   ├── internamentos_repository.py
│   │   ├── medicamentos_repository.py
│   │   ├── medicacao_ativa_repository.py
│   │   ├── prescricoes_repository.py
│   │   ├── profissionais_repository.py
│   │   ├── relatorios_repository.py
│   │   ├── triagens_repository.py
│   │   ├── utilizadores_repository.py
│   │   └── utentes_repository.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── ato.py
│   │   ├── auditoria.py
│   │   ├── auth.py
│   │   ├── episodios.py
│   │   ├── hospital.py
│   │   ├── internamento.py
│   │   ├── medicamento.py
│   │   ├── medicacao_ativa.py
│   │   ├── prescricao.py
│   │   ├── profissionais.py
│   │   ├── relatorios.py
│   │   ├── triagem.py
│   │   ├── utilizadores.py
│   │   └── utentes.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── ato.py
│   │   ├── auditoria.py
│   │   ├── auth.py
│   │   ├── episodio.py
│   │   ├── hospital.py
│   │   ├── internamento.py
│   │   ├── medicamento.py
│   │   ├── medicacao_ativa.py
│   │   ├── prescricao.py
│   │   ├── profissional.py
│   │   ├── relatorio.py
│   │   ├── triagem.py
│   │   ├── utilizador.py
│   │   └── utente.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── atos_service.py
│   │   ├── auditoria_service.py
│   │   ├── episodios_service.py
│   │   ├── hospitais_service.py
│   │   ├── internamentos_service.py
│   │   ├── medicamentos_service.py
│   │   ├── medicacao_ativa_service.py
│   │   ├── prescricoes_service.py
│   │   ├── profissionais_service.py
│   │   ├── relatorios_service.py
│   │   ├── triagens_service.py
│   │   ├── utilizadores_service.py
│   │   └── utentes_service.py
│   │
│   ├── SQL/
│   │   ├── createTables.sql
│   │   └── populateDB.sql
│   │
│   ├── config.py
│   ├── db.py
│   ├── main.py
│   ├── requirements.txt
│   └── update_passwords.py
│
├── ia/                                         # Modelos de apoio clínico
│   ├── triagem_modelo.py
│   ├── alergias_modelo.py
│   ├── treino_triagem.py
│   ├── treino_alergias.py
│   └── modelos/
│       ├── modelo_triagem.pkl
│       └── modelo_alergias.pkl
│
├── web/                                        # Frontend React + Vite
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.svg
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx
│   │   │   ├── router.jsx
│   │   │   └── providers.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── DateInput.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── FormInput.jsx
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── SearchInput.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Tabs.jsx
│   │   │   │   └── TextArea.jsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── HeaderAuth.jsx
│   │   │   │   ├── HeaderPublic.jsx
│   │   │   │   ├── HospitalContextBanner.jsx
│   │   │   │   ├── PublicLayout.jsx
│   │   │   │   ├── SidebarAdmin.jsx
│   │   │   │   ├── SidebarEnfermeiro.jsx
│   │   │   │   ├── SidebarMedico.jsx
│   │   │   │   ├── SidebarRececionista.jsx
│   │   │   │   └── Topbar.jsx
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── PermissionGate.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── RoleRoute.jsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── AllergyAlert.jsx
│   │   │       ├── AuditTimeline.jsx
│   │   │       ├── EpisodeQueueCard.jsx
│   │   │       ├── EpisodeStatusBadge.jsx
│   │   │       ├── HospitalKPIs.jsx
│   │   │       ├── MedicationList.jsx
│   │   │       └── PriorityBadge.jsx
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── HospitalContext.jsx
│   │   │   └── PermissionContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useHospital.js
│   │   │   ├── usePagination.js
│   │   │   └── usePermissions.js
│   │   │
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── HospitalDetalhe.jsx
│   │   │   │   └── Login.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── Perfil.jsx
│   │   │   │   ├── SelecionarHospital.jsx
│   │   │   │   └── SemPermissao.jsx
│   │   │   │
│   │   │   ├── dashboards/
│   │   │   │   ├── DashboardAdmin.jsx
│   │   │   │   ├── DashboardEnfermeiro.jsx
│   │   │   │   ├── DashboardMedico.jsx
│   │   │   │   └── DashboardRececionista.jsx
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── AdminAssociacoesHospitais.jsx
│   │   │   │   ├── AdminAuditoria.jsx
│   │   │   │   ├── AdminEpisodiosClinicos.jsx
│   │   │   │   ├── AdminFuncionarios.jsx
│   │   │   │   ├── AdminHospitais.jsx
│   │   │   │   ├── AdminRelatorioDetalhe.jsx
│   │   │   │   ├── AdminRelatorios.jsx
│   │   │   │   ├── AdminUtilizadorDetalhe.jsx
│   │   │   │   ├── AdminUtilizadorNovo.jsx
│   │   │   │   └── AdminUtilizadores.jsx
│   │   │   │
│   │   │   ├── rececao/
│   │   │   │   ├── RececaoEntradas.jsx
│   │   │   │   ├── RececaoNovaEntrada.jsx
│   │   │   │   ├── RececaoUtenteDetalhe.jsx
│   │   │   │   ├── RececaoUtenteNovo.jsx
│   │   │   │   └── RececaoUtentes.jsx
│   │   │   │
│   │   │   ├── enfermagem/
│   │   │   │   ├── FichaUtenteConsulta.jsx
│   │   │   │   ├── TriagemDetalhe.jsx
│   │   │   │   ├── TriagemFila.jsx
│   │   │   │   └── TriagemNova.jsx
│   │   │   │
│   │   │   ├── medico/
│   │   │   │   ├── MedicoAlergiasInteracoes.jsx
│   │   │   │   ├── MedicoAltaInternamento.jsx
│   │   │   │   ├── MedicoEpisodioDetalhe.jsx
│   │   │   │   ├── MedicoFilaTriados.jsx
│   │   │   │   ├── MedicoHistoricoUtente.jsx
│   │   │   │   ├── MedicoMedicacaoAtiva.jsx
│   │   │   │   ├── MedicoNovaMedicacao.jsx
│   │   │   │   └── MedicoPrescricaoNova.jsx
│   │   │   │
│   │   │   └── common/
│   │   │       ├── EpisodioAlertas.jsx
│   │   │       ├── EpisodioAtos.jsx
│   │   │       ├── EpisodioPrescricoes.jsx
│   │   │       ├── EpisodioResumo.jsx
│   │   │       ├── InternamentoDetalhe.jsx
│   │   │       └── UtenteFichaCompleta.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── alertas.js
│   │   │   ├── api.js
│   │   │   ├── associacoesHospitais.js
│   │   │   ├── auditoria.js
│   │   │   ├── auth.js
│   │   │   ├── episodios.js
│   │   │   ├── hospitais.js
│   │   │   ├── ia.js
│   │   │   ├── internamentos.js
│   │   │   ├── medicacaoAtiva.js
│   │   │   ├── medicamentos.js
│   │   │   ├── prescricoes.js
│   │   │   ├── profissionais.js
│   │   │   ├── relatorios.js
│   │   │   ├── triagem.js
│   │   │   ├── utilizadores.js
│   │   │   └── utentes.js
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── episodeStatus.js
│   │   │   ├── formatters.js
│   │   │   ├── permissions.js
│   │   │   ├── roleHome.js
│   │   │   └── triagePriority.js
│   │   │
│   │   ├── styles/
│   │   │   └── index.css
│   │   │
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── android/                                    # Futuro cliente mobile
│
├── docs/
│   ├── api.md
│   ├── arquitetura.md
│   ├── fluxos.md
│   └── requisitos.md
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
└── README.md

```

A organização atual do backend está centrada em `routers`, `repositories`, `schemas`, `services`, `dao`, `auth` e `db.py`, refletindo uma estrutura modular orientada à separação entre endpoints, lógica de negócio, acesso a dados, validação e segurança .

---

## 🗄️ Modelo de Dados

O sistema inclui entidades principais como `Utente`, `Hospital`, `Funcionario`, `Utilizador`, `EpUrgencia`, `Triagem`, `Ato`, `Prescreve`, `Internamento`, `Antecedente`, `Medicamento`, `MedicacaoAtiva`, `Alerta` e respetivas tabelas de associação, como `Trabalha`, `Realiza` e `UtenteAntecedente` .  
O modelo foi desenhado para suportar o registo e acompanhamento de episódios de urgência, triagem, internamentos, prescrições, autenticação de profissionais e gestão de medicação .

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| Base de dados | PostgreSQL + pgAdmin |
| Backend / API | FastAPI + Uvicorn  |
| Acesso a dados | psycopg2 + SQL puro  |
| Validação de dados | Pydantic  |
| Autenticação | Hash de passwords  |
| Containerização | Docker + Docker Compose |
| Controlo de versões | Git + GitHub |
| Frontend Web | React + Vite + Tailwind  |

Estas tecnologias correspondem à base atual do projeto e à forma como o sistema foi organizado entre backend, base de dados e frontend web .

---

## ✅ Estado Atual do Projeto

### Backend
- API funcional com FastAPI.
- Routers separados por domínio clínico e administrativo .
- Repositories responsáveis pelo acesso a dados.
- Estrutura de `dao`, `schemas` e `services` definida e alinhada com a organização atual do backend .
- Ficheiro `db.py` responsável pela ligação à base de dados e execução de queries .
- Autenticação implementada com hashing de passwords .
- `main.py` centraliza os routers principais da API, incluindo `auth`, `utentes`, `episodios`, `triagem`, `internamento`, `profissionais`, `ato`, `prescricao`, `hospital` e `medicamento` .

### Base de Dados
- Scripts SQL disponíveis para criação e população da base de dados .
- O ficheiro `createTables.sql` define as tabelas principais e os tipos enumerados usados no sistema, como `cor_triagem_enum`, `tipo_func_enum`, `estado_ep_enum` e `tipo_alta_enum` .
- O modelo de dados está estruturado para urgência hospitalar, internamento, medicação, prescrição e autenticação .

### Frontend Web
- Estrutura de frontend organizada em `components`, `pages`, `contexts`, `services`, `hooks` e `utils`, com recurso a React, Vite e Tailwind .
- O frontend inclui páginas para homepage pública, login, dashboards por perfil, utente, episódio e administração de utilizadores .

### IA
- Estrutura prevista para o módulo de IA, incluindo geração de dados, treino e modelo de apoio .

### Android
- Pasta reservada para futura extensão da aplicação a ambiente móvel Android .

---

## 🔌 Endpoints disponíveis

| Módulo | Exemplos |
|--------|----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`  |
| Utentes | `GET /api/utentes/`  |
| Episódios | `GET /api/episodios/`  |
| Triagem | `GET /api/triagens/`  |
| Internamentos | `GET /api/internamentos/`  |
| Profissionais | `GET /api/profissionais/`  |
| Atos | `GET /api/atos/`  |
| Prescrições | `GET /api/prescricoes/`  |
| Hospitais | `GET /api/hospitais/`  |
| Medicamentos | `GET /api/medicamentos/`  |

Os routers atualmente existentes no projeto incluem `ato.py`, `auth.py`, `episodios.py`, `hospital.py`, `internamento.py`, `medicamento.py`, `prescricao.py`, `profissionais.py`, `triagem.py` e `utentes.py`.
---

## 🚀 Como executar o projeto

### Docker

```bash
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
### WEB

```bash
npm install
npm run dev
```
http://localhost:4173/

O repositório principal do projeto está no GitHub e corresponde ao trabalho desenvolvido pelo Grupo 8 .

---

## 🌐 URLs úteis

| Serviço | URL |
|---------|-----|
| API | `http://localhost:8000`  |
| Swagger UI | `http://localhost:8000/docs`  |
| ReDoc | `http://localhost:8000/redoc`  |
| pgAdmin | `http://localhost:8080`  |

---

## 🐍 Comandos úteis

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
python -m backend.update_passwords
```

---

## 📋 Roadmap

### Próximos passos
- Consolidar todos os endpoints CRUD principais .
- Finalizar validação de dados com Pydantic.
- Melhorar tratamento de erros .
- Integrar e consolidar o frontend web com a API .
- Adicionar testes aos endpoints principais .
- Desenvolver o módulo de IA .
- Evoluir a extensão Android prevista na estrutura do projeto .

---

## 📅 Cronograma

| Fase | Data | Estado |
|------|------|--------|
| Intermédia | 17 Abr 2026 | Em progresso  |
| Defesa | 25–26 Mai 2026 | Planeado  |
| Apresentação | 28 Mai 2026 | Planeado  |
| Relatório | 28 Mai 2026 | Planeado  |

---

## 👥 Grupo 8

- João Martins 
- João Sacramento 
- Luis Franco 
- Pedro Antunes 
