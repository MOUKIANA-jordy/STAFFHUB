#!/bin/bash

echo "🚀 Démarrage du projet StaffHub"

#########################################
# 1) BACKEND
#########################################

echo "▶️ Lancement du backend..."

cd backend

# activer l'environnement si tu en utilises un
source env/bin/activate 2>/dev/null

python3 manage.py runserver 8000 &

BACKEND_PID=$!

cd ..

#########################################
# 2) FRONTEND REACT
#########################################

echo "🌐 Lancement du frontend..."

cd frontend

npm install --silent

npm start &

FRONTEND_PID=$!

cd ..

#########################################
# SUMMARY
#########################################

echo ""
echo "🔥 StaffHub lancé avec succès !"
echo "-----------------------------------"
echo "Backend  : http://localhost:8000"
echo "Frontend : http://localhost:3000"
echo "-----------------------------------"
echo "❗ CTRL + C pour arrêter"

wait
