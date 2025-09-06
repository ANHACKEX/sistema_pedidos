-- ================================
-- BANCO DE DADOS: Sistema de Pedidos WhatsApp
-- PostgreSQL
-- ================================

-- Tabela de Clientes
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) UNIQUE NOT NULL,
    endereco_rua VARCHAR(150),
    endereco_numero VARCHAR(20),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(50),
    endereco_cep VARCHAR(15),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) CHECK (status IN ('ativo','inativo')) DEFAULT 'ativo'
);

CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_status ON clientes(status);

-- Tabela de Produtos
CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL,
    estoque_atual INT NOT NULL DEFAULT 0,
    categoria VARCHAR(100),
    status VARCHAR(10) CHECK (status IN ('ativo','inativo')) DEFAULT 'ativo'
);

CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_status ON produtos(status);

-- Tabela de Pedidos
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(15) CHECK (status IN ('pendente','em_producao','entregue','cancelado')) DEFAULT 'pendente',
    valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    observacoes TEXT,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data ON pedidos(data_hora);

-- Tabela de Itens do Pedido
CREATE TABLE itens_pedido (
    id_item SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
    CONSTRAINT fk_item_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

CREATE INDEX idx_itens_pedido_pedido ON itens_pedido(id_pedido);

-- Tabela de Funcionários
CREATE TABLE funcionarios (
    id_funcionario SERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    funcao VARCHAR(20) CHECK (funcao IN ('entregador','atendente','producao')) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('ativo','inativo')) DEFAULT 'ativo'
);

-- Tabela de Entregas
CREATE TABLE entregas (
    id_entrega SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_funcionario INT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(15) CHECK (status IN ('pendente','em_rota','entregue','falha')) DEFAULT 'pendente',
    CONSTRAINT fk_entrega_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_entrega_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id_funcionario)
);

CREATE INDEX idx_entregas_status ON entregas(status);

-- Tabela de Log de Mensagens (WhatsApp)
CREATE TABLE log_mensagens (
    id_log SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo_mensagem VARCHAR(50),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_envio VARCHAR(15) CHECK (status_envio IN ('enviado','falha','pendente')) DEFAULT 'pendente',
    CONSTRAINT fk_log_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE INDEX idx_log_mensagens_cliente ON log_mensagens(id_cliente);

-- Tabela de Histórico de Confirmações
CREATE TABLE historico_confirmacoes (
    id_confirmacao SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(15) CHECK (status IN ('confirmado','recusado','pendente')) DEFAULT 'pendente',
    CONSTRAINT fk_confirmacao_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

-- Tabela de Mensagens Automáticas
CREATE TABLE mensagens_automaticas (
    id_mensagem SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Cupons (Impressão Térmica)
CREATE TABLE cupons (
    id_cupom SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conteudo TEXT NOT NULL,
    status VARCHAR(15) CHECK (status IN ('impresso','pendente','reenviado')) DEFAULT 'pendente',
    CONSTRAINT fk_cupom_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

CREATE INDEX idx_cupons_status ON cupons(status);
