begin;
Create Table Utente (
NumUtent INT Primary Key,
Sexo VARCHAR (10),
Localidade VARCHAR (100),
IdadeAtual INT
);

Create Table EpUrgencia (
CodEpUrgenc INT NOT NULL, 
NomeHosp VARCHAR (100) NOT NULL,
NumUtent INT NOT NULL, 
DataHoraEntr TIMESTAMP NOT NULL, 
DataHoraSaida TIMESTAMP, 
PRIMARY KEY (CodEpUrgenc, NomeHosp)
);

Create Table Hospital (
Nome VARCHAR (100) PRIMARY KEY,
Localizacao VARCHAR (100)
);

Create Table Ato (
CodEpUrgenc INT NOT NULL, 
NomeHosp VARCHAR (100) NOT NULL, 
DataHoraInicio TIMESTAMP NOT NULL, 
DataHoraFim TIMESTAMP, 
Tipo VARCHAR(10) NOT NULL CHECK (Tipo IN ('Exame', 'Triagem', 'Consulta')),
NumFuncPresc INT,
DataHoraPresc TIMESTAMP,
PRIMARY KEY (CodEpUrgenc,NomeHosp, DataHoraInicio)
);

Create Table Funcionario (
NumFunc INT PRIMARY KEY,
Sexo VARCHAR (10),
TipoFunc VARCHAR(10) NOT NULL CHECK (TipoFunc IN ('Enf', 'Med'))
);

Create Table Medico ( 
NumFunc INT PRIMARY KEY,
Estagiario BOOLEAN NOT NULL 
);

Create Table Enfermeiro ( 
NumFunc INT PRIMARY KEY
);

Create Table Realiza (
CodEpUrgenc INT NOT NULL, 
NomeHosp VARCHAR (100) NOT NULL, 
DataHoraInicio TIMESTAMP NOT NULL,
NumFunc INT NOT NULL,
PRIMARY KEY (CodEpUrgenc, NomeHosp, DataHoraInicio,NumFunc)
);

Alter Table EpUrgencia
Add foreign key (NomeHosp) references Hospital (Nome),
Add foreign key (NumUtent) references Utente (NumUtent);

Alter Table  Ato
Add foreign key (CodEpUrgenc, NomeHosp) references EpUrgencia (CodEpUrgenc, NomeHosp),
Add foreign key (NumFuncPresc) references Medico (NumFunc);

Alter Table  Medico
Add foreign key (NumFunc) references Funcionario (NumFunc);

Alter Table  Enfermeiro
Add foreign key (NumFunc) references Funcionario (NumFunc);

Alter Table  Realiza
Add foreign key (CodEpUrgenc, NomeHosp, DataHoraInicio) references Ato (CodEpUrgenc, NomeHosp, DataHoraInicio),
Add foreign key (NumFunc) references Funcionario (NumFunc);
commit;



CREATE TABLE Internados (
    NumUtent INT NOT NULL,
    NomeHosp VARCHAR(100) NOT NULL,
    DataInternamento TIMESTAMP NOT NULL,
    DataAlta TIMESTAMP,
    PRIMARY KEY (NumUtent, DataInternamento),
    FOREIGN KEY (NumUtent) REFERENCES Utente(NumUtent),
    FOREIGN KEY (NomeHosp) REFERENCES Hospital(Nome)
);

