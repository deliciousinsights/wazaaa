# Exercice authentification Passport

# Objectifs

1. Empêcher tout accès aux routes de `entries.js` si on n’est pas authentifié·e.

# Détails

En cas d'échec, on doit :

1. Définir un flash de type `info` avec le texte : « Vous devez être
   authentifié·e pour accéder aux bookmarks. »
2. Rediriger sur la racine (`/`)

# Astuces

* Passport fournit `req.isAuthenticated()` pour vérifier qu’on est logués.
* Réfléchissez : quelle est la meilleure manière de factoriser du code à travers
  toute une série de routes ?
