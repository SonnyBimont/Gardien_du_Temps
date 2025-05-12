@startuml
left to right direction
skinparam packageStyle rectangle
skinparam usecase {
  BackgroundColor LightBlue
  BorderColor DarkBlue
}
skinparam actor {
  BackgroundColor LightYellow
  BorderColor Gold
}
skinparam rectangle {
  BackgroundColor White
  BorderColor DarkGray
}

actor "Administrateur\nGlobal" as Admin
actor "Directeur\nde Structure" as Directeur
actor "Animateur" as Animateur

rectangle "Fonctionnalités 'Gardien du Temps'" {
  rectangle "Authentification" {
    usecase "S'authentifier" as Auth
    usecase "Gérer son compte" as GererCompte
  }
  
  rectangle "Gestion Administrative" {
    usecase "Gérer les structures" as GererStructures
    usecase "Gérer les utilisateurs" as GererUtilisateurs
    usecase "Paramétrer l'application" as Parametrage
  }
  
  rectangle "Pointage" {
    usecase "Pointer (arrivée, pause, départ)" as Pointer
    usecase "Consulter ses pointages" as ConsulterPointages
  }
  
  rectangle "Gestion des Horaires" {
    usecase "Gérer les horaires\ndes animateurs" as GererHorairesAnimateurs
    usecase "Définir le prévisionnel horaire" as Previsionnel
    usecase "Définir les objectifs horaires" as Objectifs
  }
  
  rectangle "Suivi et Rapports" {
    usecase "Visualiser le suivi\ndes horaires" as Suivi
    usecase "Exporter les données" as Export
    usecase "Gérer les alertes" as Alertes
  }
  
  rectangle "Projets & Tâches" {
    usecase "Gérer les projets annuels" as Projets
    usecase "Gérer les tâches" as Taches
  }
  
  rectangle "Vacances Scolaires" {
    usecase "Gérer les calendriers\nde vacances" as Vacances
  }
}

' Relations Administrateur
Admin --> Auth
Admin --> GererStructures
Admin --> GererUtilisateurs
Admin --> Parametrage
Admin --> Export
Admin --> Vacances

' Relations Directeur
Directeur --> Auth
Directeur --> GererCompte
Directeur --> Pointer
Directeur --> ConsulterPointages
Directeur --> GererHorairesAnimateurs
Directeur --> Previsionnel
Directeur --> Objectifs
Directeur --> Suivi
Directeur --> Export
Directeur --> Alertes
Directeur --> Projets
Directeur --> Taches

' Relations Animateur
Animateur --> Auth
Animateur --> GererCompte
Animateur --> Pointer
Animateur --> ConsulterPointages
Animateur --> Taches

@enduml