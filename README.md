# 🏥 SIAGUH – Sistema Integrado de Apoio à Gestão de Urgências Hospitalares

Sistema Integrado de Apoio à Gestão de Urgências Hospitalares desenvolvido pelo **Grupo 8** no âmbito do Projeto Integrador da pós-graduação PRODIGI. O projeto tem como objetivo suportar operações centrais de um serviço de urgência hospitalar, incluindo gestão de utentes, episódios, triagem clínica, internamentos, atos médicos, prescrições, profissionais e autenticação.

---

## 📌 Objetivo

No âmbito do Projeto Integrador da pós-graduação PRODIGI, o Grupo 8 está a desenvolver um sistema completo para suporte a fluxos de urgência hospitalar, permitindo consultar e gerir informação clínica e administrativa relevante. A aplicação utiliza **React + Vite** no frontend web e **FastAPI + PostgreSQL + Docker** no backend, com autenticação e passwords cifradas (*hashed*). Estão também previstos módulos de IA e uma aplicação móvel Android.

---

## 📁 Estrutura do Repositório

Esta é a árvore completa do projeto, contemplando os ficheiros já desenvolvidos e as expansões futuras do sistema (como Android e ficheiros de tradução locais).

```text
Projeto-Integrador-Grupo-8-PRODIGI/
│
├── backend/                                   # API FastAPI (Desenvolvimento Backend)
│   ├── auth/                                  # Lógica de Autenticação e Segurança
│   │   ├── __init__.py
│   │   ├── security.py                        # Hashing e verificação de JWT
│   │   ├── dependencies.py                    # Injeção de dependências do FastAPI
│   │   └── permissions.py                     # Validação de Role-Based Access Control (RBAC)
│   │
│   ├── dao/                                   # Data Access Objects (Queries SQL cruas)
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
│   ├── repositories/                          # Camada de abstração e regras de dados
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
│   ├── routers/                               # Controladores/Endpoints da API
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
│   ├── schemas/                               # Modelos Pydantic (Validação de Dados)
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
│   ├── scripts/                               # Scripts auxiliares e de manutenção
│   │   └── (Ficheiros futuros de manutenção)
│   │
│   ├── services/                              # Lógica de Negócio (Business Logic)
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
│   ├── SQL/                                   # Scripts da Base de Dados PostgreSQL
│   │   ├── createTables.sql
│   │   └── populateDB.sql
│   │
│   ├── config.py                              # Carregamento de variáveis de ambiente
│   ├── db.py                                  # Conexão à base de dados PostgreSQL
│   ├── main.py                                # Ficheiro raiz da aplicação FastAPI
│   ├── requirements.txt                       # Dependências Python
│   └── update_passwords.py                    # Utilitário para bcrypt de passwords
│
├── web/                                       # Frontend Web (React + Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.svg
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx                        # Componente principal do React
│   │   │   ├── router.jsx                     # Definição das rotas da aplicação
│   │   │   └── providers.jsx                  # Embrulho dos React Contexts
│   │   │
│   │   ├── components/                        # Componentes UI reutilizáveis
│   │   │   ├── ui/                            # Botões, Tabelas, Inputs, Modais
│   │   │   │   ├── Badge.jsx, Button.jsx, Card.jsx, ConfirmDialog.jsx
│   │   │   │   ├── DateInput.jsx, EmptyState.jsx, FormInput.jsx, KPICard.jsx
│   │   │   │   ├── LoadingSpinner.jsx, Modal.jsx, SearchInput.jsx, Select.jsx
│   │   │   │   └── StatusBadge.jsx, Table.jsx, Tabs.jsx, TextArea.jsx
│   │   │   │
│   │   │   ├── layout/                        # Estruturas de Ecrã (Sidebars, Headers)
│   │   │   │   ├── AuthLayout.jsx, PublicLayout.jsx, Topbar.jsx
│   │   │   │   ├── HeaderAuth.jsx, HeaderPublic.jsx, HospitalContextBanner.jsx
│   │   │   │   └── SidebarAdmin.jsx, SidebarEnfermeiro.jsx, SidebarMedico.jsx, SidebarRececionista.jsx
│   │   │   │
│   │   │   ├── guards/                        # Controlos de acesso às rotas
│   │   │   │   ├── PermissionGate.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── RoleRoute.jsx
│   │   │   │
│   │   │   └── shared/                        # Componentes comuns entre perfis
│   │   │       ├── AllergyAlert.jsx, AuditTimeline.jsx, EpisodeQueueCard.jsx
│   │   │       └── EpisodeStatusBadge.jsx, HospitalKPIs.jsx, MedicationList.jsx, PriorityBadge.jsx
│   │   │
│   │   ├── contexts/                          # Estados globais (Context API)
│   │   │   ├── AuthContext.jsx
│   │   │   ├── HospitalContext.jsx
│   │   │   └── PermissionContext.jsx
│   │   │
│   │   ├── hooks/                             # Custom React Hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useHospital.js
│   │   │   ├── usePagination.js
│   │   │   └── usePermissions.js
│   │   │
│   │   ├── imagens/                           # Logótipos e assets gráficos
│   │   │
│   │   ├── locals/                            # Internacionalização (Traduções)
│   │   │   ├── pt.json                        # (Ficheiro futuro de suporte a Português)
│   │   │   └── en.json                        # (Ficheiro futuro de suporte a Inglês)
│   │   │
│   │   ├── pages/                             # Ecrãs do sistema
│   │   │   ├── public/                        # Páginas não autenticadas
│   │   │   │   ├── Home.jsx, HospitalDetalhe.jsx, Login.jsx
│   │   │   │
│   │   │   ├── auth/                          # Configurações do utilizador logado
│   │   │   │   ├── Perfil.jsx, SelecionarHospital.jsx, SemPermissao.jsx
│   │   │   │
│   │   │   ├── dashboards/                    # Painéis iniciais por perfil
│   │   │   │   ├── DashboardAdmin.jsx, DashboardEnfermeiro.jsx
│   │   │   │   └── DashboardMedico.jsx, DashboardRececionista.jsx
│   │   │   │
│   │   │   ├── admin/                         # Área de Administração
│   │   │   │   ├── AdminAssociacoesHospitais.jsx, AdminAuditoria.jsx, AdminEpisodiosClinicos.jsx
│   │   │   │   ├── AdminFuncionarios.jsx, AdminHospitais.jsx, AdminRelatorioDetalhe.jsx
│   │   │   │   └── AdminRelatorios.jsx, AdminUtilizadorDetalhe.jsx, AdminUtilizadorNovo.jsx, AdminUtilizadores.jsx
│   │   │   │
│   │   │   ├── rececao/                       # Área de Rececionista
│   │   │   │   ├── RececaoEntradas.jsx, RececaoNovaEntrada.jsx, RececaoUtenteDetalhe.jsx
│   │   │   │   └── RececaoUtenteNovo.jsx, RececaoUtentes.jsx
│   │   │   │
│   │   │   ├── enfermagem/                    # Área de Enfermagem (Triagem)
│   │   │   │   ├── FichaUtenteConsulta.jsx, TriagemDetalhe.jsx, TriagemFila.jsx, TriagemNova.jsx
│   │   │   │
│   │   │   ├── medico/                        # Área de Medicina (Gabinete)
│   │   │   │   ├── MedicoAlergiasInteracoes.jsx, MedicoAltaInternamento.jsx, MedicoEpisodioDetalhe.jsx
│   │   │   │   ├── MedicoFilaTriados.jsx, MedicoHistoricoUtente.jsx, MedicoMedicacaoAtiva.jsx
│   │   │   │   └── MedicoNovaMedicacao.jsx, MedicoPrescricaoNova.jsx
│   │   │   │
│   │   │   └── common/                        # Páginas/Views usadas por vários perfis
│   │   │       ├── EpisodioAlertas.jsx, EpisodioAtos.jsx, EpisodioPrescricoes.jsx
│   │   │       └── EpisodioResumo.jsx, InternamentoDetalhe.jsx, UtenteFichaCompleta.jsx
│   │   │
│   │   ├── services/                          # Ligação à API (Ficheiros Fetch/Axios)
│   │   │   ├── alertas.js, api.js, associacoesHospitais.js, auditoria.js, auth.js
│   │   │   ├── episodios.js, hospitais.js, ia.js, internamentos.js, medicacaoAtiva.js
│   │   │   └── medicamentos.js, prescricoes.js, profissionais.js, relatorios.js
│   │   │   └── triagem.js, utilizadores.js, utentes.js
│   │   │
│   │   ├── utils/                             # Utilitários e formatadores Web
│   │   │   ├── constants.js, episodeStatus.js, formatters.js, permissions.js
│   │   │   └── roleHome.js, triagePriority.js
│   │   │
│   │   ├── styles/
│   │   │   └── index.css                      # CSS Global e injeções do Tailwind
│   │   │
│   │   └── main.jsx                           # Ponto de entrada do React
│   │
│   ├── index.html
│   ├── package.json                           # Dependências NPM do Frontend
│   ├── vite.config.js                         # Configuração do empacotador Vite
│   └── tailwind.config.js                     # Configuração de temas do Tailwind CSS
│
├── ia/                                        # Modelos de Inteligência Artificial
│   ├── modelos/
│   │   ├── modelo_triagem.pkl                 # Modelo treinado para previsão de prioridade
│   │   └── modelo_alergias.pkl                # Modelo treinado para interações de medicação
│   ├── triagem_modelo.py
│   ├── alergias_modelo.py
│   ├── treino_triagem.py
│   └── treino_alergias.py
│
├── android/                                   # Futuro Cliente Mobile (App SIAGUH)
│   └── (Estrutura a definir - React Native/Kotlin)
│
├── docs/                                      # Manuais e Documentação de Software
│   ├── api.md
│   ├── arquitetura.md
│   ├── fluxos.md
│   ├── requisitos.md
│   ├── Programas/
│   └── teste_wine/
│
├── .env.example                               # Modelo base de credenciais
├── .gitignore
├── docker-compose.yml                         # Ficheiro de orquestração Docker
├── Dockerfile                                 # Build do projeto Backend
└── README.md                                  # Informação geral do Repositório
```

A organização do backend está centrada no padrão de arquitetura em camadas (`routers` -> `services` -> `repositories` -> `dao`), garantindo a separação entre endpoints, lógica de negócio e acesso a dados. O frontend está modularizado com React Contexts, Hooks customizados e Route Guards.

---

## 🗄️ Modelo de Dados

O sistema inclui entidades principais como `Utente`, `Hospital`, `Funcionario`, `Utilizador`, `EpUrgencia`, `Triagem`, `Ato`, `Prescreve`, `Internamento`, `Antecedente`, `Medicamento`, `MedicacaoAtiva`, `Alerta` e respetivas tabelas de associação, como `Trabalha`, `Realiza` e `UtenteAntecedente`.

O ficheiro `createTables.sql` define as tabelas principais e os tipos enumerados (*enums*) usados no sistema, como `cor_triagem_enum`, `tipo_func_enum`, `estado_ep_enum` e `tipo_alta_enum`.

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Base de dados** | PostgreSQL + pgAdmin |
| **Backend / API** | FastAPI + Uvicorn |
| **Acesso a dados** | psycopg2 + SQL puro |
| **Validação de dados** | Pydantic |
| **Autenticação** | JWT Tokens + Hash de passwords |
| **Containerização** | Docker + Docker Compose |
| **Frontend Web** | React + Vite + Tailwind CSS |
| **Inteligência Artificial** | Scikit-learn (Python) |
| **Controlo de versões** | Git + GitHub |

---

## ✅ Estado Atual do Projeto

### Backend
- API funcional com FastAPI (`main.py` central).
- Endpoints separados por domínio (Auth, Utentes, Episódios, Triagem, Internamento, Profissionais, Atos, Prescrições, Hospitais, Medicamentos).
- Arquitetura implementada com Repositories e DAO.
- Autenticação funcional com hashing de passwords.

### Base de Dados
- Modelo estruturado para suportar fluxos complexos hospitalares.
- Scripts de criação de tabelas e população inicial concluídos.

### Frontend Web
- Estrutura consolidada em React, Vite e Tailwind.
- Autenticação e gestão de permissões (*Role-Based Access Control*).
- Dashboards diferenciados por perfil (Admin, Médico, Enfermeiro, Rececionista).
- Módulos de gestão de utentes, filas de espera de triagem e atos médicos desenvolvidos.

### Inteligência Artificial
- Modelos preditivos de apoio à Triagem e Alergias desenvolvidos.
- Scripts de treino disponíveis.

### Android
- Estrutura base reservada para desenvolvimento da aplicação móvel.

---

## 🔌 Endpoints Disponíveis

Alguns dos principais *routers* integrados na API:

| Módulo | Exemplos |
|--------|----------|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/register` |
| **Utentes** | `GET /api/utentes/` |
| **Episódios** | `GET /api/episodios/` |
| **Triagem** | `GET /api/triagens/` |
| **Internamentos** | `GET /api/internamentos/` |
| **Profissionais** | `GET /api/profissionais/` |
| **Atos** | `GET /api/atos/` |
| **Prescrições** | `GET /api/prescricoes/` |
| **Hospitais** | `GET /api/hospitais/` |
| **Medicamentos** | `GET /api/medicamentos/` |

---

## 🚀 Como executar o projeto

### Opção 1: Usando Docker (Recomendado)

```bash
# Iniciar a aplicação
docker compose up --build

# Para parar os serviços
docker compose down
```

### Opção 2: Execução Local (Modo Desenvolvimento)

**1. Clonar o repositório:**
```bash
git clone https://github.com/joaomiguel1993/Projeto-Integrador-Grupo-8-PRODIGI-.git
cd Projeto-Integrador-Grupo-8-PRODIGI-
```

**2. Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

**3. Iniciar o Backend (FastAPI):**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**4. Iniciar o Frontend Web (React):**
Num novo terminal:
```bash
cd web
npm install
npm run dev
```

---

## 🌐 URLs Úteis

Após iniciar os serviços localmente, podes aceder aos seguintes endereços:

| Serviço | URL |
|---------|-----|
| **Frontend Web** | [http://localhost:4173](http://localhost:4173) *(ou a porta indicada pelo Vite)* |
| **API Backend** | [http://localhost:8000](http://localhost:8000) |
| **Documentação (Swagger UI)** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Documentação (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| **Interface de BD (pgAdmin)** | [http://localhost:8080](http://localhost:8080) |

---

## 📋 Roadmap e Próximos Passos

- [x] Arquitetura de base (Frontend e Backend).
- [x] Sistema de Autenticação e Autorização.
- [x] Layouts e componentes partilhados.
- [x] Módulo de IA inicial.
- [ ] Consolidar integração entre frontend web e a API.
- [ ] Adicionar tratamento avançado de erros na UI.
- [ ] Implementar testes unitários e de integração (Jest/Pytest).
- [ ] Desenvolver extensão Android.

---

## 📅 Cronograma

| Fase | Data Prevista | Estado |
|------|------|--------|
| **Intermédia** | 17 Abr 2026 | ✅ Concluído |
| **Defesa** | 25–26 Mai 2026 | ⏳ Planeado |
| **Apresentação** | 28 Mai 2026 | ⏳ Planeado |
| **Entrega Relatório** | 28 Mai 2026 | ⏳ Planeado |

---

## 👥 Grupo 8

* **João Martins**
* **João Sacramento**
* **Luis Franco**
* **Pedro Antunes**