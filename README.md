# 🕒 Gardien du Temps
### Application de Gestion du Temps de Travail Multi-sites

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql)](https://postgresql.org)

---

# ⚡ Démarrage immédiat
# Une seule commande pour tout lancer
```
git clone [REPO_URL] && cd Gardien_du_Temps && docker-compose -f docker-compose.dev.yml up -d
```
-   🎉 Votre application est maintenant accessible sur http://localhost:3001
---

## 🎯 **À PROPOS**

Application web pour la gestion du temps de travail dans des structures multi-sites. Permet aux directeurs de pointer et suivre les horaires, établir planning prévisionnel et consulter heures travaillées sur objectif.
Aussi, de leurs équipes et aux animateurs de pointer facilement leurs heures.

### **👥 Utilisateurs cibles**
- **Administrateurs** : Supervision globale
- **Directeurs** : Pointage - Planning / Gestion des équipes par structure  
- **Animateurs** : Pointage simple et rapide
---

# 🚀 **DÉMARRAGE RAPIDE**

## ⚡ Installation Express

### 1. Cloner le projet
```bash
git clone https://github.com/[USERNAME]/Gardien_du_Temps.git
cd Gardien_du_Temps
```

### 2. Lancer avec Docker (RECOMMANDÉ)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Accéder à l'application
#### Frontend : http://localhost:3001
#### Backend API : http://localhost:3000/api
#### Base de données : localhost:5432
#### Swagger : http://localhost:3000/api-docs

# 🛠️ **DÉVELOPPEMENT LOCAL**

## 🔧 Installation manuelle

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend (nouveau terminal)
```bash
cd frontend  
npm install
npm start
```

### 🗄️ Base de données (PostgreSQL requise)
#### Option 1: PostgreSQL avec Docker
```bash
docker run --name postgres-gardien \
  -e POSTGRES_DB=db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 -d postgres:14-alpine
```

#### Option 2: Installation locale PostgreSQL
- Créer la base : [DB]
- User: [USER] / Password: [PASSWORD]
---

# 📱 **TECHNOLOGIES**

## 🎨 Frontend
- **React 18** : Interface utilisateur moderne
- **Tailwind CSS** : Styles utilitaires rapides
- **Zustand** : Gestion d'état légère
- **Axios** : Requêtes API optimisées

## ⚙️ Backend
- **Node.js** : Runtime JavaScript performant
- **Express.js** : Framework web minimaliste
- **Sequelize** : ORM PostgreSQL robuste
- **JWT** : Authentification sans état

## 🗄️ Base de données
- **PostgreSQL** : Base relationnelle fiable
-  **Sequelize** : ORM
- **Migrations** : Versionning du schéma
- **Index** : Optimisations performances

## 🐳 DevOps
- **Docker** : Containerisation multi-environnement
- **GitHub Actions** : CI/CD automatisé
- **Nginx** : Proxy reverse production

--- 

# 🔑 **FONCTIONNALITÉS PRINCIPALES**

## 🔐 Authentification
- Connexion sécurisée JWT
- Gestion des rôles (Admin/Directeur/Animateur)
- Permissions par structure

## ⏰ Pointage
- Arrivée/Départ simple
- Pauses méridienne
- Pointages multiples journaliers
- Historique complet

## 📊 Suivi
- Tableaux de bord personnalisés
- Calculs automatiques (jour/semaine/mois)
- Exports PDF/Excel

## 🏢 Multi-structures
- Cloisonnement des données
- Gestion indépendante par site
- Confidentialité renforcée
---

# 🛡️ **SÉCURITÉ**

## 🔒 Mesures implémentées
- **JWT** : Tokens sécurisés avec expiration
- **CORS** : Origines autorisées uniquement
- **Helmet** : Headers de sécurité automatiques
- **Validation** : Données d'entrée strictes
- **Chiffrement** : Mots de passe hashés bcrypt
- **Audit** : Logs détaillés des actions
