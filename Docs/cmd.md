Pour identifier tous les problèmes potentiels, utiliser cette commande :

```bash 
grep -r "router\." src/routes/ | grep -v "router\.use" | awk '{print $1 " -> " $3}' | sort
```
donne une liste de toutes les routes et des fonctions de contrôleur qu'elles appellent, pour permettre de vérifier si toutes les fonctions existent