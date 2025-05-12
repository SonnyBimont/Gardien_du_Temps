@startuml
actor "Animateur" as A
actor "Directeur" as D
actor "Admin Global" as AD
participant "Frontend React/Zustand" as FE
participant "API Express" as API
participant "Middleware JWT" as Auth
participant "Contrôleurs" as Ctrl
participant "Sequelize" as Sequelize
database "PostgreSQL" as DB

'Authentification
A -> FE: Connexion (identifiants)
FE -> API: POST /auth/login
API -> Auth: Vérification des identifiants
Auth -> Sequelize: Requête utilisateur
Sequelize -> DB: SELECT utilisateur
DB --> Sequelize: Données utilisateur
Sequelize --> Auth: Résultat requête
Auth -> Auth: Validation mot de passe
Auth --> API: Utilisateur authentifié
API -> API: Génération JWT avec rôle
API --> FE: Renvoi token JWT + infos utilisateur
FE -> FE: Stockage token (Zustand)
FE --> A: Redirection vers dashboard animateur

'Pointage horaire (animateur)
A -> FE: Pointage "Arrivée"
FE -> FE: Vérification état Zustand
FE -> API: POST /pointages
API -> Auth: Vérification token JWT
Auth --> API: Token valide (rôle animateur)
API -> Ctrl: createPointage()
Ctrl -> Sequelize: Pointage.create()
Sequelize -> DB: INSERT pointage
DB --> Sequelize: Confirmation
Sequelize --> Ctrl: Résultat opération
Ctrl --> API: Statut création
API --> FE: Réponse JSON (succès)
FE -> FE: Mise à jour état (Zustand)
FE --> A: Confirmation visuelle

'Consultation des horaires (directeur)
D -> FE: Accès tableau horaires animateurs
FE -> FE: Vérification permissions (Zustand)
FE -> API: GET /structures/:id/animateurs/pointages
API -> Auth: Vérification token JWT
Auth --> API: Token valide (rôle directeur)
API -> Ctrl: getPointagesAnimateurs()
Ctrl -> Sequelize: Pointage.findAll() avec filtres
Sequelize -> DB: SELECT pointages avec JOIN
note over DB: Applique cloisonnement par structure
DB --> Sequelize: Données pointages
Sequelize --> Ctrl: Résultats filtrés
Ctrl --> API: Réponse formatée
API --> FE: Données JSON
FE -> FE: Traitement et stockage (Zustand)  
FE --> D: Affichage tableau horaires

'Gestion administrative (admin)
AD -> FE: Création nouvelle structure
FE -> FE: Vérification permissions (Zustand)
FE -> API: POST /structures
API -> Auth: Vérification token JWT
Auth --> API: Token valide (rôle admin)
API -> Ctrl: createStructure()
Ctrl -> Sequelize: Structure.create()
Sequelize -> DB: INSERT structure
DB --> Sequelize: Confirmation
Sequelize --> Ctrl: Résultat opération
Ctrl --> API: Statut création
API --> FE: Réponse JSON (succès)
FE -> FE: Mise à jour état (Zustand)
FE --> AD: Confirmation visuelle

'Création d'un projet (directeur)
D -> FE: Création projet annuel
FE -> API: POST /projets
API -> Auth: Vérification token JWT
Auth --> API: Token valide (rôle directeur)
API -> Ctrl: createProjet()
Ctrl -> Sequelize: Projet.create()
Sequelize -> DB: INSERT projet
DB --> Sequelize: Confirmation
Sequelize --> Ctrl: Résultat opération
Ctrl --> API: Statut création
API --> FE: Réponse JSON (succès)
FE -> FE: Mise à jour état (Zustand)
FE --> D: Affichage projet créé

'Export des données (directeur)
D -> FE: Demande export PDF pointages
FE -> API: GET /export/pointages?format=pdf
API -> Auth: Vérification token JWT
Auth --> API: Token valide (rôle directeur)
API -> Ctrl: exportPointages()
Ctrl -> Sequelize: Récupération données
Sequelize -> DB: SELECT avec jointures
DB --> Sequelize: Données complètes
Sequelize --> Ctrl: Résultats
Ctrl -> Ctrl: Génération PDF
Ctrl --> API: Fichier PDF
API --> FE: Stream fichier
FE --> D: Téléchargement PDF
@enduml