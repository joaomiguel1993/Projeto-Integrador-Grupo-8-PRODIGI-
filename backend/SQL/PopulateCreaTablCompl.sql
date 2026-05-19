-- ============================================================
-- PRODIGI — populate.sql
-- ORDEM CORRETA DE POPULAÇÃO
-- ============================================================

BEGIN;

TRUNCATE TABLE
    HistoricoInternamento,
    Internamento,
    PredicaoIA,
    Alerta,
    Prescreve,
    Realiza,
    Ato,
    ReavaliacaoTriagem,
    Triagem,
    EpUrgencia,
    MedicacaoAtiva,
    Alergia,
    UtenteAntecedente,
    Antecedente,
    Medicamento,
    Utilizador,
    Enfermeiro,
    Medico,
    Trabalha,
    Funcionario,
    Utente,
    Hospital
RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. HOSPITAL
-- ============================================================

INSERT INTO Hospital (Nome, Localizacao, Email, Telefone, TotalCamas) VALUES
('Hospital de São José', 'Rua José António Serrano, 1150-199 Lisboa', 'geral@hsj.min-saude.pt', '213 124 300', 500),
('Hospital de Santa Maria', 'Av. Prof. Egas Moniz, 1649-035 Lisboa', 'geral@hsm.min-saude.pt', '217 805 000', 975),
('Hospital de Santo António', 'Largo do Prof. Abel Salazar, 4099-001 Porto', 'geral@hsa.min-saude.pt', '222 077 500', 700),
('Hospital de São João', 'Alameda Prof. Hernâni Monteiro, 4200-319 Porto', 'geral@chsj.min-saude.pt', '225 512 100', 1050),
('Hospital Garcia de Orta', 'Av. Torrado da Silva, 2805-267 Almada', 'geral@hgo.min-saude.pt', '212 940 294', 450),
('Hospital Prof. Doutor Fernando Fonseca', 'IC19, 2720-276 Amadora', 'geral@hff.min-saude.pt', '214 348 200', 600),
('Hospital de Braga', 'Sete Fontes - São Victor, 4710-243 Braga', 'geral@hb.min-saude.pt', '253 027 000', 705),
('Hospital Pediátrico de Coimbra', 'Av. Afonso Romão, 3000-602 Coimbra', 'pediatria@chuc.min-saude.pt', '239 480 300', 150),
('Hospital de Faro', 'Rua Leão Penedo, 8000-386 Faro', 'geral@chalgarve.min-saude.pt', '289 891 100', 400),
('Hospital Nélio Mendonça', 'Avenida Luís de Camões, 9000-177 Funchal', 'geral@sesaram.pt', '291 705 600', 350);

-- ============================================================
-- 2. FUNCIONARIO
-- ============================================================

INSERT INTO Funcionario (Nome, TipoFunc, Sexo, Email, Telefone, Biografia, Foto_url) VALUES
('Carlos Mendes', 'admin', 'M', 'carlos.mendes@hospital.pt', '912345671', 'Administrador com 10 anos de experiência.', NULL),
('Teresa Silva', 'admin', 'F', 'teresa.silva@hospital.pt', '912345672', 'Especialista em gestão hospitalar.', NULL),
('Ana Gomes', 'rececionista', 'F', 'ana.gomes@hospital.pt', '912345673', 'Atendimento geral.', NULL),
('Bruno Almeida', 'rececionista', 'M', 'bruno.almeida@hospital.pt', '912345674', 'Atendimento das urgências.', NULL),
('Catarina Pinto', 'rececionista', 'F', 'catarina.pinto@hospital.pt', '912345675', 'Apoio ao cliente.', NULL),
('Daniel Sousa', 'rececionista', 'M', 'daniel.sousa@hospital.pt', '912345676', 'Registo de utentes.', NULL),
('Elsa Martins', 'rececionista', 'F', 'elsa.martins@hospital.pt', '912345677', 'Agendamento de consultas.', NULL),
('Filipe Ribeiro', 'medico', 'M', 'filipe.ribeiro@hospital.pt', '912345678', 'Cardiologista principal.', NULL),
('Gabriela Torres', 'medico', 'F', 'gabriela.torres@hospital.pt', '912345679', 'Pediatra chefe.', NULL),
('Hugo Castro', 'medico', 'M', 'hugo.castro@hospital.pt', '912345680', 'Cirurgião geral.', NULL),
('Inês Mota', 'medico', 'F', 'ines.mota@hospital.pt', '912345681', 'Neurologista.', NULL),
('João Neves', 'medico', 'M', 'joao.neves@hospital.pt', '912345682', 'Médico de clínica geral.', NULL),
('Lara Teixeira', 'medico', 'F', 'lara.teixeira@hospital.pt', '912345683', 'Ortopedista.', NULL),
('Miguel Ferreira', 'medico', 'M', 'miguel.ferreira@hospital.pt', '912345684', 'Oncologista.', NULL),
('Nádia Rocha', 'medico', 'F', 'nadia.rocha@hospital.pt', '912345685', 'Dermatologista.', NULL),
('Óscar Mendes', 'medico', 'M', 'oscar.mendes@hospital.pt', '912345686', 'Psiquiatra.', NULL),
('Patrícia Carvalho', 'medico', 'F', 'patricia.carvalho@hospital.pt', '912345687', 'Oftalmologista.', NULL),
('Ricardo Leal', 'enfermeiro', 'M', 'ricardo.leal@hospital.pt', '912345688', 'Enfermeiro de urgências.', NULL),
('Sara Lima', 'enfermeiro', 'F', 'sara.lima@hospital.pt', '912345689', 'Enfermeira chefe da pediatria.', NULL),
('Tiago Fernandes', 'enfermeiro', 'M', 'tiago.fernandes@hospital.pt', '912345690', 'Enfermeiro bloco operatório.', NULL),
('Ursula Costa', 'enfermeiro', 'F', 'ursula.costa@hospital.pt', '912345691', 'Enfermeira de cuidados intensivos.', NULL),
('Vasco Pires', 'enfermeiro', 'M', 'vasco.pires@hospital.pt', '912345692', 'Enfermeiro reabilitação.', NULL),
('Xénia Moreira', 'enfermeiro', 'F', 'xenia.moreira@hospital.pt', '912345693', 'Enfermeira triagem.', NULL),
('Zacarias Lopes', 'enfermeiro', 'M', 'zacarias.lopes@hospital.pt', '912345694', 'Enfermeiro de saúde mental.', NULL),
('Alice Reis', 'enfermeiro', 'F', 'alice.reis@hospital.pt', '912345695', 'Enfermeira geriátrica.', NULL),
('Bruno Dias', 'enfermeiro', 'M', 'bruno.dias@hospital.pt', '912345696', 'Enfermeiro estagiário.', NULL),
('Carla Mendes', 'enfermeiro', 'F', 'carla.mendes@hospital.pt', '912345697', 'Enfermeira de oncologia.', NULL);


-- ============================================================
-- 3. TRABALHA
-- ============================================================

INSERT INTO Trabalha (IdFunc, IdHosp, Ativo) VALUES
(1, 1, TRUE),
(2, 2, TRUE),

(3, 1, TRUE),
(4, 2, TRUE),
(5, 3, TRUE),
(6, 4, TRUE),
(7, 5, TRUE),

(8, 1, TRUE),
(9, 2, TRUE),
(10, 3, TRUE),
(11, 4, TRUE),
(12, 5, TRUE),
(13, 6, TRUE),
(14, 7, TRUE),
(15, 8, TRUE),
(16, 9, TRUE),
(17, 10, TRUE),

(18, 1, TRUE),
(19, 2, TRUE),
(20, 3, TRUE),
(21, 4, TRUE),
(22, 5, TRUE),
(23, 6, TRUE),
(24, 7, TRUE),
(25, 8, TRUE),
(26, 9, TRUE),
(27, 10, TRUE);

-- ============================================================
-- 4. MEDICO
-- ============================================================

INSERT INTO Medico (IdFunc, Estagiario, Especialidade) VALUES
(8, FALSE, 'Cardiologia'),
(9, FALSE, 'Pediatria'),
(10, FALSE, 'Cirurgia Geral'),
(11, FALSE, 'Neurologia'),
(12, TRUE, 'Medicina Geral'),
(13, FALSE, 'Ortopedia'),
(14, FALSE, 'Oncologia'),
(15, TRUE, 'Dermatologia'),
(16, FALSE, 'Psiquiatria'),
(17, FALSE, 'Oftalmologia');


-- =========================================================
-- ENFERMEIROS (40)
-- =========================================================
INSERT INTO Enfermeiro (IdFunc) VALUES
(18),
(19),
(20),
(21),
(22),
(23),
(24),
(25),
(26),
(27);



-- ============================================================
-- 6. UTILIZADOR
-- ============================================================

INSERT INTO Utilizador (IdFunc, UserName, Password, bloqueado, role) VALUES
(1, 'admin', '$2b$12$7M8xP7q3M2eQkYw5L8Jk0eJvA3xG2qPzWmF8hN4sR1uC9yT6dBvGa', FALSE, 'admin'),
(2, 'rececao', '$2b$12$4N6rT2k8Q1mLp9Yw3DgH5uVxC7zBaE2nJfR6sPwKdT8hYmU1cXeSa', FALSE, 'rececionista'),
(3, 'medico', '$2b$12$9Q3mX7pL2vNc8Kz5RwTg1eFdJ4sHaB6uYqP0nMrC7xVtL2kDsWeYb', FALSE, 'medico'),
(4, 'enfermeiro', '$2b$12$2H8kV5qT1mZp7Xc4NrYw9uGsD3fLaE6bJrP0tMnC8xQvK5dSwYeUa', FALSE, 'enfermeiro');


-- ============================================================
-- 7. UTENTE
-- ============================================================


INSERT INTO Utente (NIF, Nome, DataNasc, Sexo, Localidade, Telefone, Email) VALUES
('100000001', 'André Silva', '1985-02-14', 'M', 'Lisboa', '912000001', 'andre.silva@example.com'),
('100000002', 'Beatriz Costa', '1991-06-23', 'F', 'Porto', '912000002', 'beatriz.costa@example.com'),
('100000003', 'Carlos Mendes', '1978-11-08', 'M', 'Amadora', '912000003', 'carlos.mendes@example.com'),
('100000004', 'Daniela Rocha', '2000-03-17', 'F', 'Sintra', '912000004', 'daniela.rocha@example.com'),
('100000005', 'Eduardo Ferreira', '1969-09-30', 'M', 'Oeiras', '912000005', 'eduardo.ferreira@example.com'),
('100000006', 'Filipa Gomes', '1995-01-12', 'F', 'Cascais', '912000006', 'filipa.gomes@example.com'),
('100000007', 'Gonçalo Pereira', '1988-07-05', 'M', 'Loures', '912000007', 'goncalo.pereira@example.com'),
('100000008', 'Helena Martins', '1975-12-19', 'F', 'Mafra', '912000008', 'helena.martins@example.com'),
('100000009', 'Inês Almeida', '1999-04-28', 'F', 'Lisboa', '912000009', 'ines.almeida@example.com'),
('100000010', 'João Pires', '1983-10-10', 'M', 'Porto', '912000010', 'joao.pires@example.com'),
('100000011', 'Kevin Sousa', '1992-08-16', 'M', 'Braga', '912000011', 'kevin.sousa@example.com'),
('100000012', 'Lara Teixeira', '1987-05-21', 'F', 'Coimbra', '912000012', 'lara.teixeira@example.com'),
('100000013', 'Miguel Santos', '1970-02-02', 'M', 'Setúbal', '912000013', 'miguel.santos@example.com'),
('100000014', 'Nádia Ramos', '1996-09-14', 'F', 'Faro', '912000014', 'nadia.ramos@example.com'),
('100000015', 'Óscar Nunes', '1981-01-25', 'M', 'Vila Nova de Gaia', '912000015', 'oscar.nunes@example.com'),
('100000016', 'Patrícia Lopes', '1993-11-11', 'F', 'Leiria', '912000016', 'patricia.lopes@example.com'),
('100000017', 'Ricardo Dias', '1979-04-03', 'M', 'Aveiro', '912000017', 'ricardo.dias@example.com'),
('100000018', 'Sofia Cardoso', '2001-06-06', 'F', 'Évora', '912000018', 'sofia.cardoso@example.com'),
('100000019', 'Tiago Fernandes', '1984-12-27', 'M', 'Bragança', '912000019', 'tiago.fernandes@example.com'),
('100000020', 'Vanessa Correia', '1990-03-09', 'F', 'Guimarães', '912000020', 'vanessa.correia@example.com'),
('100000021', 'Alexandre Pinto', '1973-07-18', 'M', 'Lisboa', '912000021', 'alexandre.pinto@example.com'),
('100000022', 'Bruna Azevedo', '1998-10-30', 'F', 'Porto', '912000022', 'bruna.azevedo@example.com'),
('100000023', 'Diogo Matos', '1986-02-11', 'M', 'Amadora', '912000023', 'diogo.matos@example.com'),
('100000024', 'Eva Ribeiro', '1977-09-22', 'F', 'Sintra', '912000024', 'eva.ribeiro@example.com'),
('100000025', 'Fábio Carvalho', '1994-05-15', 'M', 'Odivelas', '912000025', 'fabio.carvalho@example.com'),
('100000026', 'Gisela Moreira', '1989-08-08', 'F', 'Cascais', '912000026', 'gisela.moreira@example.com'),
('100000027', 'Hugo Martins', '1968-12-01', 'M', 'Loures', '912000027', 'hugo.martins@example.com'),
('100000028', 'Iara Pinto', '2002-04-19', 'F', 'Mafra', '912000028', 'iara.pinto@example.com'),
('100000029', 'Jorge Silva', '1976-11-29', 'M', 'Lisboa', '912000029', 'jorge.silva@example.com'),
('100000030', 'Kátia Lopes', '1997-01-07', 'F', 'Porto', '912000030', 'katia.lopes@example.com'),
('100000031', 'Leonor Martins', '1982-06-13', 'F', 'Braga', '912000031', 'leonor.martins@example.com'),
('100000032', 'Marco Sousa', '1991-03-24', 'M', 'Coimbra', '912000032', 'marco.sousa@example.com'),
('100000033', 'Natália Fernandes', '1974-10-05', 'F', 'Setúbal', '912000033', 'natalia.fernandes@example.com'),
('100000034', 'Otávio Ribeiro', '1988-07-26', 'M', 'Faro', '912000034', 'otavio.ribeiro@example.com'),
('100000035', 'Paula Mendes', '1995-12-18', 'F', 'Viseu', '912000035', 'paula.mendes@example.com'),
('100000036', 'Quim Rocha', '1980-09-02', 'M', 'Leiria', '912000036', 'quim.rocha@example.com'),
('100000037', 'Rita Costa', '1999-05-27', 'F', 'Aveiro', '912000037', 'rita.costa@example.com'),
('100000038', 'Sérgio Nunes', '1971-01-20', 'M', 'Évora', '912000038', 'sergio.nunes@example.com'),
('100000039', 'Teresa Dias', '1987-11-16', 'F', 'Guarda', '912000039', 'teresa.dias@example.com'),
('100000040', 'Ugo Almeida', '1993-04-09', 'M', 'Castelo Branco', '912000040', 'ugo.almeida@example.com'),
('100000041', 'Vera Gomes', '1967-08-25', 'F', 'Lisboa', '912000041', 'vera.gomes@example.com'),
('100000042', 'William Pereira', '1985-02-03', 'M', 'Porto', '912000042', 'william.pereira@example.com'),
('100000043', 'Xénia Ramos', '2000-10-12', 'F', 'Amadora', '912000043', 'xenia.ramos@example.com'),
('100000044', 'Yuri Costa', '1978-06-30', 'M', 'Sintra', '912000044', 'yuri.costa@example.com'),
('100000045', 'Zélia Santos', '1992-09-18', 'F', 'Oeiras', '912000045', 'zelia.santos@example.com'),
('100000046', 'Afonso Neves', '1983-12-06', 'M', 'Cascais', '912000046', 'afonso.neves@example.com'),
('100000047', 'Bárbara Lima', '1996-01-21', 'F', 'Loures', '912000047', 'barbara.lima@example.com'),
('100000048', 'Caio Pereira', '1975-03-14', 'M', 'Mafra', '912000048', 'caio.pereira@example.com'),
('100000049', 'Diana Freitas', '2001-07-23', 'F', 'Lisboa', '912000049', 'diana.freitas@example.com'),
('100000050', 'Ernesto Martins', '1989-11-02', 'M', 'Porto', '912000050', 'ernesto.martins@example.com');

-- ============================================================
-- 8. ANTECEDENTE
-- ============================================================

INSERT INTO Antecedente (Nome, Tipo) VALUES
('Hipertensão arterial', 'Cardiovascular'),
('Diabetes mellitus tipo 1', 'Endócrino'),
('Diabetes mellitus tipo 2', 'Endócrino'),
('Asma', 'Respiratório'),
('Doença pulmonar obstrutiva crónica', 'Respiratório'),
('Insuficiência cardíaca', 'Cardiovascular'),
('Enfarte agudo do miocárdio prévio', 'Cardiovascular'),
('AVC prévio', 'Neurológico'),
('Epilepsia', 'Neurológico'),
('Doença renal crónica', 'Renal'),
('Insuficiência hepática', 'Hepático'),
('Hipotiroidismo', 'Endócrino'),
('Hipertiroidismo', 'Endócrino'),
('Obesidade', 'Metabólico'),
('Dislipidemia', 'Metabólico'),
('Depressão', 'Psiquiátrico'),
('Ansiedade generalizada', 'Psiquiátrico'),
('Esquizofrenia', 'Psiquiátrico'),
('Doença bipolar', 'Psiquiátrico'),
('Alzheimer', 'Neurológico'),
('Parkinson', 'Neurológico'),
('Artrite reumatoide', 'Reumatológico'),
('Lúpus eritematoso sistémico', 'Autoimune'),
('Fibromialgia', 'Reumatológico'),
('Osteoporose', 'Ortopédico'),
('Cancro da mama', 'Oncológico'),
('Cancro do pulmão', 'Oncológico'),
('Cancro colorretal', 'Oncológico'),
('Leucemia', 'Oncológico'),
('HIV', 'Infecioso'),
('Hepatite B', 'Infecioso'),
('Hepatite C', 'Infecioso'),
('Tuberculose', 'Infecioso'),
('Apneia do sono', 'Respiratório'),
('Doença coronária', 'Cardiovascular'),
('Arritmia cardíaca', 'Cardiovascular'),
('Fibrilhação auricular', 'Cardiovascular'),
('Doença celíaca', 'Gastroenterológico'),
('Doença de Crohn', 'Gastroenterológico'),
('Colite ulcerosa', 'Gastroenterológico'),
('Gastrite crónica', 'Gastroenterológico'),
('Úlcera gástrica', 'Gastroenterológico'),
('Enxaqueca crónica', 'Neurológico'),
('Glaucoma', 'Oftalmológico'),
('Cataratas', 'Oftalmológico'),
('Surdez parcial', 'Otorrinolaringológico'),
('Anemia crónica', 'Hematológico'),
('Trombose venosa profunda', 'Vascular'),
('Embolia pulmonar prévia', 'Vascular'),
('Tabagismo', 'Comportamental'),
('Alcoolismo', 'Comportamental');


-- ============================================================
-- 9. UTENTEANTECEDENTE
-- ============================================================

INSERT INTO UtenteAntecedente (NIF, CodAntecedente, DataRegisto)
VALUES
('100000001', 1, CURRENT_DATE),
('100000001', 4, CURRENT_DATE),
('100000002', 2, CURRENT_DATE),
('100000002', 5, CURRENT_DATE),
('100000003', 3, CURRENT_DATE),
('100000004', 6, CURRENT_DATE),
('100000005', 7, CURRENT_DATE),
('100000006', 8, CURRENT_DATE),
('100000007', 9, CURRENT_DATE),
('100000008', 10, CURRENT_DATE),
('100000009', 11, CURRENT_DATE),
('100000010', 12, CURRENT_DATE),
('100000011', 13, CURRENT_DATE),
('100000012', 14, CURRENT_DATE),
('100000013', 15, CURRENT_DATE),
('100000014', 16, CURRENT_DATE),
('100000015', 17, CURRENT_DATE),
('100000016', 18, CURRENT_DATE),
('100000017', 19, CURRENT_DATE),
('100000018', 20, CURRENT_DATE),
('100000019', 21, CURRENT_DATE),
('100000020', 22, CURRENT_DATE),
('100000021', 23, CURRENT_DATE),
('100000022', 24, CURRENT_DATE),
('100000023', 25, CURRENT_DATE),
('100000024', 26, CURRENT_DATE),
('100000025', 27, CURRENT_DATE),
('100000026', 28, CURRENT_DATE),
('100000027', 29, CURRENT_DATE),
('100000028', 30, CURRENT_DATE);

-- ============================================================
-- 10. MEDICAMENTO
-- ============================================================

INSERT INTO Medicamento (Nome, PrincipioAtivo, ClasseTerapeutica) VALUES
('Paracetamol 500 mg', 'Paracetamol', 'analgesico'),
('Ibuprofeno 400 mg', 'Ibuprofeno', 'anti_inflamatorio'),
('Amoxicilina 500 mg', 'Amoxicilina', 'antibiotico'),
('Azitromicina 500 mg', 'Azitromicina', 'antibiotico'),
('Oseltamivir 75 mg', 'Oseltamivir', 'antiviral'),
('Fluconazol 150 mg', 'Fluconazol', 'antifungico'),
('Loratadina 10 mg', 'Loratadina', 'anti_histaminico'),
('Prednisolona 20 mg', 'Prednisolona', 'corticosteroide'),
('Tramadol 50 mg', 'Tramadol', 'opioide'),
('Diazepam 5 mg', 'Diazepam', 'ansiolitico'),
('Sertralina 50 mg', 'Sertralina', 'antidepressivo'),
('Risperidona 2 mg', 'Risperidona', 'antipsicotico'),
('Carbamazepina 200 mg', 'Carbamazepina', 'antiepileptico'),
('Amlodipina 5 mg', 'Amlodipina', 'anti_hipertensor'),
('Bisoprolol 2.5 mg', 'Bisoprolol', 'beta_bloqueador'),
('Varfarina 5 mg', 'Varfarina', 'anticoagulante'),
('Ácido Acetilsalicílico 100 mg', 'Ácido Acetilsalicílico', 'antiagregante'),
('Metformina 850 mg', 'Metformina', 'antidiabetico'),
('Insulina Glargina', 'Insulina Glargina', 'insulina'),
('Salbutamol 100 mcg', 'Salbutamol', 'broncodilatador'),
('Omeprazol 20 mg', 'Omeprazol', 'antiacido'),
('Furosemida 40 mg', 'Furosemida', 'diuretico'),
('Ciclobenzaprina 10 mg', 'Ciclobenzaprina', 'relaxante_muscular'),
('Azatioprina 50 mg', 'Azatioprina', 'imunossupressor'),
('Vacina gripe', 'Vírus inativado da gripe', 'vacina'),
('Midazolam 15 mg', 'Midazolam', 'sedativo'),
('Propofol 200 mg', 'Propofol', 'anestesico'),
('Iopamiro 300', 'Iopamidol', 'contraste_radiologico'),
('Cetirizina 10 mg', 'Cetirizina', 'anti_histaminico'),
('Diclofenac 50 mg', 'Diclofenac', 'anti_inflamatorio'),
('Naproxeno 500 mg', 'Naproxeno', 'anti_inflamatorio'),
('Clindamicina 300 mg', 'Clindamicina', 'antibiotico'),
('Metronidazol 500 mg', 'Metronidazol', 'antibiotico'),
('Aciclovir 200 mg', 'Aciclovir', 'antiviral'),
('Ketoconazol 200 mg', 'Ketoconazol', 'antifungico'),
('Hidrocortisona 100 mg', 'Hidrocortisona', 'corticosteroide'),
('Morfina 10 mg', 'Morfina', 'opioide'),
('Alprazolam 0.5 mg', 'Alprazolam', 'ansiolitico'),
('Escitalopram 10 mg', 'Escitalopram', 'antidepressivo'),
('Olanzapina 5 mg', 'Olanzapina', 'antipsicotico'),
('Ácido Valproico 500 mg', 'Ácido Valproico', 'antiepileptico'),
('Losartan 50 mg', 'Losartan', 'anti_hipertensor'),
('Carvedilol 6.25 mg', 'Carvedilol', 'beta_bloqueador'),
('Heparina 5000 UI', 'Heparina', 'anticoagulante'),
('Clopidogrel 75 mg', 'Clopidogrel', 'antiagregante'),
('Gliclazida 30 mg', 'Gliclazida', 'antidiabetico'),
('Insulina Aspart', 'Insulina Aspart', 'insulina'),
('Budesonida 200 mcg', 'Budesonida', 'broncodilatador'),
('Pantoprazol 40 mg', 'Pantoprazol', 'antiacido'),
('Hidroclorotiazida 25 mg', 'Hidroclorotiazida', 'diuretico'),
('Baclofeno 10 mg', 'Baclofeno', 'relaxante_muscular');

-- ============================================================
-- 11. ALERGIA
-- ============================================================

INSERT INTO MedicacaoAtiva (NIF, CodMedicamento, DataInicio, DataFim, Dosagem) VALUES
('100000001', 1, '2026-01-10', NULL, '500 mg 8/8h'),
('100000002', 2, '2026-02-01', NULL, '400 mg 12/12h'),
('100000003', 3, '2026-03-15', NULL, '500 mg 8/8h'),
('100000004', 4, '2026-04-02', NULL, '500 mg 12/12h'),
('100000005', 5, '2026-04-20', NULL, '75 mg 24/24h'),
('100000006', 6, '2026-01-28', NULL, '150 mg dose única'),
('100000007', 7, '2026-02-12', NULL, '10 mg 24/24h'),
('100000008', 8, '2026-03-05', NULL, '20 mg/dia'),
('100000009', 9, '2026-04-10', NULL, '50 mg SOS'),
('100000010', 10, '2026-04-18', NULL, '5 mg 24/24h');


-- ============================================================
-- 12. MEDICACAO ATIVA
-- ============================================================

INSERT INTO MedicacaoAtiva (
    NIF,
    CodMedicamento,
    DataInicio,
    DataFim,
    Dosagem
)
VALUES
('100000001', 1, '2026-01-10', NULL, '500 mg 8/8h'),
('100000002', 2, '2026-02-01', NULL, '400 mg 12/12h'),
('100000003', 3, '2026-03-15', NULL, '500 mg 8/8h'),
('100000004', 4, '2026-04-02', NULL, '500 mg 12/12h'),
('100000005', 5, '2026-04-20', NULL, '75 mg 24/24h'),
('100000006', 6, '2026-01-28', NULL, '150 mg dose única'),
('100000007', 7, '2026-02-12', NULL, '10 mg 24/24h'),
('100000008', 8, '2026-03-05', NULL, '20 mg/dia'),
('100000009', 9, '2026-04-10', NULL, '50 mg SOS'),
('100000010', 10, '2026-04-18', NULL, '5 mg 24/24h');

-- ============================================================
-- 13. EPISODIOS
-- ============================================================

INSERT INTO EpUrgencia (
    NIF,
    IdHosp,
    DataHoraEntr,
    DataHoraAtendimento,
    DataHoraSaida,
    Estado,
    PrioridadeAtual,
    TempoEsperaAtual,
    EmObservacao,
    DestinoFinal
) VALUES
('100000001', 1, '2026-05-17 08:25:00', '2026-05-17 08:50:00', '2026-05-17 10:10:00', 'terminado', 'amarelo', 25, FALSE, 'alta domiciliária'),
('100000002', 2, '2026-05-17 09:05:00', '2026-05-17 09:25:00', NULL, 'em_atendimento', 'laranja', 18, TRUE, 'internamento'),
('100000003', 3, '2026-05-17 09:40:00', NULL, NULL, 'em_triagem', 'verde', 12, FALSE, NULL),
('100000004', 4, '2026-05-17 10:15:00', '2026-05-17 10:40:00', '2026-05-17 11:00:00', 'terminado', 'azul', 8, FALSE, 'alta domiciliária'),
('100000005', 5, '2026-05-17 10:55:00', NULL, NULL, 'aberto', 'amarelo', 30, FALSE, NULL),
('100000006', 6, '2026-05-17 11:20:00', '2026-05-17 11:45:00', '2026-05-17 13:05:00', 'terminado', 'laranja', 22, TRUE, 'observação'),
('100000007', 7, '2026-05-17 11:45:00', '2026-05-17 12:00:00', NULL, 'em_atendimento', 'vermelho', 5, TRUE, 'internamento'),
('100000008', 8, '2026-05-17 12:10:00', '2026-05-17 12:30:00', '2026-05-17 12:55:00', 'terminado', 'verde', 40, FALSE, 'alta domiciliária'),
('100000009', 9, '2026-05-17 12:35:00', NULL, NULL, 'em_triagem', 'amarelo', 14, FALSE, NULL),
('100000010', 10, '2026-05-17 13:00:00', '2026-05-17 13:20:00', '2026-05-17 14:20:00', 'terminado', 'laranja', 17, TRUE, 'transferência'),
('100000011', 1, '2026-05-17 13:25:00', NULL, NULL, 'aberto', 'verde', 9, FALSE, NULL),
('100000012', 2, '2026-05-17 13:50:00', '2026-05-17 14:10:00', '2026-05-17 15:10:00', 'terminado', 'azul', 6, FALSE, 'alta domiciliária'),
('100000013', 3, '2026-05-17 14:10:00', '2026-05-17 14:25:00', NULL, 'em_atendimento', 'amarelo', 20, TRUE, 'observação'),
('100000014', 4, '2026-05-17 14:35:00', NULL, NULL, 'em_triagem', 'laranja', 27, FALSE, NULL),
('100000015', 5, '2026-05-17 15:00:00', '2026-05-17 15:25:00', '2026-05-17 16:30:00', 'terminado', 'vermelho', 4, TRUE, 'internamento'),
('100000016', 6, '2026-05-17 15:20:00', NULL, NULL, 'aberto', 'amarelo', 16, FALSE, NULL),
('100000017', 7, '2026-05-17 15:45:00', '2026-05-17 16:05:00', '2026-05-17 17:15:00', 'terminado', 'verde', 21, FALSE, 'alta domiciliária'),
('100000018', 8, '2026-05-17 16:05:00', '2026-05-17 16:25:00', NULL, 'em_atendimento', 'laranja', 19, TRUE, 'observação'),
('100000019', 9, '2026-05-17 16:30:00', '2026-05-17 16:45:00', '2026-05-17 17:40:00', 'terminado', 'amarelo', 11, FALSE, 'transferência'),
('100000020', 10, '2026-05-17 16:55:00', NULL, NULL, 'aberto', 'verde', 28, FALSE, NULL);


-- ============================================================
-- 14. TRIAGEM
-- ============================================================

INSERT INTO Triagem (
    CodEpUrgenc, DataHoraInicio, DataHoraFim, CorTriagem, QueixaPrincipal, ViaAerea,
    RespiracaoCirculacao, Hemorragia, Consciencia, EstadoPele, Mobilidade, TipoDor,
    DorLocalizacao, Sintomas, ObservacoesClinicas, TempoInicioSintomas, EscalaGlasgow,
    Isolamento, Gravida, Temperatura, FreqCard, FreqResp, SpO2, Sistolica, Diastolica,
    NivelDor, TempoEsperaPrevisto, IdFunc
) VALUES
(1, '2026-05-17 08:30:00', '2026-05-17 08:45:00', 'amarelo', 'febre', 'permeavel', 'normal', 'nenhuma', 'alerta', 'normal', 'independente', 'continua', 'peito', 'febre e mal-estar geral', 'sem sinais de gravidade', '6 horas', 15, FALSE, FALSE, 38.2, 92, 18, 97.0, 120, 80, 4, 45, 3),
(2, '2026-05-17 09:10:00', '2026-05-17 09:20:00', 'laranja', 'dor_toracica', 'permeavel', 'normal', 'nenhuma', 'alerta', 'palida', 'independente', 'pressao', 'torax', 'dor torácica com irradiação para o braço', 'suspeita de origem cardíaca', '1 hora', 14, FALSE, FALSE, 37.4, 110, 22, 95.0, 140, 90, 7, 20, 3),
(3, '2026-05-17 09:45:00', '2026-05-17 10:05:00', 'verde', 'cefaleia', 'permeavel', 'normal', 'nenhuma', 'alerta', 'normal', 'independente', 'pulsatil', 'cabeca', 'cefaleia ligeira desde a manhã', 'sem défices neurológicos', '8 horas', 15, FALSE, FALSE, 36.8, 78, 16, 99.0, 118, 76, 3, 60, 4),
(4, '2026-05-17 10:20:00', '2026-05-17 10:35:00', 'amarelo', 'dor_abdominal', 'permeavel', 'normal', 'ligeira', 'alerta', 'normal', 'auxilio_parcial', 'continua', 'abdomen', 'dor abdominal difusa', 'sem rigidez abdominal', '4 horas', 15, FALSE, FALSE, 37.1, 88, 17, 98.0, 125, 82, 5, 50, 2),
(5, '2026-05-17 11:00:00', '2026-05-17 11:20:00', 'vermelho', 'alteracao_consciencia', 'comprometida', 'choque', 'moderada', 'inconsciente', 'cianotica', 'acamado', 'continua', 'naoaplicavel', 'doente encontrado confuso e sonolento', 'quadro súbito', 'sem dados adicionais', 8, TRUE, FALSE, 39.0, 132, 28, 89.0, 90, 50, 10, 5, 2),
(6, '2026-05-17 11:25:00', '2026-05-17 11:40:00', 'verde', 'trauma', 'permeavel', 'normal', 'ligeira', 'alerta', 'normal', 'auxilio_parcial', 'pontada', 'membrosuperior', 'queda com dor no braço esquerdo', 'sem deformidade aparente', '2 horas', 15, FALSE, FALSE, 36.5, 84, 16, 99.0, 122, 78, 4, 75, 4),
(7, '2026-05-17 11:50:00', '2026-05-17 12:10:00', 'amarelo', 'vomitos', 'permeavel', 'normal', 'nenhuma', 'alerta', 'sudorese', 'independente', 'continua', 'abdomen', 'vómitos repetidos e náuseas', 'sem desidratação evidente', '10 horas', 15, FALSE, FALSE, 37.0, 96, 20, 98.0, 116, 74, 6, 55, 3),
(8, '2026-05-17 12:15:00', '2026-05-17 12:30:00', 'laranja', 'dispneia', 'comprometida', 'dispneia_moderada', 'nenhuma', 'alerta', 'cianotica', 'auxilio_parcial', 'continua', 'torax', 'falta de ar e pieira', 'uso de músculos acessórios', '3 horas', 14, FALSE, FALSE, 37.2, 118, 26, 93.0, 130, 86, 8, 15, 3),
(9, '2026-05-17 12:40:00', '2026-05-17 12:55:00', 'azul', 'reacao_alergica', 'permeavel', 'normal', 'nenhuma', 'alerta', 'ruborizada', 'independente', 'continua', 'pele', 'prurido e manchas na pele', 'reação ligeira', '30 minutos', 15, FALSE, FALSE, 36.7, 76, 14, 99.0, 114, 72, 2, 120, 4),
(10, '2026-05-17 13:05:00', '2026-05-17 13:25:00', 'amarelo', 'convulsoes', 'permeavel', 'normal', 'nenhuma', 'sonolento', 'palida', 'acamado', 'continua', 'naoaplicavel', 'episódio convulsivo pré-hospitalar', 'pós-ictal', '20 minutos', 12, FALSE, FALSE, 37.6, 104, 18, 96.0, 128, 84, 6, 30, 2),
(11, '2026-05-17 13:30:00', '2026-05-17 13:45:00', 'verde', 'febre', 'permeavel', 'normal', 'nenhuma', 'alerta', 'normal', 'independente', 'intermitente', 'cabeca', 'febre baixa e dores no corpo', 'sintomas gripais', '1 dia', 15, FALSE, FALSE, 38.0, 90, 17, 98.0, 119, 79, 3, 60, 3),
(12, '2026-05-17 13:50:00', '2026-05-17 14:05:00', 'laranja', 'hemorragia', 'permeavel', 'normal', 'grave', 'alerta', 'palida', 'independente', 'pontada', 'mao', 'hemorragia ativa após corte profundo', 'necessitou compressão imediata', '10 minutos', 15, FALSE, FALSE, 36.9, 100, 18, 97.0, 126, 80, 7, 10, 4);



-- ============================================================
-- 16. ATO
-- ============================================================

INSERT INTO Ato (CodEpUrgenc, Tipo, Descricao, DataHoraInicio, DataHoraFim) VALUES
(1, 'observacao', 'Observação clínica após triagem.', '2026-05-17 08:50:00', '2026-05-17 09:30:00'),
(2, 'consulta', 'Avaliação médica por dor torácica.', '2026-05-17 09:25:00', '2026-05-17 10:15:00'),
(3, 'triagem', 'Reavaliação por cefaleia persistente.', '2026-05-17 10:10:00', '2026-05-17 10:40:00'),
(4, 'tratamento', 'Administração de analgesia e vigilância.', '2026-05-17 10:40:00', '2026-05-17 11:20:00'),
(5, 'internamento', 'Transferência para sala de internamento.', '2026-05-17 11:25:00', '2026-05-17 12:10:00'),
(6, 'tratamento', 'Imobilização e controlo da dor.', '2026-05-17 11:45:00', '2026-05-17 12:30:00'),
(7, 'medicacao', 'Administração de antiemético e hidratação.', '2026-05-17 12:15:00', '2026-05-17 12:50:00'),
(8, 'observacao', 'Observação por dispneia e pieira.', '2026-05-17 12:30:00', '2026-05-17 13:20:00'),
(9, 'consulta', 'Avaliação de reação alérgica ligeira.', '2026-05-17 12:55:00', '2026-05-17 13:25:00'),
(10, 'tratamento', 'Controlo pós-convulsivo e monitorização.', '2026-05-17 13:20:00', '2026-05-17 14:00:00'),
(11, 'consulta', 'Avaliação de síndrome gripal.', '2026-05-17 13:45:00', '2026-05-17 14:15:00'),
(12, 'procedimento', 'Limpeza e compressão hemostática.', '2026-05-17 14:05:00', '2026-05-17 14:45:00');

-- ============================================================
-- 17. REALIZA
-- Associação entre profissionais e atos clínicos
-- ============================================================

INSERT INTO Realiza (IdAto, IdFunc) VALUES
(1, 8),
(2, 8),
(3, 11),
(4, 10),
(5, 8),
(6, 13),
(7, 9),
(8, 11),
(9, 15),
(10, 10),
(11, 9);

-- ============================================================
-- 18. PRESCREVE
-- ============================================================

INSERT INTO Prescreve (
    IdAto, CodMedicamento, Dosagem, Frequencia, ViaAdministracao,
    DuracaoDias, Observacoes, EstadoPrescricao, ScoreRiscoIA,
    ValidadoPorIA, DataHoraValidacaoIA
) VALUES
(1, 1, '500 mg', '8/8h', 'oral', 5, 'Sintomas ligeiros.', 'aprovada', 0.1200, TRUE, '2026-05-17 08:55:00'),
(2, 13, '5 mg', '24/24h', 'oral', 7, 'Controlo da tensão arterial.', 'aprovada', 0.1800, TRUE, '2026-05-17 09:30:00'),
(3, 11, '50 mg', '24/24h', 'oral', 10, 'Tratamento para ansiedade.', 'aprovada', 0.0900, TRUE, '2026-05-17 10:00:00'),
(4, 2, '400 mg', '8/8h', 'oral', 3, 'Dor e inflamação abdominal.', 'pendente', 0.2200, FALSE, NULL),
(5, 9, '50 mg', 'SOS', 'oral', 2, 'Analgesia forte em contexto agudo.', 'aprovada', 0.6400, TRUE, '2026-05-17 11:30:00'),
(6, 18, '850 mg', '12/12h', 'oral', 14, 'Controlo glicémico.', 'aprovada', 0.1500, TRUE, '2026-05-17 12:00:00'),
(7, 24, '100 mg', '24/24h', 'oral', 5, 'Anti-histamínico de suporte.', 'aprovada', 0.0800, TRUE, '2026-05-17 12:20:00'),
(8, 20, '100 mcg', 'SOS', 'inalatoria', 7, 'Dispneia e pieira.', 'pendente', 0.3100, FALSE, NULL),
(9, 17, '100 mg', '24/24h', 'oral', 3, 'Profilaxia antiagregante.', 'aprovada', 0.2000, TRUE, '2026-05-17 13:10:00'),
(10, 8, '20 mg', '12/12h', 'oral', 4, 'Proteção gástrica.', 'aprovada', 0.1100, TRUE, '2026-05-17 13:35:00'),
(11, 3, '500 mg', '8/8h', 'oral', 7, 'Antibiótico para suspeita infecciosa.', 'pendente', 0.3700, FALSE, NULL),
(12, 7, '40 mg', '24/24h', 'oral', 5, 'Controlo de edema e pressão arterial.', 'aprovada', 0.1400, TRUE, '2026-05-17 14:20:00');


-- ============================================================
-- 19. ALERTA
-- ============================================================

INSERT INTO Alerta (
    IdPrescricao, IdFunc, Tipo, DataHorAlerta, Ignorado, Justificacao,
    Severidade, ScoreRisco, Resolvido, ResolvidoEm, ResolvidoPor,
    MensagemIA, Recomendacao
) VALUES
(1, 8, 'interacao', '2026-05-17 09:00:00', FALSE, NULL, 'moderado', 0.2400, TRUE, '2026-05-17 09:15:00', 1, 'Dose dentro do esperado.', 'Manter vigilância.'),
(2, 8, 'dose', '2026-05-17 09:40:00', FALSE, NULL, 'baixo', 0.1200, TRUE, '2026-05-17 09:55:00', 1, 'Sem risco significativo.', 'Sem ação adicional.'),
(3, 11, 'alergia', '2026-05-17 10:05:00', FALSE, 'Histórico prévio relevante.', 'alto', 0.7800, FALSE, NULL, NULL, 'Potencial alergia cruzada.', 'Confirmar alergias antes de administrar.'),
(4, 10, 'contraindicacao', '2026-05-17 10:30:00', TRUE, 'Medicamento em avaliação clínica.', 'moderado', 0.4100, FALSE, NULL, NULL, 'Precisa validação médica.', 'Rever prescrição.'),
(5, 8, 'sobredosagem', '2026-05-17 11:35:00', FALSE, NULL, 'critico', 0.9100, FALSE, NULL, NULL, 'Risco elevado de toxicidade.', 'Interromper e reavaliar imediatamente.'),
(6, 9, 'interacao', '2026-05-17 12:05:00', FALSE, NULL, 'moderado', 0.2600, TRUE, '2026-05-17 12:15:00', 1, 'Compatível com terapêutica atual.', 'Prosseguir.'),
(7, 12, 'dose', '2026-05-17 12:25:00', FALSE, NULL, 'baixo', 0.1500, TRUE, '2026-05-17 12:35:00', 1, 'Dose ajustada corretamente.', 'Sem alteração.'),
(8, 10, 'alergia', '2026-05-17 12:40:00', FALSE, 'Necessita confirmação de tolerância.', 'alto', 0.6900, FALSE, NULL, NULL, 'Possível alergénio identificado.', 'Verificar antes de iniciar.'),
(9, 9, 'contraindicacao', '2026-05-17 13:15:00', FALSE, NULL, 'moderado', 0.3300, TRUE, '2026-05-17 13:25:00', 1, 'Sem contra-indicação absoluta.', 'Administrar com precaução.'),
(10, 10, 'sobredosagem', '2026-05-17 13:40:00', FALSE, NULL, 'critico', 0.9700, FALSE, NULL, NULL, 'Potencial sobredosagem grave.', 'Suspender prescrição e contactar médico.');


-- ============================================================
-- 20. PREDICAO IA
-- ============================================================

INSERT INTO PredicaoIA (
    TipoModelo, Entidade, EntidadeId, InputJson, OutputJson, Score,
    ModeloVersao, Sucesso, ErroMensagem, CriadoEm
) VALUES
('triagem', 'triagem', 1, '{"temperatura": 38.2, "freq_card": 92, "freq_resp": 18, "spo2": 97, "queixa": "febre"}', '{"cor_prevista": "amarelo", "probabilidade": 0.86}', 0.860000, 'triage-v1.0', TRUE, NULL, NOW()),
('triagem', 'triagem', 2, '{"temperatura": 37.4, "freq_card": 110, "freq_resp": 22, "spo2": 95, "queixa": "dor_toracica"}', '{"cor_prevista": "laranja", "probabilidade": 0.91}', 0.910000, 'triage-v1.0', TRUE, NULL, NOW()),
('triagem', 'triagem', 3, '{"temperatura": 36.8, "freq_card": 78, "freq_resp": 16, "spo2": 99, "queixa": "cefaleia"}', '{"cor_prevista": "verde", "probabilidade": 0.73}', 0.730000, 'triage-v1.0', TRUE, NULL, NOW()),
('triagem', 'triagem', 4, '{"temperatura": 39.1, "freq_card": 128, "freq_resp": 28, "spo2": 89, "queixa": "alteracaoconsciencia"}', '{"cor_prevista": "vermelho", "probabilidade": 0.98}', 0.980000, 'triage-v1.0', TRUE, NULL, NOW()),
('risco_medicamentoso', 'prescricao', 1, '{"idade": 45, "alergias": ["penicilina"], "medicamento": "amoxicilina"}', '{"risco": "alto", "motivo": "alergia cruzada"}', 0.940000, 'rx-risk-v2.1', TRUE, NULL, NOW()),
('risco_medicamentoso', 'prescricao', 2, '{"idade": 67, "medicacao_ativa": ["varfarina"], "medicamento": "ibuprofeno"}', '{"risco": "moderado", "motivo": "interacao medicamentosa"}', 0.770000, 'rx-risk-v2.1', TRUE, NULL, NOW()),
('risco_medicamentoso', 'prescricao', 3, '{"idade": 29, "medicamento": "paracetamol", "dosagem": "500 mg"}', '{"risco": "baixo", "motivo": "dose habitual"}', 0.620000, 'rx-risk-v2.1', TRUE, NULL, NOW()),
('triagem', 'triagem', 5, '{"temperatura": 37.0, "freq_card": 96, "freq_resp": 20, "spo2": 98, "queixa": "vomitos"}', '{"cor_prevista": "amarelo", "probabilidade": 0.79}', 0.790000, 'triage-v1.0', TRUE, NULL, NOW());

-- ============================================================
-- 21. INTERNAMENTO
-- ============================================================

INSERT INTO Internamento (
    CodEpUrgenc, IdFunc, DataHoraInt, DataHoraConsulta, DataHoraAlta,
    MotivoInt, NumeroCama, Servico, PrioridadeInternamento, EstadoAtual,
    ObservacoesAlta, DiagnosticoAlta, TipoAlta
) VALUES
(2, 8, '2026-05-17 10:30:00', '2026-05-17 10:45:00', NULL, 'Dor torácica com risco cardiovascular.', 'C-101', 'Cardiologia', 'Alta', 'ativo', NULL, NULL, NULL),
(5, 11, '2026-05-17 11:45:00', '2026-05-17 12:10:00', NULL, 'Alteração do estado de consciência.', 'U-12', 'Cuidados Intensivos', 'Muito Alta', 'ativo', NULL, NULL, NULL),
(7, 13, '2026-05-17 12:40:00', '2026-05-17 13:00:00', NULL, 'Vómitos persistentes e desidratação.', 'M-208', 'Medicina Interna', 'Média', 'ativo', NULL, NULL, NULL),
(8, 10, '2026-05-17 13:10:00', '2026-05-17 13:30:00', NULL, 'Dispneia moderada com pieira.', 'P-015', 'Pneumologia', 'Alta', 'ativo', NULL, NULL, NULL),
(10, 11, '2026-05-17 14:15:00', '2026-05-17 14:35:00', NULL, 'Convulsão com recuperação pós-ictal.', 'N-302', 'Neurologia', 'Alta', 'ativo', NULL, NULL, NULL);

-- ============================================================
-- 22. HISTORICO INTERNAMENTO
-- ============================================================

INSERT INTO HistoricoInternamento (
    CodInternamento, DataHora, TipoEvento, Descricao, IdFunc
) VALUES
(1, '2026-05-17 11:00:00', 'admissao', 'Utente admitido na unidade de cardiologia.', 8),
(1, '2026-05-17 12:00:00', 'avaliacao', 'Sinais vitais estáveis, sem dor aguda.', 8),
(2, '2026-05-17 12:15:00', 'admissao', 'Utente transferido para cuidados intensivos.', 11),
(2, '2026-05-17 13:00:00', 'tratamento', 'Iniciada monitorização contínua e oxigenoterapia.', 11),
(3, '2026-05-17 13:00:00', 'admissao', 'Utente internado em medicina interna.', 13),
(3, '2026-05-17 14:10:00', 'tratamento', 'Administração de fluidoterapia e antiemético.', 13),
(4, '2026-05-17 13:30:00', 'admissao', 'Utente admitido em pneumologia.', 10),
(4, '2026-05-17 14:20:00', 'avaliacao', 'Melhoria parcial da dispneia após broncodilatador.', 10),
(5, '2026-05-17 14:40:00', 'admissao', 'Utente transferido para neurologia.', 11),
(5, '2026-05-17 15:20:00', 'evolucao', 'Sem novas crises convulsivas, mantido em observação.', 11);


COMMIT;

