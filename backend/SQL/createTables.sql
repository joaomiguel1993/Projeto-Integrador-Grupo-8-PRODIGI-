BEGIN;

-- 1. UTENTE
CREATE TABLE Utente (
    NumUtent INT PRIMARY KEY,
    Sexo VARCHAR(10),
    Localidade VARCHAR(100),
    IdadeAtual INT
);

-- 2. HOSPITAL
CREATE TABLE Hospital (
    Nome VARCHAR(100) PRIMARY KEY,
    Localizacao VARCHAR(100)
);

-- 3. EPURGENCIA (Episódios)
CREATE TABLE EpUrgencia (
    CodEpUrgenc INT NOT NULL, 
    NomeHosp VARCHAR(100) NOT NULL,
    NumUtent INT NOT NULL, 
    DataHoraEntr TIMESTAMP NOT NULL, 
    DataHoraSaida TIMESTAMP, 
    PRIMARY KEY (CodEpUrgenc, NomeHosp),
    FOREIGN KEY (NomeHosp) REFERENCES Hospital(Nome),
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent)
);

-- 4. FUNCIONARIO
CREATE TABLE Funcionario (
    NumFunc INT PRIMARY KEY,
    Sexo VARCHAR(10),
    TipoFunc VARCHAR(10) NOT NULL CHECK (TipoFunc IN ('Enf', 'Med'))
);

-- 5. MEDICO
CREATE TABLE Medico ( 
    NumFunc INT PRIMARY KEY,
    Estagiario BOOLEAN NOT NULL,
    FOREIGN KEY (NumFunc) REFERENCES Funcionario(NumFunc)
);

-- 6. ENFERMEIRO
CREATE TABLE Enfermeiro ( 
    NumFunc INT PRIMARY KEY,
    FOREIGN KEY (NumFunc) REFERENCES Funcionario(NumFunc)
);

-- 7. ATO
CREATE TABLE Ato (
    CodEpUrgenc INT NOT NULL, 
    NomeHosp VARCHAR(100) NOT NULL, 
    DataHoraInicio TIMESTAMP NOT NULL, 
    DataHoraFim TIMESTAMP, 
    Tipo VARCHAR(10) NOT NULL CHECK (Tipo IN ('Exame', 'Triagem', 'Consulta')),
    NumFuncPresc INT,
    DataHoraPresc TIMESTAMP,
    PRIMARY KEY (CodEpUrgenc, NomeHosp, DataHoraInicio),
    FOREIGN KEY (CodEpUrgenc, NomeHosp) REFERENCES EpUrgencia(CodEpUrgenc, NomeHosp),
    FOREIGN KEY (NumFuncPresc) REFERENCES Medico(NumFunc)
);

-- 8. REALIZA
CREATE TABLE Realiza (
    CodEpUrgenc INT NOT NULL, 
    NomeHosp VARCHAR(100) NOT NULL, 
    DataHoraInicio TIMESTAMP NOT NULL,
    NumFunc INT NOT NULL,
    PRIMARY KEY (CodEpUrgenc, NomeHosp, DataHoraInicio, NumFunc),
    FOREIGN KEY (CodEpUrgenc, NomeHosp, DataHoraInicio) REFERENCES Ato(CodEpUrgenc, NomeHosp, DataHoraInicio),
    FOREIGN KEY (NumFunc) REFERENCES Funcionario(NumFunc)
);

-- 9. INTERNADO
CREATE TABLE Internados (
    NumUtent INT NOT NULL,
    NomeHosp VARCHAR(100) NOT NULL,
    DataInternamento TIMESTAMP NOT NULL,
    DataAlta TIMESTAMP,
    PRIMARY KEY (NumUtent, DataInternamento),
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent),
    FOREIGN KEY (NomeHosp) REFERENCES Hospital(Nome)
);

-- 10. UTILIZADOR
CREATE TABLE Utilizador (
    Username VARCHAR(50) PRIMARY KEY,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('rececionista', 'enfermeiro', 'medico', 'administrador')),
    NumFunc INT,
    FOREIGN KEY (NumFunc) REFERENCES Funcionario(NumFunc)
);

-- 11. TRIAGEM
CREATE TABLE Triagem (
    CodEpUrgenc INT NOT NULL,
    NomeHosp VARCHAR(100) NOT NULL,
    DataHoraTriagem TIMESTAMP NOT NULL,
    Prioridade VARCHAR(10) NOT NULL CHECK (Prioridade IN ('Alta', 'Media', 'Baixa')),
    Temperatura DECIMAL(4,2),
    PressaoSistolica INT,
    PressaoDiastolica INT,
    Observacoes TEXT,
    NumFuncTriagem INT,
    PRIMARY KEY (CodEpUrgenc, NomeHosp, DataHoraTriagem),
    FOREIGN KEY (CodEpUrgenc, NomeHosp) REFERENCES EpUrgencia(CodEpUrgenc, NomeHosp),
    FOREIGN KEY (NumFuncTriagem) REFERENCES Funcionario(NumFunc)
);

-- 12. PRESCREVE
CREATE TABLE Prescreve (
    CodPrescricao SERIAL PRIMARY KEY,
    CodEpUrgenc INT NOT NULL,
    NomeHosp VARCHAR(100) NOT NULL,
    NumFuncPresc INT NOT NULL,
    DataHoraPresc TIMESTAMP NOT NULL,
    Medicamento VARCHAR(100) NOT NULL,
    Dose VARCHAR(50),
    Frequencia VARCHAR(50),
    Duracao VARCHAR(20),
    FOREIGN KEY (CodEpUrgenc, NomeHosp) REFERENCES EpUrgencia(CodEpUrgenc, NomeHosp),
    FOREIGN KEY (NumFuncPresc) REFERENCES Medico(NumFunc)
);

COMMIT;