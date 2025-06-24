🔍 1. Audit complet du code
*Méthode pour me donner une vue d'ensemble :*

```bash
# Générer un rapport de structure du projet
find frontend/src -name "*.js" -o -name "*.jsx" | head -20
find backend/src -name "*.js" | head -20

# Générer un fichier avec tous les imports/exports
grep -r "import\|export" frontend/src --include="*.jsx" --include="*.js" > project_dependencies.txt

# Générer la liste des composants et leur taille
find frontend/src -name "*.jsx" -exec wc -l {} + | sort -nr > components_size.txt
```

Ou utilisez cette commande pour générer un rapport complet :

```bash
# Script pour générer un audit complet
cat > audit_project.sh << 'EOF'
#!/bin/bash
echo "=== AUDIT PROJET GARDIEN DU TEMPS ===" > project_audit.md
echo "" >> project_audit.md

echo "## Structure du projet" >> project_audit.md
tree frontend/src -I node_modules >> project_audit.md
echo "" >> project_audit.md

echo "## Composants principaux" >> project_audit.md
find frontend/src/components -name "*.jsx" -exec basename {} \; | sort >> project_audit.md
echo "" >> project_audit.md

echo "## Stores" >> project_audit.md
find frontend/src/stores -name "*.js" -exec basename {} \; >> project_audit.md
echo "" >> project_audit.md

echo "## Utils" >> project_audit.md
find frontend/src/utils -name "*.js" -exec basename {} \; >> project_audit.md
echo "" >> project_audit.md

echo "## Backend Controllers" >> project_audit.md
find backend/src/controllers -name "*.js" -exec basename {} \; >> project_audit.md
echo "" >> project_audit.md

echo "## Imports/Exports par fichier" >> project_audit.md
for file in $(find frontend/src -name "*.jsx" -o -name "*.js"); do
    echo "### $file" >> project_audit.md
    grep -n "import\|export" "$file" | head -10 >> project_audit.md
    echo "" >> project_audit.md
done
EOF

chmod +x audit_project.sh
./audit_project.sh
```

🎯 2. Points d'audit que je vais vérifier

*Détection automatique des problèmes :*

1. *Fonctions dupliquées* : Même logique dans plusieurs fichiers
2. *Imports inutiles* : Composants importés mais non utilisés
3. *Code mort* : Fonctions définies mais jamais appelées
4. *Stores redondants* : Même état géré à plusieurs endroits
5. *Composants surdimensionnés* : Plus de 300 lignes
6. *Logique métier dans les composants* : À extraire dans des hooks
7. *Magic numbers* : Valeurs hardcodées à externaliser
8. *Nommage incohérent* : Conventions différentes

Script de détection automatique :
```bash
# Créer un script d'analyse automatique
cat > code_analysis.js << 'EOF'
const fs = require('fs');
const path = require('path');

function analyzeProject() {
  const issues = {
    duplicatedFunctions: [],
    unusedImports: [],
    largeFunctions: [],
    magicNumbers: [],
    inconsistentNaming: []
  };

  // Analyser tous les fichiers JS/JSX
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        analyzeFile(filePath);
      }
    });
  }

  function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Détecter les fonctions trop longues
    let currentFunction = null;
    let functionStart = 0;

    lines.forEach((line, index) => {
      // Détecter début de fonction
      if (line.match(/^\s*(const|function|export\s+const)\s+\w+\s*=?\s*(async\s*)?\(|^\s*\w+\s*\(/)) {
        if (currentFunction) {
          const functionLength = index - functionStart;
          if (functionLength > 50) {
            issues.largeFunctions.push({
              file: filePath,
              function: currentFunction,
              lines: functionLength,
              startLine: functionStart
            });
          }
        }
        currentFunction = line.trim();
        functionStart = index;
      }

      // Détecter magic numbers
      const magicNumbers = line.match(/\b\d{2,}\b/g);
      if (magicNumbers) {
        magicNumbers.forEach(num => {
          if (parseInt(num) > 10 && !line.includes('//')) {
            issues.magicNumbers.push({
              file: filePath,
              line: index + 1,
              number: num,
              context: line.trim()
            });
          }
        });
      }
    });
  }

  scanDirectory('./frontend/src');
  scanDirectory('./backend/src');

  // Générer le rapport
  console.log('=== ANALYSE DE CODE ===');
  console.log('\n🔍 Fonctions trop longues (>50 lignes):');
  issues.largeFunctions.forEach(issue => {
    console.log(`- ${issue.file}:${issue.startLine} - ${issue.function} (${issue.lines} lignes)`);
  });

  console.log('\n🔢 Magic numbers détectés:');
  issues.magicNumbers.slice(0, 10).forEach(issue => {
    console.log(`- ${issue.file}:${issue.line} - ${issue.number} dans: ${issue.context}`);
  });
}

analyzeProject();
EOF

node code_analysis.js
```

📋 3. Plan de refactorisation étape par étape

*Phase 1 : Audit et documentation*
1. Mapper toutes les dépendances
2. Identifier les composants critiques
3. Documenter l'architecture actuelle
4. Créer les tests de régression

*Phase 2 : Nettoyage sans impact*
1. Supprimer le code mort
2. Nettoyer les imports inutiles
3. Standardiser le nommage
4. Ajouter les commentaires JSDoc

*Phase 3 : Extraction et mutualisation*
1. Extraire les hooks métier
2. Créer les constantes partagées
3. Mutualiser les fonctions utilitaires
4. Optimiser les stores

*Phase 4 : Restructuration*
1. Découper les gros composants
2. Réorganiser l'architecture des dossiers
3. Améliorer la gestion d'état
4. Optimiser les performances

🚀 4. Pour commencer immédiatement

*Partagez-moi ces fichiers dans cet ordre de priorité :*

```bash
# 1. Fichiers de structure (architecture)
frontend/src/App.jsx
frontend/src/index.js
backend/src/server.js
backend/src/app.js

# 2. Stores (état global)
frontend/src/stores/*.js

# 3. Composants principaux (logique métier)
frontend/src/components/dashboard/DirectorDashboard.jsx
frontend/src/components/common/Layout.jsx
frontend/src/components/common/YearlyPlanningRoadmap.jsx

# 4. Controllers backend (API)
backend/src/controllers/*.js

# 5. Utils et hooks (fonctions partagées)
frontend/src/utils/*.js
frontend/src/hooks/*.js
```

📊 5. Générer le rapport d'audit automatique

```bash
# Commande pour générer un audit complet que vous pourrez me partager
find frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l | sort -nr > file_sizes.txt
grep -r "TODO\|FIXME\|XXX\|HACK" frontend/src backend/src > todos.txt
grep -r "console\." frontend/src > console_logs.txt
```

__Envoyez-moi le résultat de ces commandes + les fichiers principaux, et je pourrai faire un audit complet avec un plan de refactorisation détaillé ! 🎯__

---
---


🎯 Étapes précises pour l'audit et refactorisation

*ÉTAPE 1 : Générer les rapports d'analyse*

1.1 Ouvrir un terminal dans votre projet
```bash
cd /home/sanka/Gardien_du_Temps
```

1.2 Créer le dossier d'audit
```bash
mkdir audit_reports
cd audit_reports
```

1.3 Générer le rapport de taille des fichiers
```bash
find ../frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l | sort -nr > file_sizes.txt
find ../backend/src -name "*.js" | xargs wc -l | sort -nr >> file_sizes.txt
```

1.4 Analyser les imports/exports
```bash
echo "=== FRONTEND IMPORTS/EXPORTS ===" > imports_exports.txt
grep -r "import.*from\|export" ../frontend/src --include="*.jsx" --include="*.js" >> imports_exports.txt
echo "" >> imports_exports.txt
echo "=== BACKEND IMPORTS/EXPORTS ===" >> imports_exports.txt
grep -r "import.*from\|export\|require" ../backend/src --include="*.js" >> imports_exports.txt
```

1.5 Trouver les TODOs et console.log
```bash
grep -r "TODO\|FIXME\|XXX\|HACK\|console\." ../frontend/src ../backend/src > code_issues.txt
```

1.6 Analyser la structure
```bash
echo "=== STRUCTURE FRONTEND ===" > project_structure.txt
tree ../frontend/src -I node_modules >> project_structure.txt
echo "" >> project_structure.txt
echo "=== STRUCTURE BACKEND ===" >> project_structure.txt
tree ../backend/src >> project_structure.txt
```


*ÉTAPE 2 : Partager les fichiers clés avec moi*
2.1 Fichiers d'audit à me partager
```bash
# Vérifier que les fichiers sont créés
ls -la audit_reports/
cat audit_reports/file_sizes.txt | head -20
```

2.2 Fichiers de code prioritaires à me partager (dans cet ordre exact) :

__A. Architecture principale (4 fichiers)__
- `frontend/src/App.jsx`
- `index.js`
- `backend/src/server.js`
- `app.js`

__B. Stores (état global) - TOUS les fichiers__
- `authStore.js`
- `timeStore.js`
- `planningStore.js`
- `schoolVacationStore.js`

__C. Composants critiques (3 fichiers)__
- `DirectorDashboard.jsx`
- `Layout.jsx`
- `YearlyPlanningRoadmap.jsx`

*ÉTAPE 3 : Méthode pour partager sans erreur*
3.1 Créer un fichier unique avec tout

```bash
# Retourner à la racine du projet
cd /home/sanka/Gardien_du_Temps

# Créer le fichier de compilation
echo "=== AUDIT COMPLET GARDIEN DU TEMPS ===" > audit_complet.txt
echo "Date: $(date)" >> audit_complet.txt
echo "" >> audit_complet.txt

# Ajouter les rapports d'analyse
echo "=== 1. TAILLE DES FICHIERS ===" >> audit_complet.txt
cat audit_reports/file_sizes.txt >> audit_complet.txt
echo "" >> audit_complet.txt

echo "=== 2. STRUCTURE PROJET ===" >> audit_complet.txt
cat audit_reports/project_structure.txt >> audit_complet.txt
echo "" >> audit_complet.txt

echo "=== 3. PROBLÈMES DÉTECTÉS ===" >> audit_complet.txt
cat audit_reports/code_issues.txt >> audit_complet.txt
echo "" >> audit_complet.txt

# Ajouter les fichiers de code un par un
for file in \
  "frontend/src/App.jsx" \
  "frontend/src/index.js" \
  "frontend/src/stores/authStore.js" \
  "frontend/src/stores/timeStore.js" \
  "frontend/src/stores/planningStore.js" \
  "frontend/src/stores/schoolVacationStore.js" \
  "frontend/src/components/dashboard/DirectorDashboard.jsx" \
  "frontend/src/components/common/Layout.jsx" \
  "frontend/src/components/common/YearlyPlanningRoadmap.jsx"
do
  if [ -f "$file" ]; then
    echo "=== FICHIER: $file ===" >> audit_complet.txt
    cat "$file" >> audit_complet.txt
    echo "" >> audit_complet.txt
    echo "=== FIN $file ===" >> audit_complet.txt
    echo "" >> audit_complet.txt
  fi
done
```

3.2 Vérifier le fichier généré
```bash
# Voir la taille du fichier (doit être < 200KB pour pouvoir le partager)
ls -lh audit_complet.txt

# Voir le début du fichier pour vérifier
head -50 audit_complet.txt
```

3.3 Si le fichier est trop volumineux, le diviser
```bash
# Diviser en plusieurs parties si nécessaire
split -l 2000 audit_complet.txt audit_part_
```

*ÉTAPE 4 : Ce que je vais analyser*
Une fois que vous m'aurez partagé ces fichiers, je vais :

1. Identifier les doublons de code
2. Repérer les fonctions inutilisées
3. Analyser les performances des stores
4. Vérifier la cohérence des nommages
5. Proposer une refactorisation sans régression
6. Créer un plan de documentation


*ÉTAPE 5 : Actions à faire de votre côté MAINTENANT*
⚠️ IMPORTANT

- NE TOUCHEZ À AUCUN CODE avant mon analyse
- FAITES UN BACKUP de votre projet actuel
- TESTEZ que tout fonctionne avant de commencer

```bash
# Backup de sécurité
cd /home/sanka
cp -r Gardien_du_Temps Gardien_du_Temps_BACKUP_$(date +%Y%m%d)
```

Exécutez ces commandes dans l'ordre et partagez-moi le contenu de audit_complet.txt ! 📋

📋 AUDIT COMPLET - GARDIEN DU TEMPS
Après analyse complète de votre projet, voici un diagnostic détaillé avec un plan de refactorisation
...

RECAP ETAPES :

1. Remplacer `console.log` par `logger`
2. Créer et extraire les `constants` (Types, Roles/Permissions, Period, Time Format,...) et remplacer code
3. Créer et tester `Services`
4. Créer les `Hooks` -useXxxXxx- et les tester
5. Refacto logique avec les hooks