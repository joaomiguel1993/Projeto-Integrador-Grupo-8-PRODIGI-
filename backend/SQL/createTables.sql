-- ============================================================
-- PRODIGI — Sistema de Gestão Hospitalar
-- createTables.sql (VERSÃO FINAL COM SUPORTE PARA IA)
-- ============================================================

-- ------------------------------------------------------------
-- LIMPEZA
-- ------------------------------------------------------------
DROP TABLE IF EXISTS Trabalha CASCADE;
DROP TABLE IF EXISTS Alerta CASCADE;
DROP TABLE IF EXISTS Prescreve CASCADE;
DROP TABLE IF EXISTS Realiza CASCADE;
DROP TABLE IF EXISTS Ato CASCADE;
DROP TABLE IF EXISTS Triagem CASCADE;
DROP TABLE IF EXISTS Internamento CASCADE;
DROP TABLE IF EXISTS EpUrgencia CASCADE;
DROP TABLE IF EXISTS MedicacaoAtiva CASCADE;
DROP TABLE IF EXISTS Medicamento CASCADE;
DROP TABLE IF EXISTS Alergia CASCADE; -- Adicionado para a IA de Prescrição
DROP TABLE IF EXISTS UtenteAntecedente CASCADE;
DROP TABLE IF EXISTS Antecedente CASCADE;
DROP TABLE IF EXISTS Utilizador CASCADE;
DROP TABLE IF EXISTS Medico CASCADE;
DROP TABLE IF EXISTS Enfermeiro CASCADE;
DROP TABLE IF EXISTS Funcionario CASCADE;
DROP TABLE IF EXISTS Hospital CASCADE;
DROP TABLE IF EXISTS Utente CASCADE;
DROP TABLE IF EXISTS log_atividade CASCADE;

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
    'medico', 'enfermeiro', 'admin', 'rececionista'
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
    Sexo CHAR(1) NOT NULL CHECK (Sexo IN ('M', 'F')),
    Localidade VARCHAR(100)
);

-- ------------------------------------------------------------
-- HOSPITAL
-- ------------------------------------------------------------
CREATE TABLE Hospital (
    IdHosp SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Localizacao VARCHAR(200) NOT NULL,
    Email VARCHAR(150),
    Telefone VARCHAR(30)
);

-- ------------------------------------------------------------
-- FUNCIONARIO
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- TRABALHA (FUNCIONÁRIO <-> HOSPITAL)
-- ------------------------------------------------------------
CREATE TABLE Trabalha (
    IdFunc INT NOT NULL,
    IdHosp INT NOT NULL,
    Ativo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (IdFunc, IdHosp),
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE CASCADE,
    FOREIGN KEY (IdHosp) REFERENCES Hospital(IdHosp) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- MEDICO
-- ------------------------------------------------------------
CREATE TABLE Medico (
    IdFunc INT PRIMARY KEY,
    Estagiario BOOLEAN NOT NULL DEFAULT FALSE,
    Especialidade VARCHAR(100) NOT NULL,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ENFERMEIRO
-- ------------------------------------------------------------
CREATE TABLE Enfermeiro (
    IdFunc INT PRIMARY KEY,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- UTILIZADOR
-- ------------------------------------------------------------
CREATE TABLE Utilizador (
    IdFunc INT PRIMARY KEY,
    UserName VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(50) NOT NULL DEFAULT '',
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ANTECEDENTE
-- ------------------------------------------------------------
CREATE TABLE Antecedente (
    CodAntecedente SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Tipo VARCHAR(50)
);

-- ------------------------------------------------------------
-- UTENTEANTECEDENTE
-- ------------------------------------------------------------
CREATE TABLE UtenteAntecedente (
    NumUtent INT NOT NULL,
    CodAntecedente INT NOT NULL,
    DataRegisto DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (NumUtent, CodAntecedente),
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent) ON DELETE CASCADE,
    FOREIGN KEY (CodAntecedente) REFERENCES Antecedente(CodAntecedente) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ALERGIA (NOVA TABELA - IA DE MEDICAMENTOS)
-- ------------------------------------------------------------
CREATE TABLE Alergia (
    CodAlergia SERIAL PRIMARY KEY,
    NumUtent INT NOT NULL,
    Substancia VARCHAR(100) NOT NULL,
    ClasseTerapeuticaID INT NOT NULL, -- Essencial para ligar ao Dataset da IA (Tem_Alergia_Classe)
    NivelGravidade VARCHAR(50),
    DataRegisto DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent) ON DELETE CASCADE,
    UNIQUE (NumUtent, ClasseTerapeuticaID)
);

-- ------------------------------------------------------------
-- MEDICAMENTO (ATUALIZADO - IA DE MEDICAMENTOS)
-- ------------------------------------------------------------
CREATE TABLE Medicamento (
    CodMedicamento SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    PrincipioAtivo VARCHAR(100) NOT NULL,
    ClasseTerapeuticaID INT NOT NULL -- Essencial para o Dataset da IA (Classe_Novo_Med)
);

-- ------------------------------------------------------------
-- MEDICACAO ATIVA
-- ------------------------------------------------------------
CREATE TABLE MedicacaoAtiva (
    CodMedicacaoAtiva SERIAL PRIMARY KEY,
    NumUtent INT NOT NULL,
    CodMedicamento INT NOT NULL,
    DataInicio DATE NOT NULL,
    DataFim DATE,
    Dosagem VARCHAR(50),
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent) ON DELETE CASCADE,
    FOREIGN KEY (CodMedicamento) REFERENCES Medicamento(CodMedicamento) ON DELETE RESTRICT,
    UNIQUE (NumUtent, CodMedicamento, DataInicio)
);

-- ------------------------------------------------------------
-- EPISODIO DE URGENCIA (ATUALIZADO - IA WAIT TIME)
-- ------------------------------------------------------------
CREATE TABLE EpUrgencia (
    CodEpUrgenc SERIAL PRIMARY KEY,
    NumUtent INT NOT NULL,
    IdHosp INT NOT NULL,
    DataHoraEntr TIMESTAMP NOT NULL DEFAULT NOW(),
    DataHoraAtendimento TIMESTAMP, -- Permite calcular tempo de espera real para treinar IA no futuro
    DataHoraSaida TIMESTAMP,
    Estado estado_ep_enum NOT NULL DEFAULT 'aberto',
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent) ON DELETE RESTRICT,
    FOREIGN KEY (IdHosp) REFERENCES Hospital(IdHosp) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- TRIAGEM (ATUALIZADA - IA TRIAGEM E NLP)
-- ------------------------------------------------------------
CREATE TABLE Triagem (
    CodEpUrgenc INT PRIMARY KEY,
    DataHoraInicio TIMESTAMP NOT NULL,
    DataHoraFim TIMESTAMP,
    CorTriagem cor_triagem_enum NOT NULL,
    Sintomas TEXT NOT NULL,
    Temperatura DECIMAL(4,1),
    FreqCard INT,
    FreqResp INT,
    SpO2 DECIMAL(4,1),
    Sistolica INT,
    Diastolica INT,
    NivelDor INT CHECK (NivelDor >= 0 AND NivelDor <= 10), -- Extraído pela IA de Voz
    Consciencia VARCHAR(50) CHECK (Consciencia IN ('Acordado', 'Confuso', 'Inconsciente')), -- Extraído pela IA de Voz
    TempoEsperaPrevisto INT, -- Gerado pela IA de Wait Time
    FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ATO
-- ------------------------------------------------------------
CREATE TABLE Ato (
    IdAto SERIAL PRIMARY KEY,
    CodEpUrgenc INT NOT NULL,
    Tipo VARCHAR(100) NOT NULL,
    Descricao TEXT,
    DataHoraInicio TIMESTAMP NOT NULL,
    DataHoraFim TIMESTAMP,
    FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- REALIZA (N:N)
-- ------------------------------------------------------------
CREATE TABLE Realiza (
    IdAto INT NOT NULL,
    IdFunc INT NOT NULL,
    PRIMARY KEY (IdAto, IdFunc),
    FOREIGN KEY (IdAto) REFERENCES Ato(IdAto) ON DELETE CASCADE,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- PRESCREVE (ATUALIZADA - IA DE MEDICAMENTOS)
-- ------------------------------------------------------------
CREATE TABLE Prescreve (
    IdPrescricao SERIAL PRIMARY KEY,
    IdAto INT NOT NULL,
    CodMedicamento INT NOT NULL, -- Ligação direta à tabela Medicamento para a IA saber a classe
    Dosagem VARCHAR(50) NOT NULL,
    Observacoes TEXT,
    DataHoraPresc TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (IdAto) REFERENCES Ato(IdAto) ON DELETE CASCADE,
    FOREIGN KEY (CodMedicamento) REFERENCES Medicamento(CodMedicamento) ON DELETE RESTRICT
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
    FOREIGN KEY (IdPrescricao) REFERENCES Prescreve(IdPrescricao) ON DELETE CASCADE,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- INTERNAMENTO
-- ------------------------------------------------------------
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
    TipoAlta tipo_alta_enum,
    FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc) ON DELETE CASCADE,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE SET NULL,
    CHECK (
        (DataHoraAlta IS NULL AND TipoAlta IS NULL)
        OR
        (DataHoraAlta IS NOT NULL AND TipoAlta IS NOT NULL)
    )
);

-- ------------------------------------------------------------
-- LOG DE ATIVIDADE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_atividade (
    idlog       BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50),
    acao        VARCHAR(100),
    detalhe     TEXT,
    ip          VARCHAR(45),
    criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_username ON log_atividade(username);
CREATE INDEX IF NOT EXISTS idx_log_criado_em ON log_atividade(criado_em);