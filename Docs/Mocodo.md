POINTAGE: date_heure, type_pointage, commentaire, valide, valide_par
EFFECTUE, 11 UTILISATEUR, 1N POINTAGE
ÉTABLIT, 11 UTILISATEUR, 1N PLANNING_PREVISIONNEL
PLANNING_PREVISIONNEL: date, heure_debut, heure_fin, pause_debut, pause_fin, commentaire, est_modele

VALIDE, 01 UTILISATEUR, 0N POINTAGE
UTILISATEUR: email, mot_de_passe, nom, prenom, telephone, role, type_contrat, heures_hebdomadaires, heures_annuelles, date_debut_contrat, date_fin_contrat, actif
EST ASSIGNÉ, 1N UTILISATEUR, 1N TACHE: temps_travaille, date_travail
VACANCES SCOLAIRES: zone, nom_periode, date_debut, date_fin, annee_scolaire

GÉNÈRE, 11 UTILISATEUR, 1N JOURNAL_ACTIVITE
COMPOSE, 11 STRUCTURE, 1N UTILISATEUR
TACHE: nom, description, priorite, temps_estime, date_debut, date_echeance, statut, recurrence
CONTIENT, 11 PROJET, 1N TACHE

JOURNAL_ACTIVITE: date_action, type_action, description, ip_address
STRUCTURE: nom, adresse, code_postal, ville, zone_vacances_scolaires, actif
DÉPEND, 11 STRUCTURE, 1N PROJET
PROJET: nom, description, date_debut, date_fin, statut

// english // 

TIME_TRACKING: date_time, tracking_type, comment, validated, validated_by
PERFORMS, 11 USER, 1N TIME_TRACKING
ESTABLISHES, 11 USER, 1N PLANNED_SCHEDULE
PLANNED_SCHEDULE: date, start_time, end_time, break_start, break_end, comment, is_template

VALIDATES, 01 USER, 0N TIME_TRACKING
USER: email, password, last_name, first_name, phone, role, contract_type, weekly_hours, annual_hours, contract_start_date, contract_end_date, active
IS ASSIGNED, 1N USER, 1N TASK: time_worked, work_date
SCHOOL_VACATIONS: zone, period_name, start_date, end_date, school_year

GENERATES, 11 USER, 1N ACTIVITY_LOG
BELONGS_TO, 11 STRUCTURE, 1N USER
TASK: name, description, priority, estimated_time, start_date, due_date, status, recurrence
CONTAINS, 11 PROJECT, 1N TASK

ACTIVITY_LOG: action_date, action_type, description, ip_address
STRUCTURE: name, address, postal_code, city, school_vacation_zone, active
DEPENDS_ON, 11 STRUCTURE, 1N PROJECT
PROJECT: name, description, start_date, end_date, status