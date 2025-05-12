@startuml
' Styles et configuration
skinparam backgroundColor white
' Entités
entity Structure {
  *id : integer <<PK>>
  --
  *nom : varchar
  *adresse : varchar
  *code_postal : varchar
  *ville : varchar
  *zone_vacances_scolaires : enum [A, B, C]
  *actif : boolean
}
entity Utilisateur {
  *id : integer <<PK>>
  --
  *email : varchar <<unique>>
  *mot_de_passe : varchar
  *nom : varchar
  *prenom : varchar
  *telephone : varchar
  *structure_id : integer <<FK>>
  *role : enum [admin, directeur, animateur]
  *type_contrat : enum [CDI, CDD, etc.]
  *heures_hebdomadaires : decimal
  *heures_annuelles : decimal
  *date_debut_contrat : date
  date_fin_contrat : date
  *actif : boolean
}
entity Pointage {
  *id : integer <<PK>>
  --
  *utilisateur_id : integer <<FK>>
  *date_heure : datetime
  *type_pointage : enum [arrivee, pause_debut, pause_fin, depart]
  commentaire : text
  *valide : boolean
  valide_par : integer <<FK>>
}
entity Planning_Previsionnel {
  *id : integer <<PK>>
  --
  *utilisateur_id : integer <<FK>>
  *date : date
  *heure_debut : time
  *heure_fin : time
  pause_debut : time
  pause_fin : time
  commentaire : text
  *est_modele : boolean
}
entity Projet {
  *id : integer <<PK>>
  --
  *structure_id : integer <<FK>>
  *nom : varchar
  *description : text
  *date_debut : date
  *date_fin : date
  *statut : enum [en_preparation, en_cours, termine]
}
entity Tache {
  *id : integer <<PK>>
  --
  *projet_id : integer <<FK>>
  *nom : varchar
  *description : text
  *priorite : enum [basse, moyenne, haute, urgente]
  *temps_estime : integer
  *date_debut : date
  *date_echeance : date
  *statut : enum [a_faire, en_cours, termine]
  recurrence : enum [quotidien, hebdomadaire, mensuel]
}
entity Utilisateur_Tache {
  *id : integer <<PK>>
  --
  *utilisateur_id : integer <<FK>>
  *tache_id : integer <<FK>>
  *temps_travaille : integer
  *date_travail : date
}
entity Journal_Activite {
  *id : integer <<PK>>
  --
  *utilisateur_id : integer <<FK>>
  *date_action : datetime
  *type_action : enum [connexion, creation, modification, suppression]
  *description : text
  *ip_address : varchar
}
entity Vacances_Scolaires {
  *id : integer <<PK>>
  --
  *zone : enum [A, B, C]
  *nom_periode : varchar
  *date_debut : date
  *date_fin : date
  annee_scolaire : varchar
}
' Relations
Structure "1" -- "1.." Utilisateur : COMPOSE >
Structure "1" -- "1.." Projet : DEPEND >
Utilisateur "1" -- "1.." Pointage : EFFECTUE >
Utilisateur "1" -- "1.." Planning_Previsionnel : ETABLIT >
Projet "1" -- "1.." Tache : CONTIENT >
Utilisateur "1" -- "1.." Utilisateur_Tache : EST ASSIGNE A >
Tache "1" -- "1.." Utilisateur_Tache : EST ASSIGNE A >
Utilisateur "1" -- "1.." Journal_Activite : GENERE >
Utilisateur "1" -- "0.." Pointage : VALIDE >
@enduml