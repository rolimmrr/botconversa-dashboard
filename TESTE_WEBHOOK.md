# 🧪 TESTE DO WEBHOOK BOTCONVERSA

## 🎯 Configuração no BotConversa

### Passo 1: No seu fluxo do BotConversa
1. **Adicione uma ação** → **"API/Webhook"**
2. **Configure exatamente assim:**

```
Tipo de Requisição: POST
URL: https://botconversa-dashboard-rolimm.onrender.com/webhook/botconversa
```

### Passo 2: Headers
Clique em **"Adicionar um header para esta requisição"**
```
Nome: Content-Type
Valor: application/json
```

### Passo 3: Body (aba "Body")
```json
{
  "nome": "{{nome_cliente}}",
  "telefone": "{{telefone_cliente}}",
  "fluxo": "teste_captacao"
}
```

## 🔧 Se não tiver variáveis no BotConversa, use dados fixos para teste:

```json
{
  "nome": "João Silva Teste",
  "telefone": "(11) 99999-9999",
  "fluxo": "teste_webhook"
}
```

## 📊 Para monitorar o resultado:

1. **Dashboard:** https://botconversa-dashboard-rolimm.onrender.com
2. **Webhook logs:** Na aba "Logs" do Render
3. **Browser F12:** Console para debug

## 🧪 Teste Manual (via Postman/curl):

Se quiser testar antes de configurar no BotConversa:

```bash
curl -X POST https://botconversa-dashboard-rolimm.onrender.com/webhook/botconversa \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Manual",
    "telefone": "(11) 88888-8888", 
    "fluxo": "teste_curl"
  }'
```

## ✅ Respostas esperadas:

**Sucesso (200):**
```json
{
  "sucesso": true,
  "cliente_id": 1,
  "mensagem": "Cliente cadastrado com sucesso"
}
```

**Erro (400):**
```json
{
  "erro": "Nome e telefone são obrigatórios"
}
```

## 🎯 Campos que seu webhook aceita:

| Campo | Obrigatório | Exemplo |
|-------|-------------|---------|
| `nome` | ✅ | "João Silva" |
| `telefone` | ✅ | "(11) 99999-9999" |
| `fluxo` | ❌ | "captacao_leads" |
| `dados_adicionais` | ❌ | `{"email": "joao@teste.com"}` |

---

## 🚀 Próximos passos:
1. Configure no BotConversa
2. Teste com um usuário real ou simulação
3. Monitore no dashboard
4. Verifique se os dados aparecem na tabela