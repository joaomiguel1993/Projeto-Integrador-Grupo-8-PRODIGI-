# SIGUI — Sistema Integrado de Gestão de Urgência Inteligente

SIGUI é uma plataforma hospitalar com foco na gestão de urgência, apoio clínico e inteligência preditiva. O sistema combina uma aplicação web para operação e administração hospitalar com uma aplicação mobile de apoio contínuo aos profissionais de saúde, incluindo acesso rápido ao processo do utente por QR code, integração com APIs REST e funcionalidades de IA clínica 

A arquitetura funcional assenta em controlo de acessos por perfil, módulos clínicos e administrativos, registo de auditoria e serviços de apoio à decisão, seguindo uma abordagem em camadas adequada a aplicações FastAPI maiores 

## Perfis do sistema

O sistema está organizado por perfis com permissões distintas, o que ajuda a reduzir acesso indevido a dados sensíveis e a alinhar o produto com práticas de RBAC em contexto hospitalar 

### Administrador

- Gestão completa do sistema.
- Gestão de utilizadores e perfis.
- Gestão de hospitais e unidades.
- Gestão de permissões e RBAC.
- Visualização de logs e auditoria.
- Gestão de alertas.
- Estatísticas globais.
- Monitorização dos módulos de IA.
- Configuração de integrações e parâmetros do sistema.
- Gestão de catálogos e tabelas de apoio 

### Médico

- Consultar episódios.
- Criar atos médicos.
- Criar e validar prescrições.
- Consultar antecedentes clínicos.
- Consultar medicação ativa e alergias.
- Pedir exames e consultar resultados.
- Resolver alertas clínicos.
- Consultar internamentos.
- Registar observações clínicas.
- Consultar apoio à decisão por IA 

### Enfermeiro

- Registar triagens.
- Consultar episódios.
- Atualizar estados do utente.
- Registar sinais vitais.
- Gerir administração de medicação.
- Registar reavaliações.
- Consultar alertas relevantes.
- Acompanhar fila clínica e prioridades.
- Consultar internamentos e plano de cuidados 

### Rececionista

- Registar utentes.
- Criar episódios.
- Consultar filas de espera.
- Atualizar dados administrativos.
- Encaminhar utentes para urgência e triagem.
- Consultar disponibilidade hospitalar.
- Imprimir comprovativos, etiquetas ou QR code de episódio.
- Efetuar admissões e check-in 

### Público

A plataforma inclui uma área pública sem autenticação para comunicação institucional e orientação do cidadão. Este tipo de portal é útil para divulgar disponibilidade, tempos de espera, informação prática e contactos hospitalares 

#### Funcionalidades públicas

- Página inicial institucional.
- Informação hospitalar, incluindo dados do hospital e tempos médios de espera.
- Contactos.
- Estatísticas gerais.
- Informações sobre urgências.
- Tempos médios de espera.
- Hospitais disponíveis.
- FAQ.
- Login.
- Localização e mapa dos hospitais.
- Serviços e especialidades disponíveis.
- Avisos institucionais e notícias.
- Informação de acessibilidade e idiomas 

## Funcionalidades principais

O sistema cobre os módulos centrais normalmente associados a plataformas hospitalares modernas, incluindo gestão operacional, acompanhamento clínico, reporting e automação baseada em IA 

- Gestão de utentes.
- Gestão de episódios.
- Gestão de triagens.
- Gestão hospitalar.
- Prescrições médicas.
- Exames e resultados.
- Internamentos.
- Alertas automáticos.
- Logs do sistema e auditoria.
- Predição IA.
- Estatísticas e reporting.
- Gestão de profissionais.
- Dashboard administrativo.
- Autenticação JWT.
- Controlo de acessos por perfil.
- Gestão de sinais vitais.
- Histórico clínico e antecedentes.
- Notificações em tempo real 

## Funcionalidades de IA

A componente de IA posiciona o SIGUI como uma plataforma de apoio à decisão e não apenas como um sistema de registo. Em contexto hospitalar, funcionalidades como previsão, scoring de risco e dashboards analíticos ajudam a melhorar priorização, segurança e eficiência operacional [cite:820][cite:823].

- Previsão de tempo de espera.
- Classificação de triagem.
- Deteção de risco medicamentoso.
- Processamento NLP por voz.
- Geração de dashboards analíticos.
- Integração com APIs FastAPI.
- Histórico de predições IA.
- Explicação do resultado ou score de risco.
- Monitorização da performance dos modelos.
- Alertas clínicos baseados em padrões 

## Aplicação mobile

A aplicação mobile funciona como extensão contínua da plataforma web e destina-se sobretudo a profissionais hospitalares. O uso de QR code em saúde é adequado para acesso rápido a informação clínica, identificação operacional e redução de erros no contexto assistencial 

### Objetivos principais

- Acesso móvel para profissionais hospitalares.
- Autenticação segura com JWT.
- Consulta rápida de episódios clínicos.
- Visualização de triagens e tempos de espera.
- Integração com APIs REST do sistema.
- Dashboards móveis.
- Notificações hospitalares em tempo real.
- Acesso rápido ao perfil do profissional.
- Consulta de internamentos e prescrições.
- Suporte a futuras funcionalidades de IA.
- Leitura de QR code do utente ou episódio.
- Consulta rápida de alergias e alertas críticos.
- Registo rápido de sinais vitais.
- Confirmação de administração de medicação.
- Modo visita clínica ou rounds 


## Tabelas

### Utente
- NIF
- Nome
- DataNasc
- Sexo
- Localidade
- Telefone
- Email

### Hospital
- IdHosp
- Nome
- Localizacao
- Email
- Telefone
- TotalCamas

### Funcionario
- IdFunc
- Nome
- TipoFunc
  - medico
  - enfermeiro
  - admin
  - rececionista
- Sexo
- Email
- Telefone
- Biografia
- Foto_url

### Trabalha
- IdFunc
- IdHosp
- Ativo

### Medico
- IdFunc
- Estagiario
- Especialidade

### Enfermeiro
- IdFunc

### Utilizador
- IdFunc
- UserName
- Password
- bloqueado
- role

### Antecedente
- CodAntecedente
- Nome
- Tipo

### UtenteAntecedente
- NIF
- CodAntecedente
- DataRegisto

### Medicamento
- CodMedicamento
- Nome
- PrincipioAtivo
- ClasseTerapeutica
  - analgesico
  - anti_inflamatorio
  - antibiotico
  - antiviral
  - antifungico
  - anti_histaminico
  - corticosteroide
  - opioide
  - ansiolitico
  - antidepressivo
  - antipsicotico
  - antiepileptico
  - anti_hipertensor
  - beta_bloqueador
  - anticoagulante
  - antiagregante
  - antidiabetico
  - insulina
  - broncodilatador
  - antiacido
  - diuretico
  - relaxante_muscular
  - imunossupressor
  - vacina
  - sedativo
  - anestesico
  - contraste_radiologico
  - outro

### Alergia
- CodAlergia
- NIF
- Substancia
- ClasseTerapeutica
  - analgesico
  - anti_inflamatorio
  - antibiotico
  - antiviral
  - antifungico
  - anti_histaminico
  - corticosteroide
  - opioide
  - ansiolitico
  - antidepressivo
  - antipsicotico
  - antiepileptico
  - anti_hipertensor
  - beta_bloqueador
  - anticoagulante
  - antiagregante
  - antidiabetico
  - insulina
  - broncodilatador
  - antiacido
  - diuretico
  - relaxante_muscular
  - imunossupressor
  - vacina
  - sedativo
  - anestesico
  - contraste_radiologico
  - outro
- NivelGravidade
- Reacao
- DataRegisto

### MedicacaoAtiva
- CodMedicacaoAtiva
- NIF
- CodMedicamento
- DataInicio
- DataFim
- Dosagem

### EpUrgencia
- CodEpUrgenc
- NIF
- IdHosp
- DataHoraEntr
- DataHoraAtendimento
- DataHoraSaida
- Estado
  - aberto
  - em_triagem
  - em_atendimento
  - internado
  - terminado
- PrioridadeAtual
  - vermelho
  - laranja
  - amarelo
  - verde
  - azul
- TempoEsperaAtual
- EmObservacao
- DestinoFinal

### Triagem
- CodEpUrgenc
- DataHoraInicio
- DataHoraFim
- CorTriagem
  - vermelho
  - laranja
  - amarelo
  - verde
  - azul
- QueixaPrincipal
  - dor_toracica
  - dispneia
  - febre
  - cefaleia
  - dor_abdominal
  - trauma
  - hemorragia
  - vomitos
  - alteracao_consciencia
  - reacao_alergica
  - convulsoes
  - intoxicacao
- ViaAerea
  - permeavel
  - comprometida
  - obstruida
- RespiracaoCirculacao
  - normal
  - dispneia_ligeira
  - dispneia_moderada
  - dispneia_grave
  - choque
  - paragem_cardiorrespiratoria
- Hemorragia
  - nenhuma
  - ligeira
  - moderada
  - grave
- Consciencia
  - alerta
  - confuso
  - sonolento
  - inconsciente
- EstadoPele
  - normal
  - palida
  - cianotica
  - sudorese
  - ruborizada
- Mobilidade
  - independente
  - auxilio_parcial
  - cadeira_rodas
  - acamado
- TipoDor
  - pontada
  - pressao
  - ardor
  - pulsatil
  - continua
  - intermitente
- DorLocalizacao
- Sintomas
- ObservacoesClinicas
- TempoInicioSintomas
- EscalaGlasgow
- Isolamento
- Gravida
- Temperatura
- FreqCard
- FreqResp
- SpO2
- Sistolica
- Diastolica
- NivelDor
- TempoEsperaPrevisto
- IdFunc

### ReavaliacaoTriagem
- IdReavaliacao
- CodEpUrgenc
- DataHora
- Temperatura
- FreqCard
- FreqResp
- SpO2
- NivelDor
- Observacoes
- NovaCorTriagem
  - vermelho
  - laranja
  - amarelo
  - verde
  - azul
- IdFunc

### Ato
- IdAto
- CodEpUrgenc
- Tipo
- Descricao
- DataHoraInicio
- DataHoraFim

### Realiza
- IdAto
- IdFunc

### Prescreve
- IdPrescricao
- IdAto
- CodMedicamento
- Dosagem
- Frequencia
- ViaAdministracao
- DuracaoDias
- Observacoes
- DataHoraPresc
- EstadoPrescricao
  - pendente
  - aprovada
  - bloqueada
  - anulada
- ScoreRiscoIA
- ValidadoPorIA
- DataHoraValidacaoIA

### Alerta
- CodAlerta
- IdPrescricao
- IdFunc
- Tipo
- DataHorAlerta
- Ignorado
- Justificacao
- Severidade
  - baixo
  - moderado
  - alto
  - critico
- ScoreRisco
- Resolvido
- ResolvidoEm
- ResolvidoPor
- MensagemIA
- Recomendacao

### PredicaoIA
- IdPredicao
- TipoModelo
  - triagem
  - tempo_espera
  - risco_medicamentoso
- Entidade
  - triagem
  - prescricao
  - tempo_espera
- EntidadeId
- InputJson
- OutputJson
- Score
- ModeloVersao
- Sucesso
- ErroMensagem
- CriadoEm

### Internamento
- CodInternamento
- CodEpUrgenc
- IdFunc
- DataHoraInt
- DataHoraConsulta
- DataHoraAlta
- MotivoInt
- NumeroCama
- Servico
- PrioridadeInternamento
- EstadoAtual
- ObservacoesAlta
- DiagnosticoAlta
- TipoAlta
  - clinica
  - voluntaria
  - transferencia
  - obito

### HistoricoInternamento
- IdHistorico
- CodInternamento
- DataHora
- TipoEvento
- Descricao
- IdFunc

### Exame
- CodExame
- CodEpUrgenc
- Tipo
- Resultado
- DataHoraPedido
- DataHoraResultado
- Estado
- IdFunc

### SinaisVitais
- IdSinal
- CodEpUrgenc
- Temperatura
- FreqCard
- FreqResp
- SpO2
- Sistolica
- Diastolica
- NivelDor
- DataHora
- IdFunc

### log_atividade
- idlog
- username
- acao
- detalhe
- ip
- criado_em


## Convenção dos endpoints

Sim — pelo que foi definido, os endpoints estão a seguir a convenção ` /api/v1/... `, que é uma abordagem comum para versionamento de APIs e facilita evolução futura sem quebrar clientes existentes 

### Exemplo de padrão

```text
/api/v1/recurso
/api/v1/recurso/{id}
/api/v1/recurso/filtro/{valor}
```

### Vantagens desta convenção

- Versionamento explícito da API.
- Organização previsível dos recursos.
- Facilidade de manutenção e documentação.
- Menor risco de breaking changes em clientes web e mobile 

## Endpoints atuais

A lista abaixo consolida os endpoints já definidos ao longo do projeto. Alguns recursos são CRUD completos e outros são apenas de leitura quando representam `views` da base de dados, o que é coerente com uma arquitetura orientada a serviços e consultas agregadas 

### Realiza

```text
GET    /api/v1/realiza/
GET    /api/v1/realiza/ato/{id_ato}
GET    /api/v1/realiza/funcionario/{id_func}
GET    /api/v1/realiza/{id_ato}/{id_func}
POST   /api/v1/realiza/
PUT    /api/v1/realiza/{id_ato}/{id_func}
DELETE /api/v1/realiza/{id_ato}/{id_func}
```

### EpUrgencia

```text
GET    /api/v1/ep-urgencia/
GET    /api/v1/ep-urgencia/nif/{nif}
GET    /api/v1/ep-urgencia/hospital/{id_hosp}
GET    /api/v1/ep-urgencia/estado/{estado}
GET    /api/v1/ep-urgencia/{cod_ep_urgenc}
POST   /api/v1/ep-urgencia/
PUT    /api/v1/ep-urgencia/{cod_ep_urgenc}
DELETE /api/v1/ep-urgencia/{cod_ep_urgenc}
```

### Triagem

```text
GET    /api/v1/triagem/
GET    /api/v1/triagem/cor/{cor_triagem}
GET    /api/v1/triagem/funcionario/{id_func}
GET    /api/v1/triagem/{cod_ep_urgenc}
POST   /api/v1/triagem/
PUT    /api/v1/triagem/{cod_ep_urgenc}
DELETE /api/v1/triagem/{cod_ep_urgenc}
```

### SinaisVitais

```text
GET    /api/v1/sinais-vitais/
GET    /api/v1/sinais-vitais/episodio/{cod_ep_urgenc}
GET    /api/v1/sinais-vitais/funcionario/{id_func}
GET    /api/v1/sinais-vitais/{id_sinal}
POST   /api/v1/sinais-vitais/
PUT    /api/v1/sinais-vitais/{id_sinal}
DELETE /api/v1/sinais-vitais/{id_sinal}
```

### Alergia

```text
GET    /api/v1/alergia/
GET    /api/v1/alergia/utente/{nif}
GET    /api/v1/alergia/classe/{classe_terapeutica}
GET    /api/v1/alergia/{cod_alergia}
POST   /api/v1/alergia/
PUT    /api/v1/alergia/{cod_alergia}
DELETE /api/v1/alergia/{cod_alergia}
```

### MedicacaoAtiva

```text
GET    /api/v1/medicacao-ativa/
GET    /api/v1/medicacao-ativa/utente/{nif}
GET    /api/v1/medicacao-ativa/medicamento/{cod_medicamento}
GET    /api/v1/medicacao-ativa/{cod_medicacao_ativa}
POST   /api/v1/medicacao-ativa/
PUT    /api/v1/medicacao-ativa/{cod_medicacao_ativa}
DELETE /api/v1/medicacao-ativa/{cod_medicacao_ativa}
```

### Prescreve

```text
GET    /api/v1/prescreve/
GET    /api/v1/prescreve/ato/{id_ato}
GET    /api/v1/prescreve/medicamento/{cod_medicamento}
GET    /api/v1/prescreve/estado/{estado_prescricao}
GET    /api/v1/prescreve/{id_prescricao}
POST   /api/v1/prescreve/
PUT    /api/v1/prescreve/{id_prescricao}
DELETE /api/v1/prescreve/{id_prescricao}
```

### Alerta

```text
GET    /api/v1/alerta/
GET    /api/v1/alerta/prescricao/{id_prescricao}
GET    /api/v1/alerta/funcionario/{id_func}
GET    /api/v1/alerta/severidade/{severidade}
GET    /api/v1/alerta/resolvido/{resolvido}
GET    /api/v1/alerta/{cod_alerta}
POST   /api/v1/alerta/
PUT    /api/v1/alerta/{cod_alerta}
DELETE /api/v1/alerta/{cod_alerta}
```

### Internamento

```text
GET    /api/v1/internamento/
GET    /api/v1/internamento/episodio/{cod_ep_urgenc}
GET    /api/v1/internamento/funcionario/{id_func}
GET    /api/v1/internamento/estado/{estado_atual}
GET    /api/v1/internamento/{cod_internamento}
POST   /api/v1/internamento/
PUT    /api/v1/internamento/{cod_internamento}
DELETE /api/v1/internamento/{cod_internamento}
```

### PredicaoIA

```text
GET    /api/v1/predicao-ia/
GET    /api/v1/predicao-ia/tipo-modelo/{tipo_modelo}
GET    /api/v1/predicao-ia/entidade/{entidade}
GET    /api/v1/predicao-ia/entidade/{entidade}/{entidade_id}
GET    /api/v1/predicao-ia/sucesso/{sucesso}
GET    /api/v1/predicao-ia/{id_predicao}
POST   /api/v1/predicao-ia/
PUT    /api/v1/predicao-ia/{id_predicao}
DELETE /api/v1/predicao-ia/{id_predicao}
```

### HistoricoInternamento

```text
GET    /api/v1/historico-internamento/
GET    /api/v1/historico-internamento/internamento/{cod_internamento}
GET    /api/v1/historico-internamento/funcionario/{id_func}
GET    /api/v1/historico-internamento/tipo-evento/{tipo_evento}
GET    /api/v1/historico-internamento/{id_historico}
POST   /api/v1/historico-internamento/
PUT    /api/v1/historico-internamento/{id_historico}
DELETE /api/v1/historico-internamento/{id_historico}
```

### Exame

```text
GET    /api/v1/exame/
GET    /api/v1/exame/episodio/{cod_ep_urgenc}
GET    /api/v1/exame/estado/{estado}
GET    /api/v1/exame/tipo/{tipo}
GET    /api/v1/exame/funcionario/{id_func}
GET    /api/v1/exame/{cod_exame}
POST   /api/v1/exame/
PUT    /api/v1/exame/{cod_exame}
DELETE /api/v1/exame/{cod_exame}
```

### LogAtividade

```text
GET    /api/v1/log-atividade/
GET    /api/v1/log-atividade/username/{username}
GET    /api/v1/log-atividade/acao/{acao}
GET    /api/v1/log-atividade/ip/{ip}
GET    /api/v1/log-atividade/{id_log}
POST   /api/v1/log-atividade/
PUT    /api/v1/log-atividade/{id_log}
DELETE /api/v1/log-atividade/{id_log}
```

### v_estatisticas_ia

```text
GET    /api/v1/estatisticas-ia/
GET    /api/v1/estatisticas-ia/{id_hosp}
```

### v_contexto_prescricao

```text
GET    /api/v1/contexto-prescricao/
GET    /api/v1/contexto-prescricao/prescricao/{id_prescricao}
GET    /api/v1/contexto-prescricao/ato/{id_ato}
GET    /api/v1/contexto-prescricao/episodio/{cod_ep_urgenc}
GET    /api/v1/contexto-prescricao/utente/{nif}
GET    /api/v1/contexto-prescricao/medicamento/{cod_medicamento}
```

## Organização recomendada do backend

Uma estrutura em múltiplos ficheiros com `schemas`, `dao`, `repositories`, `services` e `routers` ajuda a manter separação de responsabilidades e facilita testes, evolução e documentação da API [

```text
backend/
├── dao/
├── repositories/
├── routers/
├── schemas/
├── services/
├── db.py
└── main.py
```

## Notas finais

Os endpoints estão, de facto, no formato `api/v1/...`, e isso está certo para a convenção que tens vindo a seguir. Se quiseres manter máxima coerência, vale a pena garantir que todos os routers usam o mesmo padrão de naming, preferencialmente com recursos em kebab-case, como `ep-urgencia`, `sinais-vitais` e `predicao-ia` 

Outra melhoria recomendável é usar `PATCH` para updates parciais, porque vários endpoints estão a usar `exclude_unset=True`, o que semanticamente se aproxima mais de atualização parcial do que de substituição total 