#!/bin/bash

# Dados do usuário
EMAIL="francisco.queirozdriver@gmail.com"
REPO="sistema-comissoes-web"
USUARIO_GITHUB="franciscoqueirozdriver"

# Criar pasta .ssh se não existir
mkdir -p ~/.ssh

echo "🔑 Gerando chave SSH..."
ssh-keygen -t ed25519 -C "$EMAIL" -f ~/.ssh/id_ed25519 -N ""

echo "🚀 Iniciando ssh-agent..."
eval "$(ssh-agent -s)"

echo "➕ Adicionando chave privada ao ssh-agent..."
ssh-add ~/.ssh/id_ed25519

echo "📋 Sua chave pública é:"
echo "------------------------------------------------------"
cat ~/.ssh/id_ed25519.pub
echo "------------------------------------------------------"
echo "👉 Copie essa chave e cadastre no GitHub em:"
echo "https://github.com/settings/ssh/new"

echo "🌐 Alterando URL do repositório local para SSH..."
cd ~/sistema-comissoes-web
git remote set-url origin git@github.com:$USUARIO_GITHUB/$REPO.git

echo "✅ Pronto! Agora você pode testar com:"
echo "ssh -T git@github.com"
echo "E depois fazer normalmente:"
echo "git push"
