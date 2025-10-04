const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração para produção
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados
const dbPath = path.join(__dirname, '..', 'database', 'clientes.db');
const db = new sqlite3.Database(dbPath);

// Criar tabela se não existir
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        data_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
        fluxo_origem TEXT,
        status TEXT DEFAULT 'novo',
        observacoes TEXT
    )`);
});

// Webhook para receber dados do BotConversa
app.post('/webhook/botconversa', (req, res) => {
    try {
        const { nome, telefone, fluxo, dados_adicionais } = req.body;
        
        console.log('Dados recebidos do BotConversa:', req.body);
        
        // Validar dados obrigatórios
        if (!nome || !telefone) {
            return res.status(400).json({ 
                erro: 'Nome e telefone são obrigatórios' 
            });
        }
        
        // Inserir no banco de dados
        const stmt = db.prepare(`
            INSERT INTO clientes (nome, telefone, fluxo_origem, observacoes)
            VALUES (?, ?, ?, ?)
        `);
        
        stmt.run([
            nome,
            telefone,
            fluxo || 'não_informado',
            JSON.stringify(dados_adicionais) || null
        ], function(err) {
            if (err) {
                console.error('Erro ao inserir cliente:', err);
                return res.status(500).json({ erro: 'Erro interno do servidor' });
            }
            
            res.json({ 
                sucesso: true, 
                cliente_id: this.lastID,
                mensagem: 'Cliente cadastrado com sucesso'
            });
        });
        
        stmt.finalize();
        
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

// API para o painel - listar clientes
app.get('/api/clientes', (req, res) => {
    const { page = 1, limit = 50, busca, status, fluxo } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM clientes WHERE 1=1';
    let params = [];
    
    // Filtros
    if (busca) {
        query += ' AND (nome LIKE ? OR telefone LIKE ?)';
        params.push(`%${busca}%`, `%${busca}%`);
    }
    
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    
    if (fluxo) {
        query += ' AND fluxo_origem = ?';
        params.push(fluxo);
    }
    
    query += ' ORDER BY data_captura DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar clientes:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
        
        // Contar total para paginação
        let countQuery = 'SELECT COUNT(*) as total FROM clientes WHERE 1=1';
        let countParams = [];
        
        if (busca) {
            countQuery += ' AND (nome LIKE ? OR telefone LIKE ?)';
            countParams.push(`%${busca}%`, `%${busca}%`);
        }
        
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        
        if (fluxo) {
            countQuery += ' AND fluxo_origem = ?';
            countParams.push(fluxo);
        }
        
        db.get(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('Erro ao contar clientes:', err);
                return res.status(500).json({ erro: 'Erro interno do servidor' });
            }
            
            res.json({
                clientes: rows,
                total: countResult.total,
                pagina_atual: parseInt(page),
                total_paginas: Math.ceil(countResult.total / limit)
            });
        });
    });
});

// API para atualizar status do cliente
app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    
    const stmt = db.prepare('UPDATE clientes SET status = ?, observacoes = ? WHERE id = ?');
    
    stmt.run([status, observacoes, id], function(err) {
        if (err) {
            console.error('Erro ao atualizar cliente:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado' });
        }
        
        res.json({ sucesso: true, mensagem: 'Cliente atualizado com sucesso' });
    });
    
    stmt.finalize();
});

// API para estatísticas
app.get('/api/estatisticas', (req, res) => {
    const queries = {
        total_clientes: 'SELECT COUNT(*) as count FROM clientes',
        clientes_hoje: 'SELECT COUNT(*) as count FROM clientes WHERE DATE(data_captura) = DATE("now")',
        clientes_por_fluxo: 'SELECT fluxo_origem, COUNT(*) as count FROM clientes GROUP BY fluxo_origem',
        clientes_por_status: 'SELECT status, COUNT(*) as count FROM clientes GROUP BY status'
    };
    
    const resultados = {};
    let consultasConcluidas = 0;
    const totalConsultas = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([chave, query]) => {
        db.all(query, (err, rows) => {
            if (err) {
                console.error(`Erro na consulta ${chave}:`, err);
                resultados[chave] = { erro: 'Erro ao carregar dados' };
            } else {
                resultados[chave] = rows;
            }
            
            consultasConcluidas++;
            if (consultasConcluidas === totalConsultas) {
                res.json(resultados);
            }
        });
    });
});

// Middleware para servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota principal para o painel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 Webhook: http://localhost:${PORT}/webhook/botconversa`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar banco de dados:', err);
        } else {
            console.log('✅ Banco de dados fechado com sucesso');
        }
        process.exit(0);
    });
});