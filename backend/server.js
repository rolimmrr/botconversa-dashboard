const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração para produção
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;

if (isProduction) {
    app.set('trust proxy', 1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Token da API do BotConversa
const BOTCONVERSA_TOKEN = '0f569d5a-bc37-46e3-b2c9-0823a214604c';
// URLs baseadas na documentação oficial
const BOTCONVERSA_API_URLS = [
    'https://backend.botconversa.com.br/api/v1',
    'https://app.botconversa.com/api/v1', 
    'https://api.botconversa.com/v1', 
    'https://app.botconversa.com.br/api/v1'
];
const BOTCONVERSA_API_BASE = BOTCONVERSA_API_URLS[0]; // Usando a URL oficial primeiro

// Inicializar banco de dados
let db;

if (isProduction) {
    // Em produção, usar banco em memória
    db = new sqlite3.Database(':memory:');
    console.log('📂 Usando banco de dados em memória (produção)');
} else {
    // Em desenvolvimento, usar arquivo
    const dbPath = path.join(__dirname, '..', 'database', 'clientes.db');
    db = new sqlite3.Database(dbPath);
    console.log('📂 Usando banco de dados em arquivo (desenvolvimento)');
}

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

// Função para buscar dados do contato na API do BotConversa
async function buscarDadosBotConversa(contactId) {
    // Endpoints possíveis baseados na documentação
    const endpoints = [
        `/subscribers/${contactId}`,
        `/contacts/${contactId}`
    ];
    
    for (const endpoint of endpoints) {
        try {
            const url = `${BOTCONVERSA_API_BASE}${endpoint}`;
            console.log(`🔍 Tentando endpoint: ${url}`);
            console.log(`🔑 Token: ${BOTCONVERSA_TOKEN.substring(0, 8)}...`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${BOTCONVERSA_TOKEN}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`📊 Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const responseText = await response.text();
                console.log(`📝 Resposta bruta: ${responseText}`);
                
                const dados = JSON.parse(responseText);
                console.log('✅ Dados encontrados:', dados);
                
                // Mapear campos conforme documentação
                return {
                    nome: dados.name || dados.firstName + (dados.lastName ? ` ${dados.lastName}` : '') || 'Nome não informado',
                    telefone: dados.phone || 'Telefone não informado',
                    email: dados.email || null,
                    dados_originais: dados,
                    endpoint_usado: endpoint
                };
            } else {
                const errorText = await response.text();
                console.log(`❌ Erro no endpoint ${endpoint}: ${response.status} - ${errorText}`);
            }
            
        } catch (error) {
            console.error(`❌ Erro no endpoint ${endpoint}:`, error.message);
        }
    }
    
    console.error('❌ Nenhum endpoint funcionou para o contactId:', contactId);
    return null;
}

// Webhook MELHORADO para receber contact_id do BotConversa
app.post('/webhook/botconversa-v2', async (req, res) => {
    try {
        console.log('📥 Webhook v2 recebido:', req.body);
        
        const { contact_id, acao, fluxo, dados_extras } = req.body;
        
        // Validar se contact_id foi fornecido
        if (!contact_id) {
            return res.status(400).json({ 
                erro: 'contact_id é obrigatório para buscar dados do contato' 
            });
        }
        
        // Buscar dados reais na API do BotConversa
        console.log(`🔍 Buscando dados do contato ${contact_id} na API...`);
        const dadosContato = await buscarDadosBotConversa(contact_id);
        
        if (!dadosContato) {
            return res.status(500).json({ 
                erro: 'Não foi possível buscar dados do contato na API do BotConversa' 
            });
        }
        
        // Inserir no banco de dados com dados reais
        const stmt = db.prepare(`
            INSERT INTO clientes (nome, telefone, fluxo_origem, observacoes)
            VALUES (?, ?, ?, ?)
        `);
        
        const observacoes = {
            acao: acao || 'webhook_v2',
            email: dadosContato.email,
            dados_extras: dados_extras,
            contact_id: contact_id,
            dados_api_completos: dadosContato.dados_originais
        };
        
        stmt.run([
            dadosContato.nome,
            dadosContato.telefone,
            fluxo || 'api_botconversa',
            JSON.stringify(observacoes)
        ], function(err) {
            if (err) {
                console.error('❌ Erro ao inserir cliente:', err);
                return res.status(500).json({ erro: 'Erro interno do servidor' });
            }
            
            console.log(`✅ Cliente ${dadosContato.nome} cadastrado com sucesso (ID: ${this.lastID})`);
            
            res.json({ 
                sucesso: true, 
                cliente_id: this.lastID,
                mensagem: 'Cliente cadastrado com dados reais da API BotConversa',
                dados_capturados: {
                    nome: dadosContato.nome,
                    telefone: dadosContato.telefone,
                    email: dadosContato.email
                }
            });
        });
        
        stmt.finalize();
        
    } catch (error) {
        console.error('❌ Erro no webhook v2:', error);
        res.status(500).json({ erro: 'Erro interno do servidor: ' + error.message });
    }
});

// Webhook original (mantido para compatibilidade)
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

// Endpoint para testar a API do BotConversa
app.get('/api/test-botconversa/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params;
        console.log(`🧪 Testando API BotConversa para contato ${contactId}`);
        
        const dados = await buscarDadosBotConversa(contactId);
        
        if (!dados) {
            return res.status(404).json({ 
                erro: 'Não foi possível buscar dados do contato',
                contactId: contactId,
                token_usado: BOTCONVERSA_TOKEN.substring(0, 8) + '...',
                url_base: BOTCONVERSA_API_BASE
            });
        }
        
        res.json({ 
            sucesso: true,
            contact_id: contactId,
            dados: dados
        });
        
    } catch (error) {
        console.error('❌ Erro no teste da API:', error);
        res.status(500).json({ 
            erro: error.message,
            stack: error.stack,
            contactId: req.params.contactId
        });
    }
});

// Endpoint para testar URLs alternativas da API
app.get('/api/debug-urls/:contactId', async (req, res) => {
    const { contactId } = req.params;
    const resultados = [];
    const endpoints = ['/subscribers/', '/contacts/'];
    
    for (const baseUrl of BOTCONVERSA_API_URLS) {
        for (const endpoint of endpoints) {
            try {
                const fullUrl = `${baseUrl}${endpoint}${contactId}`;
                console.log(`🔍 Testando: ${fullUrl}`);
                
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${BOTCONVERSA_TOKEN}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const responseText = await response.text();
                
                resultados.push({
                    url: fullUrl,
                    status: response.status,
                    statusText: response.statusText,
                    success: response.ok,
                    response: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''),
                    headers: Object.fromEntries(response.headers.entries())
                });
                
                // Se encontrou sucesso, para por aqui
                if (response.ok) {
                    console.log(`✅ Sucesso encontrado em: ${fullUrl}`);
                    break;
                }
                
            } catch (error) {
                resultados.push({
                    url: `${baseUrl}${endpoint}${contactId}`,
                    erro: error.message
                });
            }
        }
    }
    
    res.json({
        contact_id: contactId,
        token: BOTCONVERSA_TOKEN.substring(0, 8) + '...',
        swagger_url: 'https://backend.botconversa.com.br/swagger',
        testes: resultados
    });
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