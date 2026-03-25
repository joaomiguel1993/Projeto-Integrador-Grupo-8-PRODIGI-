#!/bin/bash
cd ~/e/LUIS/PROGRAMA PRODIGI/PROJETO INTEGRADOR/PROJETO/Projeto-Integrador-Grupo-8-PRODIGI-
rm -rf docs/teste_wine
git clone https://github.com/ncgarcia/teste_wine.git docs/teste_wine
git add docs/teste_wine
git commit -m "Atualiza teste_wine $(date)"
git push origin main
echo "✅ Atualizado!"


# Para executar este script, basta colar o codigo a baixo no terminal
# chmod +x update_prof.sh && ./update_prof.sh