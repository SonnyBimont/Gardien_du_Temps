## Projet d’Application – Gestion du Temps de Travail pour Structures Multi-sites

---

### 🌟 Objectif du projet

Créer une application web dédiée à la gestion du temps de travail, permettant aux directeurs de structure de suivre et automatiser les heures de travail de leur équipe (animateurs), tout en facilitant leur propre gestion horaire.

---

### 👥 Cibles utilisateurs

* **Administrateurs globaux** : pour la supervision générale de l’application.
* **Directeurs de structure** : pour gérer les horaires de leur structure.
* **Animateurs** : pour pointer leurs heures de travail de façon simple et rapide.

---

### 🏢 Organisation des utilisateurs

* L’application devra permettre la gestion de **plusieurs structures indépendantes**.
* Chaque structure regroupe :

  * **1 à X directeurs**
  * **XX animateurs**

🔐 **Confidentialité renforcée** :

* Chaque directeur ne peut visualiser que :

  * **Ses propres horaires**
  * **Les horaires des animateurs de sa structure uniquement**
* Les directeurs d’une même structure **ne peuvent pas consulter les horaires des autres directeurs**.

---

### 🕒 Fonctionnalités principales

#### 🔐 Authentification & sécurité

* Connexion sécurisée avec gestion des rôles (admin, directeur, animateur)
* Chiffrement des données sensibles
* Journalisation des accès et actions (audit log)

#### 📲 Pointage des temps

* Arrivée (début de journée)
* Pause méridienne (début et fin)
* Reprise d’activité
* Départ (fin de journée)
* Possibilité de pointer plusieurs fois dans la journée

#### 🗓️ Prévisionnel & objectifs

* Chaque directeur peut saisir son **prévisionnel horaire annuel** (par semaine, période ou mois)
* Possibilité de définir un **objectif horaire** :

  * **Annuel ou mensuel**
  * Paramétrable en fonction du **type de contrat**
* Possibilité de créer des **modèles de semaine ou de mois** pour simplifier la création du planning

#### 📈 Suivi et historique

* Visualisation des horaires pointés par jour/semaine/mois
* Calcul automatique des heures :

  * Journalières, hebdomadaires, mensuelles
  * Comparaison avec les objectifs définis
* Alerte en cas de :

  * Dépassement
  * Sous-réalisation
  * Oubli de pointage

#### 💼 Nouveau module – Projets & tâches annuelles

* Création de **projets annuels** (ex. : "Événements d’été", "Animations trimestrielles")
* Définition de **tâches récurrentes** (hebdomadaires, mensuelles, périodiques)
* Attribution aux directeurs ou animateurs
* Suivi de l’avancement (calendrier + kanban)
* Association possible du **temps estimé / temps réel** (intégration avec le pointage)

#### 🏛️ Gestion des vacances scolaires

* Import automatique des vacances scolaires selon la zone géographique du centre

---

### 🧑‍💼 Espace directeur

* Gestion des horaires de ses animateurs
* Suivi de ses propres horaires
* Saisie et ajustement du prévisionnel
* Export des relevés de temps (PDF / Excel)
* Validation ou commentaire des anomalies

### ⚙️ Espace administrateur

* Gestion des structures, utilisateurs, contrats
* Suivi consolidé de l’activité
* Paramétrage des règles (contrats, seuils, alertes)
* Accès aux exports globaux

---

### 📱 Contraintes techniques

* Application **web responsive** (mobile, tablette, PC)
* Interface fluide, ergonomique et intuitive
* Gestion des permissions avec cloisonnement des données
* Architecture scalable et évolutive
* Prévision d’évolutions futures (gestion des congés, absences, intégration paie, etc.)
