#!/bin/bash
echo "✅ Vérification de la structure du frontend..."

# Vérifier que les fichiers existent
if [ ! -f "html/index.html" ]; then
    echo "❌ Erreur : html/index.html manquant"
    exit 1
fi

if [ ! -d "assets" ]; then
    echo "❌ Erreur : dossier assets/ manquant"
    exit 1
fi

echo "✅ Structure validée !"
echo "📂 Fichiers HTML trouvés :"
ls -lh html/*.html

echo "📂 Fichiers JS trouvés :"
ls -lh assets/js/*.js

echo "🚀 Prêt pour le déploiement !"