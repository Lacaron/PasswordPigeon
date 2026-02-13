# Générateur de mots de passe par mots

Ce projet est un **générateur de mots de passe 100 % côté navigateur**, sans backend, basé sur des dictionnaires de mots français et anglais.

Il permet de générer des mots de passe lisibles et robustes en combinant plusieurs mots avec différentes options (séparateur, chiffres, majuscule, etc.).

---

## Fonctionnalités

- Génération de mots de passe à partir de mots réels
- Choix de la langue :
  - Français
  - Anglais
- Nombre de mots configurable (3 à 6)
- Séparateur personnalisable (`- _ + = , .`)
- Ajout optionnel d’un chiffre après chaque mot
- Majuscule sur la première lettre de chaque mot (option activée par défaut)
- Affichage de statistiques :
  - Longueur du mot de passe
  - Estimation de l’entropie (en bits)
- Application entièrement statique (HTML / CSS / JavaScript)

---

## Sources des dictionnaires

- merci Philippe
---

## Notes sur la sécurité et l’entropie

- L’entropie affichée est une **estimation indicative**, calculée à partir :
  - de la taille du dictionnaire filtré,
  - du nombre de mots sélectionnés,
  - de l’ajout éventuel de chiffres après chaque mot.

- Cette estimation est **imparfaite et inexacte par nature**, car elle ne tient pas compte de nombreux facteurs réels, notamment :
  - la prévisibilité humaine (choix d’options similaires),
  - les modèles d’attaque avancés,
  - l’absence de randomisation sur certains paramètres (ex. capitalisation fixe).

- Malgré ces limites, le calcul de l’entropie est volontairement affiché afin de :
  - **sensibiliser les utilisateurs à l’impact des options de génération**,
  - **encourager l’utilisation de paramètres plus robustes** (plus de mots, chiffres activés, etc.),
  - fournir un repère simple et compréhensible plutôt qu’un faux sentiment de sécurité.

- Les séparateurs et la capitalisation déterministe n’ajoutent pas d’entropie.
- Ce générateur vise à produire des mots de passe **lisibles mais robustes**, et ne remplace pas un gestionnaire de mots de passe cryptographique.

---

## Exécution

Aucun backend requis.

Le projet peut être exécuté via :
- un serveur statique local (ex. `python -m http.server`)
- ou un hébergement statique (GitHub Pages, Netlify, etc.)

