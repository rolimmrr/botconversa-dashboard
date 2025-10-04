# 🚀 Como Testar o Sistema BotConversa + Dashboard

## 📋 Passo a Passo para Teste

### 1. Instalar e Iniciar o Sistema
```bash
# Execute o arquivo instalar.bat
instalar.bat

# Depois execute o iniciar.bat
iniciar.bat
```

### 2. Configurar Webhook no BotConversa

**URL do Webhook:** `http://localhost:3001/webhook/botconversa`
**Método:** `POST`
**Content-Type:** `application/json`

#### Exemplo de Body para enviar:
```json
{
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "fluxo": "captacao_leads",
  "dados_adicionais": {
    "email": "joao@email.com",
    "interesse": "produto_x"
  }
}
```

### 3. Campos que o Webhook Espera

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `nome` | ✅ | Nome do cliente |
| `telefone` | ✅ | Telefone do cliente |
| `fluxo` | ❌ | Nome do fluxo que capturou o lead |
| `dados_adicionais` | ❌ | Qualquer informação extra em JSON |

### 4. Como Configurar no BotConversa

1. **Acesse seu fluxo** no BotConversa
2. **Adicione uma ação de API/Webhook** no ponto onde quer capturar os dados
3. **Configure assim:**
   - **Tipo:** POST
   - **URL:** `http://localhost:3001/webhook/botconversa`
   - **Headers:** Adicione `Content-Type: application/json`
   - **Body:** 
   ```json
   {
     "nome": "{{nome_cliente}}",
     "telefone": "{{telefone_cliente}}",
     "fluxo": "nome_do_seu_fluxo"
   }
   ```

### 5. Teste Manual (Para Debug)

Você pode testar manualmente usando curl ou Postman:

```bash
curl -X POST http://localhost:3001/webhook/botconversa \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Manual",
    "telefone": "(11) 88888-8888",
    "fluxo": "teste"
  }'
```

### 6. Acessar o Painel

Abra o navegador e vá para: `http://localhost:3001`

## 🎯 Funcionalidades do Painel

- ✅ **Visualização em tempo real** dos leads capturados
- ✅ **Filtros por nome, telefone, status e fluxo**
- ✅ **Estatísticas automáticas** (total, hoje, por status)
- ✅ **Alteração de status** dos leads (Novo → Contatado → Convertido)
- ✅ **Exportação para CSV**
- ✅ **Atualização automática** a cada 30 segundos

## 🔧 Personalização

### Adicionar Novos Campos
Edite o arquivo `backend/server.js` na linha do webhook para capturar mais campos:

```javascript
const { nome, telefone, fluxo, email, cidade } = req.body;
```

### Alterar Status Disponíveis
Edite tanto o `server.js` quanto o `index.html` para adicionar novos status.

### Mudar a Porta
Edite a variável `PORT` no `server.js` ou defina a variável de ambiente `PORT`.

## 🚨 Troubleshooting

### Erro "EADDRINUSE"
- A porta 3001 já está em uso
- Mude a porta no `server.js` ou feche outros processos

### Webhook não funciona
- Verifique se o servidor está rodando
- Confirme a URL no BotConversa
- Teste manualmente com curl

### Dados não aparecem
- Verifique o console do navegador (F12)
- Olhe os logs do servidor no terminal
- Confirme se os campos obrigatórios estão sendo enviados