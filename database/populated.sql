-- =========================
-- TABELA: instituicoes
-- =========================
CREATE TABLE IF NOT EXISTS instituicoes (
    Id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    tipo INT NOT NULL,
    status TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABELA: profissionais
-- =========================
CREATE TABLE IF NOT EXISTS profissionais (
    Id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    crm VARCHAR(20),
    cpf VARCHAR(20),
    especialidade VARCHAR(100),
    status TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABELA: instituicao_profissional
-- =========================
CREATE TABLE IF NOT EXISTS instituicao_profissional (
    Id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    id_instituicao VARCHAR(36) NOT NULL,
    id_profissional VARCHAR(36) NOT NULL,
    status TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABELA: pacientes
-- =========================
CREATE TABLE IF NOT EXISTS pacientes (
    Id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    id_profissional VARCHAR(36) NOT NULL,
    data_nascimento DATE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    status TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABELA: atendimentos
-- =========================
CREATE TABLE IF NOT EXISTS atendimentos (
    Id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    id_profissional VARCHAR(36) NOT NULL,
    id_paciente VARCHAR(36) NOT NULL,
    data_atendimento DATE NOT NULL,
    hora_atendimento VARCHAR(5) NOT NULL,
    descricao TEXT,
    status TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================
-- DADOS DE TESTE
-- =========================

-- INSERT INTO instituicoes (nome, tipo, status)
-- VALUES ('Hospital São Lucas', 1, 1);

-- INSERT INTO profissionais (nome, crm, cpf, especialidade, status)
-- VALUES ('Dr. João Silva', 'CRM123456', '12345678900', 'Cardiologia', 1);