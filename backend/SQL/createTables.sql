-- ============================================================
-- PRODIGI — Sistema de Gestão Hospitalar
-- createTables.sql (VERSÃO FINAL OTIMIZADA PARA IA)
-- ============================================================

-- ------------------------------------------------------------
-- LIMPEZA
-- ------------------------------------------------------------
DROP VIEW IF EXISTS v_estatisticas_ia;
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
DROP TABLE IF EXISTS Alergia CASCADE;
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
-- TIPOS EXTRA PARA IA
-- ------------------------------------------------------------
DROP TYPE IF EXISTS estado_prescricao_enum CASCADE;
DROP TYPE IF EXISTS severidade_alerta_enum CASCADE;
DROP TYPE IF EXISTS tipo_modelo_ia_enum CASCADE;
DROP TYPE IF EXISTS entidade_ia_enum CASCADE;

CREATE TYPE estado_prescricao_enum AS ENUM ('pendente', 'aprovada', 'bloqueada', 'anulada');
CREATE TYPE severidade_alerta_enum AS ENUM ('baixo', 'moderado', 'alto', 'critico');
CREATE TYPE tipo_modelo_ia_enum AS ENUM ('triagem', 'tempo_espera', 'risco_medicamentoso');
CREATE TYPE entidade_ia_enum AS ENUM ('triagem', 'prescricao');


-- ------------------------------------------------------------
-- TIPOS
-- ------------------------------------------------------------
CREATE TYPE cor_triagem_enum AS ENUM ('vermelho', 'laranja', 'amarelo', 'verde', 'azul');
CREATE TYPE tipo_func_enum AS ENUM ('medico', 'enfermeiro', 'admin', 'rececionista');
CREATE TYPE estado_ep_enum AS ENUM ('aberto', 'em_triagem', 'em_atendimento', 'internado', 'terminado');
CREATE TYPE tipo_alta_enum AS ENUM ('clinica', 'voluntaria', 'transferencia', 'obito');

-- ------------------------------------------------------------
-- UTENTE
-- ------------------------------------------------------------
CREATE TABLE Utente (
    NumUtent SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    NIF VARCHAR(9) NOT NULL UNIQUE,
    DataNasc DATE NOT NULL,
    Sexo CHAR(1) NOT NULL CHECK (Sexo IN ('M', 'F')),
    Localidade VARCHAR(100),
    Telefone VARCHAR(20),
    Email VARCHAR(255)
);

-- ------------------------------------------------------------
-- HOSPITAL (ATUALIZADO COM CAPACIDADE PARA IA)
-- ------------------------------------------------------------
CREATE TABLE Hospital (
    IdHosp SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Localizacao VARCHAR(200) NOT NULL,
    Email VARCHAR(150),
    Telefone VARCHAR(30),
    TotalCamas INT DEFAULT 100 -- Exigido pela IA: Facility_Size_Beds
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
-- MEDICO / ENFERMEIRO / UTILIZADOR
-- ------------------------------------------------------------
CREATE TABLE Medico (
    IdFunc INT PRIMARY KEY,
    Estagiario BOOLEAN NOT NULL DEFAULT FALSE,
    Especialidade VARCHAR(100) NOT NULL,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE CASCADE
);

CREATE TABLE Enfermeiro (
    IdFunc INT PRIMARY KEY,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE CASCADE
);

CREATE TABLE Utilizador (
    IdFunc INT PRIMARY KEY,
    UserName VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(50) NOT NULL DEFAULT '',
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ANTECEDENTES E MEDICAMENTOS
-- ------------------------------------------------------------
CREATE TABLE Antecedente (
    CodAntecedente SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Tipo VARCHAR(50)
);

CREATE TABLE UtenteAntecedente (
    NumUtent INT NOT NULL,
    CodAntecedente INT NOT NULL,
    DataRegisto DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (NumUtent, CodAntecedente),
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent) ON DELETE CASCADE,
    FOREIGN KEY (CodAntecedente) REFERENCES Antecedente(CodAntecedente) ON DELETE CASCADE
);

CREATE TABLE Medicamento (
    CodMedicamento SERIAL PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    PrincipioAtivo VARCHAR(100) NOT NULL,
    ClasseTerapeuticaID INT NOT NULL 
);

CREATE TABLE Alergia (
    CodAlergia SERIAL PRIMARY KEY,
    NumUtent INT NOT NULL,
    Substancia VARCHAR(100) NOT NULL,
    ClasseTerapeuticaID INT NOT NULL,
    NivelGravidade VARCHAR(50),
    DataRegisto DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent) ON DELETE CASCADE,
    UNIQUE (NumUtent, ClasseTerapeuticaID)
);

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
-- EPISODIOS E TRIAGEM
-- ------------------------------------------------------------
CREATE TABLE EpUrgencia (
    CodEpUrgenc SERIAL PRIMARY KEY,
    NumUtent INT NOT NULL,
    IdHosp INT NOT NULL,
    DataHoraEntr TIMESTAMP NOT NULL DEFAULT NOW(),
    DataHoraAtendimento TIMESTAMP, 
    DataHoraSaida TIMESTAMP,
    Estado estado_ep_enum NOT NULL DEFAULT 'aberto',
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent) ON DELETE RESTRICT,
    FOREIGN KEY (IdHosp) REFERENCES Hospital(IdHosp) ON DELETE RESTRICT
);

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
    NivelDor INT CHECK (NivelDor >= 0 AND NivelDor <= 10),
    Consciencia VARCHAR(50) CHECK (Consciencia IN ('Acordado', 'Confuso', 'Inconsciente')),
    TempoEsperaPrevisto INT,
    IdFunc INT,
    FOREIGN KEY (CodEpUrgenc) REFERENCES EpUrgencia(CodEpUrgenc) ON DELETE CASCADE,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- ATOS, PRESCRIÇÕES E ALERTAS
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

CREATE TABLE Realiza (
    IdAto INT NOT NULL,
    IdFunc INT NOT NULL,
    PRIMARY KEY (IdAto, IdFunc),
    FOREIGN KEY (IdAto) REFERENCES Ato(IdAto) ON DELETE CASCADE,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE RESTRICT
);

CREATE TABLE Prescreve (
    IdPrescricao SERIAL PRIMARY KEY,
    IdAto INT NOT NULL,
    CodMedicamento INT NOT NULL,
    Dosagem VARCHAR(50) NOT NULL,
    Observacoes TEXT,
    DataHoraPresc TIMESTAMP NOT NULL DEFAULT NOW(),

    -- IA / workflow clínico
    EstadoPrescricao estado_prescricao_enum NOT NULL DEFAULT 'pendente',
    ScoreRiscoIA DECIMAL(6,4),
    ValidadoPorIA BOOLEAN NOT NULL DEFAULT FALSE,
    DataHoraValidacaoIA TIMESTAMP,

    FOREIGN KEY (IdAto) REFERENCES Ato(IdAto) ON DELETE CASCADE,
    FOREIGN KEY (CodMedicamento) REFERENCES Medicamento(CodMedicamento) ON DELETE RESTRICT
);

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

    FOREIGN KEY (IdPrescricao) REFERENCES Prescreve(IdPrescricao) ON DELETE CASCADE,
    FOREIGN KEY (IdFunc) REFERENCES Funcionario(IdFunc) ON DELETE SET NULL,
    FOREIGN KEY (ResolvidoPor) REFERENCES Funcionario(IdFunc) ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- AUDITORIA DE PREDIÇÕES IA
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- INTERNAMENTO E LOGS
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
    CHECK ((DataHoraAlta IS NULL AND TipoAlta IS NULL) OR (DataHoraAlta IS NOT NULL AND TipoAlta IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS log_atividade (
    idlog       BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50),
    acao        VARCHAR(100),
    detalhe     TEXT,
    ip          VARCHAR(45),
    criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- VISTA DE ESTATÍSTICAS PARA IA (PEÇA CHAVE)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_estatisticas_ia AS
SELECT 
    h.IdHosp,
    h.Nome AS HospitalNome,
    h.TotalCamas AS facility_size_beds,
    (SELECT COUNT(*) FROM Trabalha t JOIN Funcionario f ON t.IdFunc = f.IdFunc 
     WHERE t.IdHosp = h.IdHosp AND f.TipoFunc = 'enfermeiro' AND t.Ativo = TRUE) AS contagem_enfermeiros,
    (SELECT COUNT(*) FROM Trabalha t JOIN Funcionario f ON t.IdFunc = f.IdFunc 
     WHERE t.IdHosp = h.IdHosp AND f.TipoFunc = 'medico' AND t.Ativo = TRUE) AS contagem_medicos,
    (SELECT COUNT(*) FROM EpUrgencia e 
     WHERE e.IdHosp = h.IdHosp AND e.Estado IN ('aberto', 'em_triagem', 'em_atendimento')) AS pacientes_ativos
FROM Hospital h;

-- ------------------------------------------------------------
-- VIEW AUXILIAR PARA CONTEXTO DE PRESCRIÇÃO
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_contexto_prescricao AS
SELECT
    p.IdPrescricao,
    p.IdAto,
    p.CodMedicamento,
    p.Dosagem,
    p.Observacoes,
    p.DataHoraPresc,
    p.EstadoPrescricao,
    a.CodEpUrgenc,
    e.NumUtent,
    e.IdHosp,
    e.DataHoraEntr
FROM Prescreve p
JOIN Ato a ON a.IdAto = p.IdAto
JOIN EpUrgencia e ON e.CodEpUrgenc = a.CodEpUrgenc;


-- ------------------------------------------------------------
-- ÍNDICES DE PERFORMANCE
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_log_username ON log_atividade(username);
CREATE INDEX IF NOT EXISTS idx_log_criado_em ON log_atividade(criado_em);
CREATE INDEX IF NOT EXISTS idx_epurgencia_hosp_estado ON EpUrgencia(IdHosp, Estado);
CREATE INDEX IF NOT EXISTS idx_trabalha_hosp_ativo ON Trabalha(IdHosp, Ativo);
CREATE INDEX IF NOT EXISTS idx_funcionario_tipo ON Funcionario(TipoFunc);
-- ------------------------------------------------------------
-- ÍNDICES EXTRA PARA IA
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_prescreve_estado ON Prescreve(EstadoPrescricao);
CREATE INDEX IF NOT EXISTS idx_alerta_idprescricao ON Alerta(IdPrescricao);
CREATE INDEX IF NOT EXISTS idx_alerta_resolvido ON Alerta(Resolvido);
CREATE INDEX IF NOT EXISTS idx_predicao_tipo_entidade ON PredicaoIA(TipoModelo, Entidade, EntidadeId);
CREATE INDEX IF NOT EXISTS idx_predicao_criado_em ON PredicaoIA(CriadoEm);
CREATE INDEX IF NOT EXISTS idx_medicacaoativa_utente_ativa ON MedicacaoAtiva(NumUtent, DataFim);
CREATE INDEX IF NOT EXISTS idx_alergia_utente_classe ON Alergia(NumUtent, ClasseTerapeuticaID);
CREATE INDEX IF NOT EXISTS idx_ato_episode ON Ato(CodEpUrgenc);
CREATE INDEX IF NOT EXISTS idx_prescreve_ato ON Prescreve(IdAto);