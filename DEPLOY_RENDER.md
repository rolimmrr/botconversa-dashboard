# 🚀 DEPLOY NO RENDER.COM - Passo a Passo

## 🎯 O que vamos fazer:
Colocar seu dashboard BotConversa **ONLINE e GRATUITO** em 5 minutos!

## 📋 Passo a Passo:

### 1. Preparar no GitHub
1. **Acesse:** https://github.com
2. **Crie conta** se não tiver
3. **Clique em "New repository"**
4. **Nome:** `botconversa-dashboard` 
5. **Deixe público** ✅
6. **Clique "Create repository"**

### 2. Subir o código
No seu computador, rode estes comandos no terminal:

```bash
# Navegar para a pasta do projeto
cd "C:\Users\User\Desktop\BotConversa"

# Inicializar git
git init

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Dashboard BotConversa inicial"

# Conectar com GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/botconversa-dashboard.git

# Enviar código
git push -u origin main
```

### 3. Deploy no Render
1. **Acesse:** https://render.com
2. **Crie conta gratuita**
3. **Clique "New +"** → **"Web Service"**
4. **Conecte GitHub** e selecione seu repositório `botconversa-dashboard`
5. **Configure:**
   - **Name:** `botconversa-dashboard-SEU-NOME`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free` ✅
6. **Clique "Create Web Service"**

### 4. Aguardar Deploy (2-3 minutos)
O Render vai:
- ✅ Baixar seu código
- ✅ Instalar dependências  
- ✅ Iniciar servidor
- ✅ Gerar URL pública

### 5. Sua URL ficará assim:
```
https://botconversa-dashboard-SEU-NOME.onrender.com
```

### 6. URLs importantes:
- **📊 Dashboard:** `https://sua-url.onrender.com`
- **🔗 Webhook:** `https://sua-url.onrender.com/webhook/botconversa`

## 🤖 Configurar no BotConversa:

1. **Abra seu fluxo** no BotConversa
2. **Adicione ação "API/Webhook"**
3. **Configure:**
   - **Método:** POST
   - **URL:** `https://sua-url.onrender.com/webhook/botconversa`
   - **Headers:** `Content-Type: application/json`
   - **Body:**
   ```json
   {
     "nome": "{{nome_usuario}}",
     "telefone": "{{telefone_usuario}}",
     "fluxo": "nome_do_fluxo"
   }
   ```

## 🎉 Pronto!
Agora quando alguém interagir com seu bot:
1. **Dados são enviados** para sua URL online
2. **Aparecem no dashboard** em tempo real
3. **Você gerencia** os leads pelo painel

## 🔧 Comandos Git (caso precise):

```bash
# Se der erro de autenticação
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Se a branch principal for "master" ao invés de "main"
git branch -M main

# Para atualizar depois
git add .
git commit -m "Atualização"
git push
```

## 🆘 Precisa de ajuda?
- Render tem **logs em tempo real**
- Dashboard mostra **erros no navegador**
- **F12** no navegador para debug

---

### 🚨 IMPORTANTE:
- **Render Free** pode "dormir" após 15min sem uso
- **Primeira requisição** após "dormir" demora ~30s
- Para **sempre ativo**, upgrade para plano pago ($7/mês)