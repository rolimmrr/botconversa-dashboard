# 🎯 WEBHOOK V2 - Integração com API BotConversa

## 🚀 Novo sistema implementado!

Agora seu sistema tem **2 webhooks**:

1. **`/webhook/botconversa`** - Original (recebe dados diretamente)
2. **`/webhook/botconversa-v2`** - Novo (busca dados na API do BotConversa)

---

## 🔧 Webhook V2 - Como usar:

### **URL do novo webhook:**
```
https://botconversa-dashboard-rolimm.onrender.com/webhook/botconversa-v2
```

### **Configuração no BotConversa:**
```json
{
  "contact_id": "{{contact.id}}",
  "acao": "atualizar_crm",
  "fluxo": "nome_do_fluxo"
}
```

### **Como funciona:**
1. **BotConversa envia** só o `contact_id`
2. **Seu sistema busca** dados reais na API do BotConversa
3. **Salva no CRM** com nome e telefone corretos

---

## 🧪 Testes disponíveis:

### **1. Testar API do BotConversa:**
```
GET https://botconversa-dashboard-rolimm.onrender.com/api/test-botconversa/CONTACT_ID
```

### **2. Testar webhook V2:**
```bash
POST https://botconversa-dashboard-rolimm.onrender.com/webhook/botconversa-v2
{
  "contact_id": "ID_DO_CONTATO",
  "acao": "teste_manual",
  "fluxo": "teste_api"
}
```

---

## ✅ Vantagens do V2:

- ✅ **Funciona com disparos manuais**
- ✅ **Dados sempre atualizados** da API
- ✅ **Não depende de contexto** da conversa
- ✅ **Captura email** e outros campos
- ✅ **Ideal para CRM** e automações

---

## 🎮 Para testar agora:

### **1. Encontre um contact_id:**
- Vá em qualquer conversa no BotConversa
- Na URL você verá: `.../conversations/CONTACT_ID`
- Copie esse ID

### **2. Teste a API:**
```
https://botconversa-dashboard-rolimm.onrender.com/api/test-botconversa/SEU_CONTACT_ID
```

### **3. Teste o webhook:**
Use o PowerShell:
```powershell
Invoke-RestMethod -Uri "https://botconversa-dashboard-rolimm.onrender.com/webhook/botconversa-v2" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"contact_id": "SEU_CONTACT_ID", "acao": "teste_powershell"}'
```

---

## 🎯 Configuração final no BotConversa:

**Para usar em produção**, configure assim:

```
Método: POST
URL: https://botconversa-dashboard-rolimm.onrender.com/webhook/botconversa-v2
Header: Content-Type: application/json
Body:
{
  "contact_id": "{{contact.id}}",
  "acao": "lead_capturado",
  "fluxo": "{{flow.name}}"
}
```

**Resultado:** Sempre funcionará, mesmo com disparos manuais! 🎉