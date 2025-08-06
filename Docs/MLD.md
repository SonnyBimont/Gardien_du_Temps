STRUCTURE
id_structure (CP)
nom
adresse
code_postal
ville
zone_vacances_scolaires
actif

UTILISATEUR
id_utilisateur (CP)
email
mot_de_passe
nom
prenom
telephone
role
type_contrat
heures_hebdomadaires
heures_annuelles
date_debut_contrat
date_fin_contrat
actif
#id_structure (CE)

POINTAGE
id_pointage (CP)
date_heure
type_pointage
commentaire
valide
#id_utilisateur (CE)
#id_validateur (CE) (peut être nul, fait référence à TILISATEUR)

PLANNING_PREVISIONNEL
id_planning (CP)
date
heure_debut
heure_fin
pause_debut
pause_fin
commentaire
est_modele
#id_utilisateur (CE)

JOURNAL_ACTIVITE
id_journal (CP)
date_action
type_action
description
ip_address
#id_utilisateur (CE)

PROJET
id_projet (CP)
nom
description
date_debut
date_fin
statut
#id_structure (CE)

TACHE
id_tache (CP)
nom
description
priorite
temps_estime
date_debut
date_echeance
statut
recurrence
#id_projet (CE)

EST_ASSIGNE (Table associative)
#id_utilisateur (CP, CE)
#id_tache (CP, CE)
temps_travaille
date_travail
VACANCES_SCOLAIRES
id_vacances (CP)
zone
nom_periode
date_debut
date_fin
annee_scolaire