-- ============================================================
-- PRODIGI — Sistema de Gestão Hospitalar
-- createTables.sql
-- Grupo 8 — Projeto Integrador
-- ============================================================

-- ------------------------------------------------------------
-- LIMPEZA (ordem inversa das dependências)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS Alerta CASCADE;
DROP TABLE IF EXISTS Prescreve CASCADE;
DROP TABLE IF EXISTS Realiza CASCADE;
DROP TABLE IF EXISTS Ato CASCADE;
DROP TABLE IF EXISTS Internamento CASCADE;
DROP TABLE IF EXISTS Triagem CASCADE;
DROP TABLE IF EXISTS EpUrgencia CASCADE;
DROP TABLE IF EXISTS MedicacaoAtiva CASCADE;
DROP TABLE IF EXISTS Medicamento CASCADE;
DROP TABLE IF EXISTS UtenteAntecedente CASCADE;
DROP TABLE IF EXISTS Antecedente CASCADE;
DROP TABLE IF EXISTS Utilizador CASCADE;
DROP TABLE IF EXISTS Medico CASCADE;
DROP TABLE IF EXISTS Enfermeiro CASCADE;
DROP TABLE IF EXISTS Funcionario CASCADE;
DROP TABLE IF EXISTS Hospital CASCADE;
DROP TABLE IF EXISTS Utente CASCADE;

DROP TYPE IF EXISTS cor_triagem_enum CASCADE;
DROP TYPE IF EXISTS tipo_func_enum CASCADE;
DROP TYPE IF EXISTS estado_ep_enum CASCADE;
DROP TYPE IF EXISTS tipo_alta_enum CASCADE;

-- ------------------------------------------------------------
-- TIPOS CONTROLADOS
-- ------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE cor_triagem_enum AS ENUM (
        'vermelho', 'laranja', 'amarelo', 'verde', 'azul'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_func_enum AS ENUM (
        'medico', 'enfermeiro', 'admin'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_ep_enum AS ENUM (
        'aberto', 'em_triagem', 'em_atendimento',
        'internado', 'terminado'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_alta_enum AS ENUM (
        'clinica', 'voluntaria', 'transferencia', 'obito'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------
-- UTENTE
-- ------------------------------------------------------------
CREATE TABLE Utente (
    NumUtent    SERIAL          PRIMARY KEY,
    NIF         VARCHAR(9)      NOT NULL UNIQUE,
    Nome        VARCHAR(100)    NOT NULL,
    DataNasc    DATE            NOT NULL,
    Sexo        CHAR(1)         NOT NULL CHECK (Sexo IN ('M', 'F')),
    Localidade  VARCHAR(100)
);

-- ------------------------------------------------------------
-- HOSPITAL
-- ------------------------------------------------------------
CREATE TABLE Hospital (
    IdHosp      SERIAL          PRIMARY KEY,
    Nome        VARCHAR(100)    NOT NULL,
    Localizacao VARCHAR(200)    NOT NULL
);

-- ------------------------------------------------------------
-- FUNCIONARIO
-- ------------------------------------------------------------
CREATE TABLE Funcionario (
    IdFunc      SERIAL              PRIMARY KEY,
    NumFunc     VARCHAR(20)         NOT NULL UNIQUE,
    Nome        VARCHAR(100)        NOT NULL,
    TipoFunc    tipo_func_enum      NOT NULL,
    Sexo        CHAR(1)             NOT NULL CHECK (Sexo IN ('M', 'F'))
);

-- ------------------------------------------------------------
-- MEDICO (subtipo de Funcionario)
-- ------------------------------------------------------------
CREATE TABLE Medico (
    IdFunc          INT             PRIMARY KEY,
    Especialidade   VARCHAR(100)    NOT NULL,
    Estagiario      BOOLEAN         NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_medico_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ENFERMEIRO (subtipo de Funcionario)
-- ------------------------------------------------------------
CREATE TABLE Enfermeiro (
    IdFunc  INT PRIMARY KEY,
    CONSTRAINT fk_enfermeiro_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- UTILIZADOR
-- ------------------------------------------------------------
CREATE TABLE Utilizador (
    IdUtilizador    SERIAL              PRIMARY KEY,
    IdFunc          INT                 NOT NULL UNIQUE,
    UserName        VARCHAR(50)         NOT NULL UNIQUE,
    Password        VARCHAR(255)        NOT NULL,
    Funcao          tipo_func_enum      NOT NULL,
    CONSTRAINT fk_utilizador_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ANTECEDENTE (catálogo)
-- ------------------------------------------------------------
CREATE TABLE Antecedente (
    CodAntecedente  SERIAL          PRIMARY KEY,
    Nome            VARCHAR(100)    NOT NULL,
    Tipo            VARCHAR(50)
);

-- ------------------------------------------------------------
-- UTENTEANTECEDENTE (associativa N:N)
-- ------------------------------------------------------------
CREATE TABLE UtenteAntecedente (
    NumUtent        INT     NOT NULL,
    CodAntecedente  INT     NOT NULL,
    DataRegisto     DATE    NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (NumUtent, CodAntecedente),
    CONSTRAINT fk_ua_utente
        FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent)
        ON DELETE CASCADE,
    CONSTRAINT fk_ua_antecedente
        FOREIGN KEY (CodAntecedente) REFERENCES Antecedente(CodAntecedente)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- MEDICAMENTO (catálogo)
-- ------------------------------------------------------------
CREATE TABLE Medicamento (
    CodMedicamento  SERIAL          PRIMARY KEY,
    Nome            VARCHAR(100)    NOT NULL,
    PrincipioAtivo  VARCHAR(100)    NOT NULL
);

-- ------------------------------------------------------------
-- MEDICACAOATIVA (medicação em curso do utente)
-- ------------------------------------------------------------
CREATE TABLE MedicacaoAtiva (
    CodMedicacaoAtiva   SERIAL      NOT NULL,
    NumUtent            INT         NOT NULL,
    CodMedicamento      INT         NOT NULL,
    DataInicio          DATE        NOT NULL,
    DataFim             DATE,
    Dosagem             VARCHAR(50),
    Ativo               BOOLEAN     NOT NULL DEFAULT TRUE,
    PRIMARY KEY (NumUtent, CodMedicacaoAtiva),
    CONSTRAINT fk_ma_utente
        FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent)
        ON DELETE CASCADE,
    CONSTRAINT fk_ma_medicamento
        FOREIGN KEY (CodMedicamento) REFERENCES Medicamento(CodMedicamento)
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- EPURGENCIA
-- ------------------------------------------------------------
CREATE TABLE EpUrgencia (
    CodEpUrgenc     SERIAL              PRIMARY KEY,
    NumUtent        INT                 NOT NULL,
    IdHosp          INT                 NOT NULL,
    DataHoraEntr    TIMESTAMP           NOT NULL DEFAULT NOW(),
    DataHoraSaida   TIMESTAMP,
    Estado          estado_ep_enum      NOT NULL DEFAULT 'aberto',
    CONSTRAINT fk_ep_utente
        FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent)
        ON DELETE RESTRICT,
    CONSTRAINT fk_ep_hospital
        FOREIGN KEY (IdHosp) REFERENCES Hospital(IdHosp)
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- TRIAGEM (1:1 com EpUrgencia)
-- ------------------------------------------------------------
CREATE TABLE Triagem (
    CodEpUrgenc         INT                 PRIMARY KEY,
    DataHoraInicio      TIMESTAMP           NOT NULL DEFAULT NOW(),
    DataHoraFim         TIMESTAMP,
    CorTriagem          cor_triagem_enum    NOT NULL,
    Sintomas            TEXT                NOT NULL,
    Temperatura         DECIMAL(4,1),
    FreqCardiaca        INT,
    FreqRespiratoria    INT,
    SpO2                DECIMAL(4,1),
    Sistolica           INT,
    Diastolica          INT,
    CONSTRAINT fk_triagem_ep
        FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ATO
-- ------------------------------------------------------------
CREATE TABLE Ato (
    IdAto           SERIAL          PRIMARY KEY,
    CodEpUrgenc     INT             NOT NULL,
    Tipo            VARCHAR(100)    NOT NULL,
    DataHoraInicio  TIMESTAMP       NOT NULL DEFAULT NOW(),
    DataHoraFim     TIMESTAMP,
    Descricao       TEXT,
    CONSTRAINT fk_ato_ep
        FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- REALIZA (N:N entre Ato e Funcionario)
-- ------------------------------------------------------------
CREATE TABLE Realiza (
    IdAto       INT     NOT NULL,
    IdFunc      INT     NOT NULL,
    PRIMARY KEY (IdAto, IdFunc),
    CONSTRAINT fk_realiza_ato
        FOREIGN KEY (IdAto) REFERENCES Ato(IdAto)
        ON DELETE CASCADE,
    CONSTRAINT fk_realiza_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- PRESCREVE
-- ------------------------------------------------------------
CREATE TABLE Prescreve (
    IdPrescricao    SERIAL      PRIMARY KEY,
    IdAto           INT         NOT NULL,
    Descricao       TEXT        NOT NULL,
    DataHoraPresc   TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_presc_ato
        FOREIGN KEY (IdAto) REFERENCES Ato(IdAto)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ALERTA
-- ------------------------------------------------------------
CREATE TABLE Alerta (
    CodAlerta       SERIAL      NOT NULL,
    IdPrescricao    INT         NOT NULL,
    IdFunc          INT,
    DataHorAlerta   TIMESTAMP   NOT NULL DEFAULT NOW(),
    Tipo            VARCHAR(50) NOT NULL,
    Ignorado        BOOLEAN     NOT NULL DEFAULT FALSE,
    Justificacao    TEXT,
    PRIMARY KEY (IdPrescricao, CodAlerta),
    CONSTRAINT fk_alerta_presc
        FOREIGN KEY (IdPrescricao) REFERENCES Prescreve(IdPrescricao)
        ON DELETE CASCADE,
    CONSTRAINT fk_alerta_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- INTERNAMENTO
-- ------------------------------------------------------------
CREATE TABLE Internamento (
    CodInternamento     SERIAL              PRIMARY KEY,
    CodEpUrgenc         INT                 NOT NULL,
    IdFunc              INT                 NOT NULL,
    DataHoraInt         TIMESTAMP           NOT NULL DEFAULT NOW(),
    DataHoraConsulta    TIMESTAMP,
    DataHoraAlta        TIMESTAMP,
    MotivoInt           TEXT                NOT NULL,
    NumeroCama          VARCHAR(10),
    Servico             VARCHAR(100),
    TipoAlta            tipo_alta_enum,
    CONSTRAINT fk_int_ep
        FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE,
    CONSTRAINT fk_int_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- REALIZA (associativa N:N entre Funcionario e Ato/Triagem)
-- ------------------------------------------------------------
CREATE TABLE Realiza (
    IdFunc      INT     NOT NULL,
    CodEpUrgenc INT     NOT NULL,  -- ou IdAto para atos específicos
    DataHora    TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (IdFunc, CodEpUrgenc),
    CONSTRAINT fk_realiza_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE RESTRICT,
    CONSTRAINT fk_realiza_ep
        FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE
);