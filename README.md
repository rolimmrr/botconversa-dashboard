# Sistema BotConversa - Captura e Painel de Dados

## 🎯 O que é?

Sistema completo para capturar leads do BotConversa via webhook e visualizar em um painel dashboard moderno, funcionando como uma "planilha evoluída".

## ✨ Funcionalidades

### 📊 Captura Automática
- ✅ Webhook para receber dados do BotConversa
- ✅ Armazenamento automático em banco SQLite
- ✅ Validação de dados obrigatórios
- ✅ Suporte a campos extras personalizados

### 🎛️ Painel de Controle
- ✅ Dashboard web responsivo e moderno
- ✅ Visualização em tempo real dos leads
- ✅ Filtros avançados (nome, telefone, status, fluxo)
- ✅ Estatísticas automáticas e gráficos
- ✅ Gerenciamento de status dos leads
- ✅ Exportação para Excel/CSV
- ✅ Auto-refresh a cada 30 segundos

### 🔧 Facilidades
- ✅ Instalação automática com 1 clique
- ✅ Scripts prontos para Windows
- ✅ Configuração zero - funciona imediatamente
- ✅ Documentação completa de uso

## 🚀 Como Usar

### 1. Instalação Rápida
```bash
# Clique duplo no arquivo
instalar.bat
```

### 2. Iniciar Sistema
```bash
# Clique duplo no arquivo
iniciar.bat
```

### 3. Configurar BotConversa
- **URL Webhook:** `http://localhost:3001/webhook/botconversa`
- **Método:** POST
- **Campos:** nome, telefone, fluxo

### 4. Acessar Painel
- Abra: `http://localhost:3001`

## 📁 Estrutura do Projeto
```
BotConversa/
├── backend/              # API Node.js + Express
│   ├── server.js        # Servidor principal
│   └── package.json     # Dependências
├── frontend/            # Dashboard HTML/CSS/JS
│   └── index.html       # Painel completo
├── database/            # Banco SQLite (criado automaticamente)
├── instalar.bat         # Script de instalação
├── iniciar.bat          # Script para iniciar
├── COMO_TESTAR.md       # Guia detalhado de teste
└── README.md            # Este arquivo
```

## 🎨 Preview do Dashboard

O painel inclui:
- 📈 **Cards de estatísticas** com totais e métricas
- 🔍 **Busca em tempo real** por nome ou telefone  
- 🏷️ **Filtros por status** (Novo, Contatado, Convertido)
- 📋 **Tabela interativa** com todos os leads
- ⚡ **Atualização automática** sem refresh manual
- 📊 **Exportação CSV** para análises externas
- 📱 **Design responsivo** para mobile

## 🔗 Integração com BotConversa

Perfeita integração usando o recurso nativo de webhook/API do BotConversa:

1. No seu fluxo, adicione uma **Ação de API**
2. Configure **POST** para `http://localhost:3001/webhook/botconversa`
3. Envie os dados: `{"nome": "{{nome}}", "telefone": "{{telefone}}", "fluxo": "meu_fluxo"}`
4. Pronto! Os dados aparecerão no painel automaticamente

## 📚 Documentação Completa

Veja o arquivo `COMO_TESTAR.md` para:
- Passo a passo detalhado
- Exemplos de configuração
- Troubleshooting
- Personalização avançada