# Guide d'utilisation de Postman pour tester vos routes API
Postman est un outil puissant pour tester et documenter des API. Voici comment l'utiliser pour tester les routes de votre application Gardien du Temps :

## Installation et configuration initiale
1. Installer Postman : Téléchargez et installez Postman depuis le site officiel.

2. Créer une collection :
  - Cliquez sur le bouton "New" puis "Collection"
  - Nommez-la "Gardien du Temps API"
  - Ajoutez une description si nécessaire

3. Configurer une variable d'environnement :
  - Cliquez sur l'icône d'engrenage (⚙️) en haut à droite
  - Sélectionnez "Add" pour créer un nouvel environnement
  - Nommez-le "Développement local"
  - Ajoutez ces variables :
`baseUrl : http://localhost:3000/api`
`token : (laissez vide pour l'instant)`

## Organisation des requêtes par dossiers

Organisez vos requêtes en dossiers pour une meilleure lisibilité :

1. Créer des dossiers : Dans votre collection, ajoutez des dossiers pour chaque groupe de routes :
- Auth
- Users
- Structures
- Projects
- Tasks
- Time Tracking
- Planned Schedules
- School Vacations
- Activity Logs

## Test de l'authentification
1. Créer une requête de connexion :
   - Dans le dossier Auth, cliquez sur "Add request"
   - Nommez-la "Login"
   - Méthode : POST
   - URL : `{{baseUrl}}/auth/login`
   - Body (raw, JSON) 
   - 
```json
{
  "email": "admin@example.com",
  "password": "password" // ATTENTION PREVOIR REGEX POUR LE MOT DE PASSE // -- A MODIFIER
}
```

2. Enregistrer le token JWT (script de test) :
- Cliquez sur l'onglet "Tests"
- Ajoutez le code suivant pour stocker le token JWT dans une variable d'environnement :

```javascript	
// Vérifier si la réponse contient un token
pm.test("Response status code is valid", function() {
    pm.expect(pm.response.code).to.be.oneOf([200, 401]);
});

if (pm.response.code === 200) {
    pm.test("Authentication successful", function() {
        const jsonData = pm.response.json();
        pm.expect(jsonData.token).to.exist;
        pm.expect(jsonData.user).to.exist;
        
        // Stocker les valeurs
        pm.environment.set("token", jsonData.token);
        pm.environment.set("userId", jsonData.user.id);
    });
} else {
    pm.test("Authentication failed with appropriate error message", function() {
        const jsonData = pm.response.json();
        pm.expect(jsonData.message).to.exist;
        
        // Effacer le token si authentification échouée
        pm.environment.unset("token");
        pm.environment.unset("userId");
    });
}
```
3. Exécuter la requête : Cliquez sur "Send" et vérifiez que vous recevez une réponse 200 avec un token.

```javascript
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ3NjQ5ODUyLCJleHAiOjE3NDc3MzYyNTJ9.GVv5gXsxsVEmwRFr78SbwEQK5QxmLqGUAxmMNivGhic",
```
- Si la connexion réussit, copiez le token de réponse et collez-le dans la variable d'environnement `token` (⚙️ > Environnement > Variables)

## Test des routes protégées
1. Configurer l'authentification automatique :
    - Dans votre collection, cliquez sur les trois points (⋮)
    - Sélectionnez "Edit"
    - Allez à l'onglet "Authorization"
    - Type : Bearer Token
    - Token : `{{token}}`
    - Sauvegardez

2. Créer une requête pour lister les utilisateurs :
    - Dans le dossier Users, ajoutez une requête
    - Nommez-la "Get All Users"
    - Méthode : GET
    - URL : `{{baseUrl}}/users`
    - Cliquez sur "Send" pour tester

## Test des routes avec paramètres
1. Récupérer un utilisateur par ID :
    - Créez une nouvelle requête dans le dossier Users
    - Nommez-la "Get User by ID"
    - Méthode : GET
    - URL : `{{baseUrl}}/users/{{userId}}`
    - Cliquez sur "Send"

2. Mettre à jour un utilisateur :
    - Créez une requête "Update User"
    - Méthode : PUT
    - URL : `{{baseUrl}}/users/{{userId}}`
    - Body (raw, JSON) :

```json
{
  "first_name": "Nom Modifié",
  "last_name": "Prénom Modifié"
}
```
utiliser cette variable pour la requête PUT
URL: {{baseUrl}}/users/{{newUserId}}

3. Créer un utilisateur :
    - Créez une requête "Create User"
    - Méthode : POST
    - URL : `{{baseUrl}}/users`
    - Body (raw, JSON) :

```json
{
  "first_name": "Nom",
  "last_name": "Prénom",
  "email": "{{random_email}}",
  "password": "password" 
}
```

1. Supprimer un utilisateur :
    - Créez une requête "Delete User"
    - Méthode : DELETE
    - URL : `{{baseUrl}}/users/{{userId}}`

## Test des routes avec paramètres de requête
Pour tester les routes qui utilisent des paramètres de requête (query parameters) :

1. Recherche de pointages par plage de dates :
    - Créez une requête "Get Time Entries by Date Range"
    - Méthode : GET
    - URL : {{baseUrl}}/time-tracking/range
    - Onglet "Params" : Ajoutez
        - Key: `startDate`, Value: `2025-01-01`
        - Key: `endDate`, Value: `2025-01-31`
        - Key: `userId`, Value: `{{userId}}`

## Automatisation des tests
1. Ajouter des assertions à vos requêtes :
    - Dans l'onglet "Tests" d'une requête :

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains users array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

2. Créer une suite de tests avec "Collection Runner" :
    - Cliquez sur "Runner" en bas
    - Sélectionnez votre collection
    - Choisissez l'environnement "Développement local"
    - Définissez l'ordre des requêtes
    - Cliquez sur "Run"

## Tests avancés

1. Création d'un flow complet (exemple) :
    - Login → Créer une structure → Créer un utilisateur → Créer un projet → Ajouter une tâche → Faire un pointage
2. Utiliser des variables dynamiques :
    - Générer des données aléatoires :

```javascript
// Dans l'onglet Pre-request Script d'une requête de création
pm.variables.set("random_email", `user${Date.now()}@example.com`);
```

    - Dans le body : "email": "{{random_email}}"

3. Vérifier la cohérence des données :
    - Après création d'une ressource, récupérez-la et comparez les valeurs

## Documentation des API

1. Ajouter une description à chaque requête pour documenter son usage
2. Ajouter des exemples de réponses :
    - Après une réponse réussie, cliquez sur "Save as example"
3. Exporter votre collection pour partager la documentation :
    - Cliquez sur les trois points (⋮) de la collection
    - Export → Collection v2.1
    - Vous pouvez partager ce fichier ou l'importer dans Postman API Documentation
  
### Conseils pratiques

1. Testez d'abord les routes non protégées avant l'authentification
2. Utilisez des environnements différents (développement, test, production)
3. Créez des scripts de nettoyage pour supprimer les données de test créées
4. Utilisez la console de Postman pour déboguer (View → Show Postman Console)
5. Sauvegardez régulièrement votre collection et exportez-la