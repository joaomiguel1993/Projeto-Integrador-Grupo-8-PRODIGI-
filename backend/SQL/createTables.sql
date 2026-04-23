-- ============================================================
-- PRODIGI — Sistema de Gestão Hospitalar
-- createTables.sql
-- Baseado no diagrama ER enviado
-- ============================================================

-- ------------------------------------------------------------
-- LIMPEZA
-- ------------------------------------------------------------
DROP TABLE IF EXISTS Alerta CASCADE;
DROP TABLE IF EXISTS Prescreve CASCADE;
DROP TABLE IF EXISTS RealizaAto CASCADE;
DROP TABLE IF EXISTS Ato CASCADE;
DROP TABLE IF EXISTS Triagem CASCADE;
DROP TABLE IF EXISTS Internamento CASCADE;
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
-- TIPOS
-- ------------------------------------------------------------
CREATE TYPE cor_triagem_enum AS ENUM (
    'vermelho', 'laranja', 'amarelo', 'verde', 'azul'
);

CREATE TYPE tipo_func_enum AS ENUM (
    'medico', 'enfermeiro', 'admin'
);

CREATE TYPE estado_ep_enum AS ENUM (
    'aberto', 'em_triagem', 'em_atendimento', 'internado', 'terminado'
);

CREATE TYPE tipo_alta_enum AS ENUM (
    'clinica', 'voluntaria', 'transferencia', 'obito'
);

-- ------------------------------------------------------------
-- UTENTE
-- ------------------------------------------------------------
CREATE TABLE Utente (
    NumUtent SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    NIF VARCHAR(9) NOT NULL UNIQUE,
    DataNasc DATE NOT NULL,
    Sexo CHAR(1) NOT NULL CHECK (Sexo IN ('M','F')),
    Localidade VARCHAR(100)
);

-- ------------------------------------------------------------
-- HOSPITAL
-- ------------------------------------------------------------
CREATE TABLE Hospital (
    IdHosp SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Localizacao VARCHAR(200) NOT NULL
);

-- ------------------------------------------------------------
-- FUNCIONARIO
-- ------------------------------------------------------------
CREATE TABLE Funcionario (
    IdFunc SERIAL PRIMARY KEY,
    NumFunc VARCHAR(20) NOT NULL UNIQUE,
    Nome VARCHAR(100) NOT NULL,
    TipoFunc tipo_func_enum NOT NULL,
    Sexo CHAR(1) NOT NULL CHECK (Sexo IN ('M','F'))
);

-- ------------------------------------------------------------
-- MEDICO
-- ------------------------------------------------------------
CREATE TABLE Medico (
    IdFunc INT PRIMARY KEY,
    Estagiario BOOLEAN NOT NULL DEFAULT FALSE,
    Especialidade VARCHAR(100) NOT NULL,
    CONSTRAINT fk_medico_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ENFERMEIRO
-- ------------------------------------------------------------
CREATE TABLE Enfermeiro (
    IdFunc INT PRIMARY KEY,
    CONSTRAINT fk_enfermeiro_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- UTILIZADOR
-- ------------------------------------------------------------
CREATE TABLE Utilizador (
    IdUtilizador SERIAL PRIMARY KEY,
    IdFunc INT NOT NULL UNIQUE,
    UserName VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Funcao tipo_func_enum NOT NULL,
    CONSTRAINT fk_utilizador_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ANTECEDENTE
-- ------------------------------------------------------------
CREATE TABLE Antecedente (
    CodAntecede SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL
);

-- ------------------------------------------------------------
-- UTENTEANTECED
-- ------------------------------------------------------------
CREATE TABLE UtenteAntecedente (
    NumUtent INT NOT NULL,
    CodAntecede INT NOT NULL,
    DataRegisto DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (NumUtent, CodAntecede),
    CONSTRAINT fk_ua_utente
        FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent)
        ON DELETE CASCADE,
    CONSTRAINT fk_ua_antec
        FOREIGN KEY (CodAntecede) REFERENCES Antecedente(CodAntecede)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- MEDICAMENTO
-- ------------------------------------------------------------
CREATE TABLE Medicamento (
    CodMedicamento SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    PrincipioAtivo VARCHAR(100) NOT NULL
);

-- ------------------------------------------------------------
-- MEDICACAOATIVA
-- ------------------------------------------------------------
CREATE TABLE MedicacaoAtiva (
    CodMedicacaoAtiva SERIAL NOT NULL,
    NumUtent INT NOT NULL,
    CodMedicamento INT NOT NULL,
    DataInicio DATE NOT NULL,
    DataFim DATE,
    Dosagem VARCHAR(50),
    PRIMARY KEY (NumUtent, CodMedicacaoAtiva),
    CONSTRAINT fk_ma_utente
        FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent)
        ON DELETE CASCADE,
    CONSTRAINT fk_ma_medicamento
        FOREIGN KEY (CodMedicamento) REFERENCES Medicamento(CodMedicamento)
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- EPISODIO DE URGENCIA
-- ------------------------------------------------------------
CREATE TABLE EpUrgencia (
    CodEpUrgenc SERIAL PRIMARY KEY,
    NumUtent INT NOT NULL,
    IdHosp INT NOT NULL,
    DataHoraEntr TIMESTAMP NOT NULL DEFAULT NOW(),
    DataHoraSaida TIMESTAMP,
    Estado estado_ep_enum NOT NULL DEFAULT 'aberto',
    CONSTRAINT fk_ep_utente
        FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent)
        ON DELETE RESTRICT,
    CONSTRAINT fk_ep_hosp
        FOREIGN KEY (IdHosp) REFERENCES Hospital(IdHosp)
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- TRIAGEM
-- ------------------------------------------------------------
CREATE TABLE Triagem (
    CodEpUrgenc INT PRIMARY KEY,
    DataHoraInicio TIMESTAMP NOT NULL,
    DataHoraFim TIMESTAMP,
    CorTriagem cor_triagem_enum NOT NULL,
    Sintomas TEXT NOT NULL,
    FreqCard INT,
    SpO2 DECIMAL(4,1),
    Sistolica INT,
    Diastolica INT,
    Temperatura DECIMAL(4,1),
    CONSTRAINT fk_triagem_ep
        FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ATO
-- ------------------------------------------------------------
CREATE TABLE Ato (
    IdAto SERIAL PRIMARY KEY,
    CodEpUrgenc INT NOT NULL,
    Tipo VARCHAR(100) NOT NULL,
    DataHoraInicio TIMESTAMP NOT NULL,
    DataHoraFim TIMESTAMP,
    CONSTRAINT fk_ato_ep
        FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- REALIZA
-- relacionamento N:N entre Funcionario e Ato
-- ------------------------------------------------------------
CREATE TABLE Realiza (
    IdFunc INT NOT NULL,
    IdAto INT NOT NULL,
    PRIMARY KEY (IdFunc, IdAto),
    CONSTRAINT fk_ra_func
        FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc)
        ON DELETE RESTRICT,
    CONSTRAINT fk_ra_ato
        FOREIGN KEY (IdAto) REFERENCES Ato(IdAto)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- PRESCREVE
-- ------------------------------------------------------------
CREATE TABLE Prescreve (
    IdPrescricao SERIAL PRIMARY KEY,
    IdAto INT NOT NULL,
    Descricao TEXT NOT NULL,
    DataHoraPresc TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_presc_ato
        FOREIGN KEY (IdAto) REFERENCES Ato(IdAto)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ALERTA
-- ------------------------------------------------------------
CREATE TABLE Alerta (
    CodAlerta SERIAL PRIMARY KEY,
    IdPrescricao INT NOT NULL,
    IdFunc INT,
    Tipo VARCHAR(50) NOT NULL,
    DataHorAlerta TIMESTAMP NOT NULL DEFAULT NOW(),
    Ignorado BOOLEAN NOT NULL DEFAULT FALSE,
    Justificacao TEXT,
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
    CodInternamento SERIAL PRIMARY KEY,
    CodEpUrgenc INT NOT NULL UNIQUE,
    DataHoraInt TIMESTAMP NOT NULL,
    DataHoraConsulta TIMESTAMP,
    DataHoraAlta TIMESTAMP,
    MotivoInt TEXT NOT NULL,
    NumeroCama VARCHAR(20),
    Servico VARCHAR(100),
    TipoAlta tipo_alta_enum,
    CONSTRAINT fk_int_ep
        FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc)
        ON DELETE CASCADE
);