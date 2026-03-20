begin;
INSERT INTO Funcionario (NumFunc, Sexo, TipoFunc) VALUES 
(1, 'M', 'Med'),
(2, 'F', 'Enf'),
(3, 'M', 'Med'),
(4, 'F', 'Enf'),
(5, 'M', 'Med'),
(6, 'F', 'Enf'),
(7, 'M', 'Med'),
(8, 'F', 'Enf'),
(9, 'M', 'Med'),
(10, 'F', 'Enf'),
(11, 'M', 'Med'),
(12, 'F', 'Enf'),
(13, 'M', 'Med'),
(14, 'F', 'Enf'),
(15, 'M', 'Med'),
(16, 'F', 'Enf'),
(17, 'M', 'Med'),
(18, 'F', 'Enf'),
(19, 'M', 'Med'),
(20, 'F', 'Enf'),
(21, 'M', 'Med'),
(22, 'F', 'Enf'),
(23, 'M', 'Med'),
(24, 'F', 'Enf'),
(25, 'M', 'Med'),
(26, 'F', 'Enf'),
(27, 'M', 'Med'),
(28, 'F', 'Enf'),
(29, 'M', 'Med'),
(30, 'F', 'Enf');


INSERT INTO Medico (NumFunc, Estagiario) VALUES 
(1, FALSE),
(3, FALSE),
(5, FALSE),
(7, FALSE),
(9, FALSE),
(11, TRUE),
(13, TRUE),
(15, FALSE),
(17, TRUE),
(19, FALSE),
(21, TRUE),
(23, TRUE),
(25, FALSE),
(27, TRUE),
(29, FALSE);

INSERT INTO Enfermeiro (NumFunc) 
VALUES 
(2),
(4),
(6),
(8),
(10),
(12),
(14),
(16),
(18),
(20),
(22),
(24),
(26),
(28),
(30);


INSERT INTO Hospital (Nome, Localizacao) 
VALUES 
('Hospital de Santa Maria', 'Lisboa'),
('Hospital de São João', 'Porto'),
('Hospital Curry Cabral', 'Lisboa'),
('Hospital de Braga', 'Braga'),
('Hospital de Santa Marta', 'Lisboa'),
('Hospital de Santo Espírito', 'Angra do Heroísmo'),
('Hospital Garcia de Orta', 'Almada'),
('Hospital de São José', 'Lisboa'),
('Hospital de Guimarães', 'Guimarães'),
('Hospital de Faro', 'Faro'),
('Hospital da Luz', 'Lisboa'),
('Hospital do Barreiro', 'Barreiro'),
('Hospital de Vila Real', 'Vila Real'),
('Hospital de Beja', 'Beja'),
('Hospital de Viseu', 'Viseu'),
('Hospital de Cascais', 'Cascais'),
('Hospital São João de Deus', 'Funchal'),
('Hospital Amadora-Sintra', 'Amadora'),
('Hospital de Penafiel', 'Penafiel'),
('Hospital da CUF Descobertas', 'Lisboa'),
('Hospital do Centro Hospitalar Tondela-Viseu', 'Viseu'),
('Hospital de Póvoa de Varzim', 'Póvoa de Varzim'),
('Hospital de Santo André', 'Leiria'),
('Hospital de Santa Maria Maior', 'Évora'),
('Hospital de São Sebastião', 'Santa Maria da Feira'),
('Hospital de S. João', 'Porto'),
('Hospital de São Bernardo', 'Setúbal'),
('Hospital da Senhora da Oliveira', 'Guimarães');


INSERT INTO Utente (NumUtent, Sexo, Localidade, IdadeAtual) 
VALUES 
(1001, 'M', 'Lisboa', 34),
(1002, 'F', 'Porto', 22),
(1003, 'M', 'Funchal', 45),
(1004, 'F', 'Braga', 36),
(1005, 'M', 'Lisboa', 58),
(1006, 'F', 'Coimbra', 30),
(1007, 'M', 'Funchal', 29),
(1008, 'F', 'Lisboa', 62),
(1009, 'M', 'Porto', 40),
(1010, 'F', 'Coimbra', 55),
(1011, 'M', 'Lisboa', 46),
(1012, 'F', 'Porto', 25),
(1013, 'M', 'Funchal', 34),
(1014, 'F', 'Coimbra', 39),
(1015, 'M', 'Braga', 51),
(1016, 'F', 'Porto', 28),
(1017, 'M', 'Lisboa', 61),
(1018, 'F', 'Funchal', 27),
(1019, 'M', 'Coimbra', 32),
(1020, 'F', 'Braga', 63),
(1021, 'M', 'Porto', 38),
(1022, 'F', 'Lisboa', 41),
(1023, 'M', 'Funchal', 29),
(1024, 'F', 'Coimbra', 45),
(1025, 'M', 'Braga', 49),
(1026, 'F', 'Lisboa', 31),
(1027, 'M', 'Porto', 54),
(1028, 'F', 'Funchal', 39),
(1029, 'M', 'Coimbra', 26),
(1030, 'F', 'Braga', 57);


INSERT INTO EpUrgencia (CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntr, DataHoraSaida) VALUES 
(101, 'Hospital de Santa Maria', 1001, '2024-02-01 08:30:00', '2024-02-01 09:30:00'),
(102, 'Hospital de São João', 1002, '2024-02-01 09:30:00', '2024-02-01 10:00:00'),
(103, 'Hospital Curry Cabral', 1003, '2024-02-01 10:30:00', '2024-02-01 11:00:00'),
(104, 'Hospital de Braga', 1004, '2024-02-01 11:30:00', '2024-02-01 12:00:00'),
(105, 'Hospital de Santa Marta', 1005, '2024-02-01 12:30:00', '2024-02-01 13:00:00'),
(106, 'Hospital de São João', 1006, '2024-02-01 13:30:00', '2024-02-01 14:00:00'),
(107, 'Hospital Curry Cabral', 1007, '2024-02-01 14:30:00', '2024-02-01 15:00:00'),
(108, 'Hospital de Braga', 1008, '2024-02-01 15:30:00', '2024-02-01 16:00:00'),
(109, 'Hospital de Santa Marta', 1009, '2024-02-01 16:30:00', '2024-02-01 17:00:00'),
(110, 'Hospital de São João', 1010, '2024-02-01 17:30:00', '2024-02-01 18:00:00'),
(111, 'Hospital de Santa Maria', 1008, '2025-04-01 02:30:00','2025-04-01 05:30:00'),
(112, 'Hospital de Santa Maria', 1017, '2025-04-02 17:30:00','2025-04-01 18:30:00'),
(113, 'Hospital Curry Cabral', 1008, '2025-04-02 18:00:00','2025-04-01 19:00:00');


INSERT INTO Ato (CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim, Tipo, NumFuncPresc, DataHoraPresc) VALUES 
(101, 'Hospital de Santa Maria', '2024-02-01 08:30:00', '2024-02-01 09:00:00', 'Exame', 1, '2024-02-01 08:30:00'),
(102, 'Hospital de São João', '2024-02-01 09:30:00', '2024-02-01 10:00:00', 'Exame', 1, '2024-02-01 09:30:00'),
(103, 'Hospital Curry Cabral', '2024-02-01 10:30:00', '2024-02-01 11:00:00', 'Exame', 1, '2024-02-01 10:30:00'),
(104, 'Hospital de Braga', '2024-02-01 11:30:00', '2024-02-01 12:00:00', 'Exame', 1, '2024-02-01 11:30:00'),
(105, 'Hospital de Santa Marta', '2024-02-01 12:30:00', '2024-02-01 13:00:00', 'Exame', 1, '2024-02-01 12:30:00'),
(106, 'Hospital de São João', '2024-02-01 13:30:00', '2024-02-01 14:00:00', 'Exame', 1, '2024-02-01 13:30:00'),
(107, 'Hospital Curry Cabral', '2024-02-01 14:30:00', '2024-02-01 15:00:00', 'Triagem', 7, '2024-02-01 14:30:00'),
(108, 'Hospital de Braga', '2024-02-01 15:30:00', '2024-02-01 16:00:00', 'Exame', 1, '2024-02-01 15:30:00'),
(109, 'Hospital de Santa Marta', '2024-02-01 16:30:00', '2024-02-01 17:00:00', 'Exame', 1, '2024-02-01 16:30:00'),
(110, 'Hospital de São João', '2024-02-01 17:30:00', '2024-02-01 18:00:00', 'Exame', 1, '2024-02-01 17:30:00'),
(110, 'Hospital de São João', '2024-02-02 09:30:00', '2024-02-02 10:00:00', 'Exame', 1, '2024-02-02 09:30:00'),
(107, 'Hospital Curry Cabral', '2024-02-02 10:30:00', '2024-02-02 11:00:00', 'Exame', 1, '2024-02-02 10:30:00'),
(111, 'Hospital de Santa Maria', '2025-04-01 02:30:00', '2025-04-01 03:00:00', 'Triagem', 1, '2025-04-01 02:30:00'),
(111, 'Hospital de Santa Maria', '2025-04-01 03:30:00', '2025-04-01 03:50:00', 'Exame', 1, '2025-04-01 03:30:00'),
(111, 'Hospital de Santa Maria', '2025-04-01 04:10:00', '2025-04-01 04:20:00','Consulta', 1, '2025-04-01 04:10:00'),
(112, 'Hospital de Santa Maria', '2025-04-02 17:00:00', '2025-04-02 17:10:00', 'Consulta', 29, '2025-04-02 17:00:00'),
(113, 'Hospital Curry Cabral', '2025-04-02 18:00:00', '2025-04-02 18:05:00', 'Exame', 7, '2025-04-02 18:00:00');


INSERT INTO Realiza (CodEpUrgenc, NomeHosp, DataHoraInicio, NumFunc) 
VALUES 
(101, 'Hospital de Santa Maria', '2024-02-01 08:30:00', 1),
(102, 'Hospital de São João', '2024-02-01 09:30:00', 2),
(103, 'Hospital Curry Cabral', '2024-02-01 10:30:00', 3),
(104, 'Hospital de Braga', '2024-02-01 11:30:00', 4),
(105, 'Hospital de Santa Marta', '2024-02-01 12:30:00', 5),
(106, 'Hospital de São João', '2024-02-01 13:30:00', 6),
(107, 'Hospital Curry Cabral', '2024-02-01 14:30:00', 7),
(108, 'Hospital de Braga', '2024-02-01 15:30:00', 8),
(109, 'Hospital de Santa Marta', '2024-02-01 16:30:00', 9),
(110, 'Hospital de São João', '2024-02-01 17:30:00', 10),
(111, 'Hospital de Santa Maria', '2025-04-01 02:30:00', 26),
(111, 'Hospital de Santa Maria', '2025-04-01 03:30:00', 3), 
(111, 'Hospital de Santa Maria', '2025-04-01 04:10:00', 1),
(112, 'Hospital de Santa Maria', '2025-04-02 17:00:00', 29),
(113, 'Hospital Curry Cabral', '2025-04-02 18:00:00', 26);
commit;

SELECT * FROM funcionario;
SELECT * FROM Hospital;
SELECT * FROM Utente;
SELECT * FROM Ato;
SELECT * FROM EpUrgencia;
SELECT * FROM Medico;
SELECT * FROM Realiza;
SELECT * FROM Enfermeiro;




