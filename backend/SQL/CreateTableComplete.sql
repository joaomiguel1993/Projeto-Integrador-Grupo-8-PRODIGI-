-- ============================================================
-- PRODIGI — Sistema de Gestão Hospitalar
-- CREATE TABLES FINAL — IA + TRIAGEM MANCHESTER
-- ============================================================

-- ============================================================
-- LIMPEZA
-- ============================================================

DROP VIEW IF EXISTS v_contexto_prescricao CASCADE;
DROP VIEW IF EXISTS v_estatisticas_ia CASCADE;

DROP TABLE IF EXISTS SinaisVitais CASCADE;
DROP TABLE IF EXISTS Exame CASCADE;
DROP TABLE IF EXISTS HistoricoInternamento CASCADE;
DROP TABLE IF EXISTS ReavaliacaoTriagem CASCADE;
DROP TABLE IF EXISTS PredicaoIA CASCADE;
DROP TABLE IF EXISTS Alerta CASCADE;
DROP TABLE IF EXISTS Prescreve CASCADE;
DROP TABLE IF EXISTS Realiza CASCADE;
DROP TABLE IF EXISTS Ato CASCADE;
DROP TABLE IF EXISTS Triagem CASCADE;
DROP TABLE IF EXISTS Internamento CASCADE;
DROP TABLE IF EXISTS EpUrgencia CASCADE;
DROP TABLE IF EXISTS MedicacaoAtiva CASCADE;
DROP TABLE IF EXISTS Alergia CASCADE;
DROP TABLE IF EXISTS Medicamento CASCADE;
DROP TABLE IF EXISTS UtenteAntecedente CASCADE;
DROP TABLE IF EXISTS Antecedente CASCADE;
DROP TABLE IF EXISTS Utilizador CASCADE;
DROP TABLE IF EXISTS Medico CASCADE;
DROP TABLE IF EXISTS Enfermeiro CASCADE;
DROP TABLE IF EXISTS Trabalha CASCADE;
DROP TABLE IF EXISTS Funcionario CASCADE;
DROP TABLE IF EXISTS Hospital CASCADE;
DROP TABLE IF EXISTS Utente CASCADE;
DROP TABLE IF EXISTS log_atividade CASCADE;

-- ============================================================
-- DROP TYPES
-- ============================================================

DROP TYPE IF EXISTS classe_terapeutica_enum CASCADE;
DROP TYPE IF EXISTS estado_prescricao_enum CASCADE;
DROP TYPE IF EXISTS severidade_alerta_enum CASCADE;
DROP TYPE IF EXISTS tipo_modelo_ia_enum CASCADE;
DROP TYPE IF EXISTS entidade_ia_enum CASCADE;
DROP TYPE IF EXISTS cor_triagem_enum CASCADE;
DROP TYPE IF EXISTS tipo_func_enum CASCADE;
DROP TYPE IF EXISTS estado_ep_enum CASCADE;
DROP TYPE IF EXISTS tipo_alta_enum CASCADE;

DROP TYPE IF EXISTS consciencia_enum CASCADE;
DROP TYPE IF EXISTS via_aerea_enum CASCADE;
DROP TYPE IF EXISTS respiracao_circulacao_enum CASCADE;
DROP TYPE IF EXISTS estado_pele_enum CASCADE;
DROP TYPE IF EXISTS mobilidade_enum CASCADE;
DROP TYPE IF EXISTS tipo_dor_enum CASCADE;
DROP TYPE IF EXISTS queixa_principal_enum CASCADE;
DROP TYPE IF EXISTS hemorragia_enum CASCADE;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE consciencia_enum AS ENUM (
    'alerta',
    'confuso',
    'sonolento',
    'inconsciente'
);

CREATE TYPE via_aerea_enum AS ENUM (
    'permeavel',
    'comprometida',
    'obstruida'
);

CREATE TYPE respiracao_circulacao_enum AS ENUM (
    'normal',
    'dispneia_ligeira',
    'dispneia_moderada',
    'dispneia_grave',
    'choque',
    'paragem_cardiorrespiratoria'
);

CREATE TYPE estado_pele_enum AS ENUM (
    'normal',
    'palida',
    'cianotica',
    'sudorese',
    'ruborizada'
);

CREATE TYPE mobilidade_enum AS ENUM (
    'independente',
    'auxilio_parcial',
    'cadeira_rodas',
    'acamado'
);

CREATE TYPE tipo_dor_enum AS ENUM (
    'pontada',
    'pressao',
    'ardor',
    'pulsatil',
    'continua',
    'intermitente'
);

CREATE TYPE queixa_principal_enum AS ENUM (
    'dor_toracica',
    'dispneia',
    'febre',
    'cefaleia',
    'dor_abdominal',
    'trauma',
    'hemorragia',
    'vomitos',
    'alteracao_consciencia',
    'reacao_alergica',
    'convulsoes',
    'intoxicacao'
);

CREATE TYPE hemorragia_enum AS ENUM (
    'nenhuma',
    'ligeira',
    'moderada',
    'grave'
);

CREATE TYPE cor_triagem_enum AS ENUM (
    'vermelho',
    'laranja',
    'amarelo',
    'verde',
    'azul'
);

CREATE TYPE tipo_func_enum AS ENUM (
    'medico',
    'enfermeiro',
    'admin',
    'rececionista'
);

CREATE TYPE estado_ep_enum AS ENUM (
    'aberto',
    'em_triagem',
    'em_atendimento',
    'internado',
    'terminado'
);

CREATE TYPE tipo_alta_enum AS ENUM (
    'clinica',
    'voluntaria',
    'transferencia',
    'obito'
);

CREATE TYPE estado_prescricao_enum AS ENUM (
    'pendente',
    'aprovada',
    'bloqueada',
    'anulada'
);

CREATE TYPE severidade_alerta_enum AS ENUM (
    'baixo',
    'moderado',
    'alto',
    'critico'
);

CREATE TYPE tipo_modelo_ia_enum AS ENUM (
    'triagem',
    'tempo_espera',
    'risco_medicamentoso'
);

CREATE TYPE entidade_ia_enum AS ENUM (
    'triagem',
    'prescricao'
);

CREATE TYPE classe_terapeutica_enum AS ENUM (
    'analgesico',
    'anti_inflamatorio',
    'antibiotico',
    'antiviral',
    'antifungico',
    'anti_histaminico',
    'corticosteroide',
    'opioide',
    'ansiolitico',
    'antidepressivo',
    'antipsicotico',
    'antiepileptico',
    'anti_hipertensor',
    'beta_bloqueador',
    'anticoagulante',
    'antiagregante',
    'antidiabetico',
    'insulina',
    'broncodilatador',
    'antiacido',
    'diuretico',
    'relaxante_muscular',
    'imunossupressor',
    'vacina',
    'sedativo',
    'anestesico',
    'contraste_radiologico',
    'outro'
);

-- ============================================================
-- UTENTE
-- ============================================================

CREATE TABLE Utente (
    NIF VARCHAR(9) PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    DataNasc DATE NOT NULL,
    Sexo CHAR(1) NOT NULL CHECK (Sexo IN ('M', 'F')),
    Localidade VARCHAR(100),
    Telefone VARCHAR(20),
    Email VARCHAR(255)
);

-- ============================================================
-- HOSPITAL
-- ============================================================

CREATE TABLE Hospital (
    IdHosp SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Localizacao VARCHAR(200) NOT NULL,
    Email VARCHAR(150),
    Telefone VARCHAR(30),
    TotalCamas INT DEFAULT 100
);

-- ============================================================
-- FUNCIONARIO
-- ============================================================

CREATE TABLE Funcionario (
    IdFunc SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    TipoFunc tipo_func_enum NOT NULL,
    Sexo CHAR(1) NOT NULL CHECK (Sexo IN ('M', 'F')),
    Email VARCHAR(150),
    Telefone VARCHAR(20),
    Biografia TEXT,
    Foto_url TEXT
);

-- ============================================================
-- TRABALHA
-- ============================================================

CREATE TABLE Trabalha (
    IdFunc INT NOT NULL,
    IdHosp INT NOT NULL,
    Ativo BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (IdFunc, IdHosp),

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE,

    FOREIGN KEY (IdHosp)
        REFERENCES Hospital(IdHosp)
        ON DELETE CASCADE
);

-- ============================================================
-- MEDICO / ENFERMEIRO / UTILIZADOR
-- ============================================================

CREATE TABLE Medico (
    IdFunc INT PRIMARY KEY,
    Estagiario BOOLEAN NOT NULL DEFAULT FALSE,
    Especialidade VARCHAR(100) NOT NULL,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

CREATE TABLE Enfermeiro (
    IdFunc INT PRIMARY KEY,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

CREATE TABLE Utilizador (
    IdFunc INT PRIMARY KEY,
    UserName VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(50) NOT NULL DEFAULT '',

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

-- ============================================================
-- ANTECEDENTES
-- ============================================================

CREATE TABLE Antecedente (
    CodAntecedente SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Tipo VARCHAR(50)
);

CREATE TABLE UtenteAntecedente (
    NIF VARCHAR(9) NOT NULL,
    CodAntecedente INT NOT NULL,
    DataRegisto DATE NOT NULL DEFAULT CURRENT_DATE,

    PRIMARY KEY (NIF, CodAntecedente),

    FOREIGN KEY (NIF)
        REFERENCES Utente(NIF)
        ON DELETE CASCADE,

    FOREIGN KEY (CodAntecedente)
        REFERENCES Antecedente(CodAntecedente)
        ON DELETE CASCADE
);

-- ============================================================
-- MEDICAMENTO
-- ============================================================

CREATE TABLE Medicamento (
    CodMedicamento SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    PrincipioAtivo VARCHAR(100) NOT NULL,
    ClasseTerapeutica classe_terapeutica_enum NOT NULL
);

-- ============================================================
-- ALERGIA
-- ============================================================

CREATE TABLE Alergia (
    CodAlergia SERIAL PRIMARY KEY,

    NIF VARCHAR(9) NOT NULL,

    Substancia VARCHAR(100) NOT NULL,

    ClasseTerapeutica classe_terapeutica_enum NOT NULL,

    NivelGravidade VARCHAR(50),

    Reacao TEXT,

    DataRegisto DATE NOT NULL DEFAULT CURRENT_DATE,

    FOREIGN KEY (NIF)
        REFERENCES Utente(NIF)
        ON DELETE CASCADE
);

-- ============================================================
-- MEDICACAO ATIVA
-- ============================================================

CREATE TABLE MedicacaoAtiva (
    CodMedicacaoAtiva SERIAL PRIMARY KEY,

    NIF VARCHAR(9) NOT NULL,

    CodMedicamento INT NOT NULL,

    DataInicio DATE NOT NULL,

    DataFim DATE,

    Dosagem VARCHAR(50),

    FOREIGN KEY (NIF)
        REFERENCES Utente(NIF)
        ON DELETE CASCADE,

    FOREIGN KEY (CodMedicamento)
        REFERENCES Medicamento(CodMedicamento)
        ON DELETE RESTRICT
);

-- ============================================================
-- EPISODIO URGENCIA
-- ============================================================

CREATE TABLE EpUrgencia (
    CodEpUrgenc SERIAL PRIMARY KEY,

    NIF VARCHAR(9) NOT NULL,

    IdHosp INT NOT NULL,

    DataHoraEntr TIMESTAMP NOT NULL DEFAULT NOW(),

    DataHoraAtendimento TIMESTAMP,

    DataHoraSaida TIMESTAMP,

    Estado estado_ep_enum NOT NULL DEFAULT 'aberto',

    PrioridadeAtual cor_triagem_enum,

    TempoEsperaAtual INT,

    EmObservacao BOOLEAN DEFAULT FALSE,

    DestinoFinal VARCHAR(100),

    FOREIGN KEY (NIF)
        REFERENCES Utente(NIF)
        ON DELETE RESTRICT,

    FOREIGN KEY (IdHosp)
        REFERENCES Hospital(IdHosp)
        ON DELETE RESTRICT
);

-- ============================================================
-- TRIAGEM
-- ============================================================

CREATE TABLE Triagem (
    CodEpUrgenc INT PRIMARY KEY,

    DataHoraInicio TIMESTAMP NOT NULL,

    DataHoraFim TIMESTAMP,

    CorTriagem cor_triagem_enum NOT NULL,

    QueixaPrincipal queixa_principal_enum NOT NULL,

    ViaAerea via_aerea_enum NOT NULL,

    RespiracaoCirculacao respiracao_circulacao_enum NOT NULL,

    Hemorragia hemorragia_enum NOT NULL,

    Consciencia consciencia_enum NOT NULL,

    EstadoPele estado_pele_enum,

    Mobilidade mobilidade_enum,

    TipoDor tipo_dor_enum,

    DorLocalizacao VARCHAR(100),

    Sintomas TEXT NOT NULL,

    ObservacoesClinicas TEXT,

    TempoInicioSintomas VARCHAR(100),

    EscalaGlasgow INT CHECK (EscalaGlasgow BETWEEN 3 AND 15),

    Isolamento BOOLEAN DEFAULT FALSE,

    Gravida BOOLEAN DEFAULT FALSE,

    Temperatura DECIMAL(4,1),

    FreqCard INT,

    FreqResp INT,

    SpO2 DECIMAL(4,1),

    Sistolica INT,

    Diastolica INT,

    NivelDor INT CHECK (NivelDor BETWEEN 0 AND 10),

    TempoEsperaPrevisto INT,

    IdFunc INT,

    FOREIGN KEY (CodEpUrgenc)
        REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ============================================================
-- REAVALIACAO TRIAGEM
-- ============================================================

CREATE TABLE ReavaliacaoTriagem (
    IdReavaliacao SERIAL PRIMARY KEY,

    CodEpUrgenc INT NOT NULL,

    DataHora TIMESTAMP NOT NULL DEFAULT NOW(),

    Temperatura DECIMAL(4,1),

    FreqCard INT,

    FreqResp INT,

    SpO2 DECIMAL(4,1),

    NivelDor INT,

    Observacoes TEXT,

    NovaCorTriagem cor_triagem_enum,

    IdFunc INT,

    FOREIGN KEY (CodEpUrgenc)
        REFERENCES Triagem(CodEpUrgenc)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ============================================================
-- ATO
-- ============================================================

CREATE TABLE Ato (
    IdAto SERIAL PRIMARY KEY,

    CodEpUrgenc INT NOT NULL,

    Tipo VARCHAR(100) NOT NULL,

    Descricao TEXT,

    DataHoraInicio TIMESTAMP NOT NULL,

    DataHoraFim TIMESTAMP,

    FOREIGN KEY (CodEpUrgenc)
        REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE
);

-- ============================================================
-- REALIZA
-- ============================================================

CREATE TABLE Realiza (
    IdAto INT NOT NULL,

    IdFunc INT NOT NULL,

    PRIMARY KEY (IdAto, IdFunc),

    FOREIGN KEY (IdAto)
        REFERENCES Ato(IdAto)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE RESTRICT
);

-- ============================================================
-- PRESCREVE
-- ============================================================

CREATE TABLE Prescreve (
    IdPrescricao SERIAL PRIMARY KEY,

    IdAto INT NOT NULL,

    CodMedicamento INT NOT NULL,

    Dosagem VARCHAR(50) NOT NULL,

    Frequencia VARCHAR(50),

    ViaAdministracao VARCHAR(50),

    DuracaoDias INT,

    Observacoes TEXT,

    DataHoraPresc TIMESTAMP NOT NULL DEFAULT NOW(),

    EstadoPrescricao estado_prescricao_enum NOT NULL DEFAULT 'pendente',

    ScoreRiscoIA DECIMAL(6,4),

    ValidadoPorIA BOOLEAN NOT NULL DEFAULT FALSE,

    DataHoraValidacaoIA TIMESTAMP,

    FOREIGN KEY (IdAto)
        REFERENCES Ato(IdAto)
        ON DELETE CASCADE,

    FOREIGN KEY (CodMedicamento)
        REFERENCES Medicamento(CodMedicamento)
        ON DELETE RESTRICT
);

-- ============================================================
-- ALERTA
-- ============================================================

CREATE TABLE Alerta (
    CodAlerta SERIAL PRIMARY KEY,

    IdPrescricao INT NOT NULL,

    IdFunc INT,

    Tipo VARCHAR(50) NOT NULL,

    DataHorAlerta TIMESTAMP NOT NULL DEFAULT NOW(),

    Ignorado BOOLEAN NOT NULL DEFAULT FALSE,

    Justificacao TEXT,

    Severidade severidade_alerta_enum NOT NULL DEFAULT 'moderado',

    ScoreRisco DECIMAL(6,4),

    Resolvido BOOLEAN NOT NULL DEFAULT FALSE,

    ResolvidoEm TIMESTAMP,

    ResolvidoPor INT,

    MensagemIA TEXT,

    Recomendacao TEXT,

    FOREIGN KEY (IdPrescricao)
        REFERENCES Prescreve(IdPrescricao)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL,

    FOREIGN KEY (ResolvidoPor)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ============================================================
-- PREDICAO IA
-- ============================================================

CREATE TABLE PredicaoIA (
    IdPredicao BIGSERIAL PRIMARY KEY,

    TipoModelo tipo_modelo_ia_enum NOT NULL,

    Entidade entidade_ia_enum NOT NULL,

    EntidadeId INT NOT NULL,

    InputJson JSONB NOT NULL,

    OutputJson JSONB NOT NULL,

    Score DECIMAL(10,6),

    ModeloVersao VARCHAR(100) NOT NULL,

    Sucesso BOOLEAN NOT NULL DEFAULT TRUE,

    ErroMensagem TEXT,

    CriadoEm TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INTERNAMENTO
-- ============================================================

CREATE TABLE Internamento (
    CodInternamento SERIAL PRIMARY KEY,

    CodEpUrgenc INT NOT NULL UNIQUE,

    IdFunc INT,

    DataHoraInt TIMESTAMP NOT NULL,

    DataHoraConsulta TIMESTAMP,

    DataHoraAlta TIMESTAMP,

    MotivoInt TEXT NOT NULL,

    NumeroCama VARCHAR(20),

    Servico VARCHAR(100),

    PrioridadeInternamento VARCHAR(50),

    EstadoAtual VARCHAR(50) DEFAULT 'ativo',

    ObservacoesAlta TEXT,

    DiagnosticoAlta TEXT,

    TipoAlta tipo_alta_enum,

    FOREIGN KEY (CodEpUrgenc)
        REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ============================================================
-- HISTORICO INTERNAMENTO
-- ============================================================

CREATE TABLE HistoricoInternamento (
    IdHistorico SERIAL PRIMARY KEY,

    CodInternamento INT NOT NULL,

    DataHora TIMESTAMP NOT NULL DEFAULT NOW(),

    TipoEvento VARCHAR(100) NOT NULL,

    Descricao TEXT NOT NULL,

    IdFunc INT,

    FOREIGN KEY (CodInternamento)
        REFERENCES Internamento(CodInternamento)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ============================================================
-- EXAME
-- ============================================================

CREATE TABLE Exame (
    CodExame SERIAL PRIMARY KEY,

    CodEpUrgenc INT NOT NULL,

    Tipo VARCHAR(100) NOT NULL,

    Resultado TEXT,

    DataHoraPedido TIMESTAMP NOT NULL DEFAULT NOW(),

    DataHoraResultado TIMESTAMP,

    Estado VARCHAR(50) DEFAULT 'pendente',

    IdFunc INT,

    FOREIGN KEY (CodEpUrgenc)
        REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ============================================================
-- SINAIS VITAIS
-- ============================================================

CREATE TABLE SinaisVitais (
    IdSinal SERIAL PRIMARY KEY,

    CodEpUrgenc INT NOT NULL,

    Temperatura DECIMAL(4,1),

    FreqCard INT,

    FreqResp INT,

    SpO2 DECIMAL(4,1),

    Sistolica INT,

    Diastolica INT,

    NivelDor INT,

    DataHora TIMESTAMP DEFAULT NOW(),

    IdFunc INT,

    FOREIGN KEY (CodEpUrgenc)
        REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE,

    FOREIGN KEY (IdFunc)
        REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ============================================================
-- LOGS
-- ============================================================

CREATE TABLE log_atividade (
    idlog BIGSERIAL PRIMARY KEY,

    username VARCHAR(50),

    acao VARCHAR(100),

    detalhe TEXT,

    ip VARCHAR(45),

    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIEW ESTATISTICAS IA
-- ============================================================

CREATE OR REPLACE VIEW v_estatisticas_ia AS
SELECT
    h.IdHosp,

    h.Nome AS HospitalNome,

    h.TotalCamas AS facility_size_beds,

    (
        SELECT COUNT(*)
        FROM Trabalha t
        JOIN Funcionario f
        ON t.IdFunc = f.IdFunc
        WHERE t.IdHosp = h.IdHosp
        AND f.TipoFunc = 'enfermeiro'
        AND t.Ativo = TRUE
    ) AS contagem_enfermeiros,

    (
        SELECT COUNT(*)
        FROM Trabalha t
        JOIN Funcionario f
        ON t.IdFunc = f.IdFunc
        WHERE t.IdHosp = h.IdHosp
        AND f.TipoFunc = 'medico'
        AND t.Ativo = TRUE
    ) AS contagem_medicos,

    (
        SELECT COUNT(*)
        FROM EpUrgencia e
        WHERE e.IdHosp = h.IdHosp
        AND e.Estado IN (
            'aberto',
            'em_triagem',
            'em_atendimento'
        )
    ) AS pacientes_ativos

FROM Hospital h;

-- ============================================================
-- VIEW CONTEXTO PRESCRICAO
-- ============================================================

CREATE OR REPLACE VIEW v_contexto_prescricao AS
SELECT
    p.IdPrescricao,
    p.IdAto,
    p.CodMedicamento,
    p.Dosagem,
    p.Frequencia,
    p.ViaAdministracao,
    p.DuracaoDias,
    p.Observacoes,
    p.DataHoraPresc,
    p.EstadoPrescricao,
    p.ScoreRiscoIA,
    a.CodEpUrgenc,
    e.NIF,
    e.IdHosp,
    e.DataHoraEntr,
    al.Substancia,
    al.ClasseTerapeutica,
    al.NivelGravidade
FROM Prescreve p
JOIN Ato a ON a.IdAto = p.IdAto
JOIN EpUrgencia e ON e.CodEpUrgenc = a.CodEpUrgenc
LEFT JOIN Alergia al ON al.NIF = e.NIF;

-- ============================================================
-- INDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_log_username
ON log_atividade(username);

CREATE INDEX IF NOT EXISTS idx_log_criado_em
ON log_atividade(criado_em);

CREATE INDEX IF NOT EXISTS idx_epurgencia_hosp_estado
ON EpUrgencia(IdHosp, Estado);

CREATE INDEX IF NOT EXISTS idx_trabalha_hosp_ativo
ON Trabalha(IdHosp, Ativo);

CREATE INDEX IF NOT EXISTS idx_funcionario_tipo
ON Funcionario(TipoFunc);

CREATE INDEX IF NOT EXISTS idx_prescreve_estado
ON Prescreve(EstadoPrescricao);

CREATE INDEX IF NOT EXISTS idx_alerta_idprescricao
ON Alerta(IdPrescricao);

CREATE INDEX IF NOT EXISTS idx_alerta_resolvido
ON Alerta(Resolvido);

CREATE INDEX IF NOT EXISTS idx_predicao_tipo_entidade
ON PredicaoIA(TipoModelo, Entidade, EntidadeId);

CREATE INDEX IF NOT EXISTS idx_predicao_criado_em
ON PredicaoIA(CriadoEm);

CREATE INDEX IF NOT EXISTS idx_medicacaoativa_utente_ativa
ON MedicacaoAtiva (NIF, DataFim);

CREATE INDEX IF NOT EXISTS idx_ato_episode
ON Ato(CodEpUrgenc);

CREATE INDEX IF NOT EXISTS idx_prescreve_ato
ON Prescreve(IdAto);

CREATE INDEX IF NOT EXISTS idx_triagem_cor
ON Triagem(CorTriagem);

CREATE INDEX IF NOT EXISTS idx_reavaliacao_ep
ON ReavaliacaoTriagem(CodEpUrgenc);

CREATE INDEX IF NOT EXISTS idx_historico_internamento
ON HistoricoInternamento(CodInternamento);

CREATE INDEX IF NOT EXISTS idx_exame_ep
ON Exame(CodEpUrgenc);

CREATE INDEX IF NOT EXISTS idx_sinaisvitais_ep
ON SinaisVitais(CodEpUrgenc);