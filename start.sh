#!/bin/bash

echo "🚀 Démarrage du projet StaffHub"

#########################################
# BACKEND
#########################################

echo "▶️ Lancement du backend..."

cd backend
source env/bin/activate 2>/dev/null
python3 manage.py runserver 8000 &

cd ..

#########################################
# FRONTEND
#########################################

echo "🌐 Lancement du frontend..."

cd frontend
npm start &

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
