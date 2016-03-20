# Exercice listing bookmarks

# Objectifs

1. Faire que le formulaire de filtrage reste visible dès lors qu‘on a des
   bookmarks en base.
2. Utiliser le terme « résultat » plutôt que « bookmark » pour le compteur
   d’éléments affichés
3. En cas de filtrage aboutissant à un résultat vide, afficher au même endroit
   que le tableau un paragraphe qui dit « Aucun résultat pour votre recherche. »
4. Persister l’état coché de la case « Pas forcément tous »

# Astuces

* `Entry.count()` existe (Mongoose), ça renvoie une promesse. Envoyer un
  `entryCount` à la vue pourrait être utile…
* En Pug, donner une valeur booléenne à un attribut produit le bon résultat :
  * checked=true donnera `checked="checked"`
  * checked=false ne donnera aucun attribut
