# PasswordPigeon

Générateur de mots de passe basé sur des mots réels — 100 % côté navigateur, sans backend ni dépendance externe.

L'idée : combiner plusieurs mots de dictionnaire avec un patron de chiffres pour produire des mots de passe **lisibles et robustes**, plus faciles à retenir qu'une suite de caractères aléatoires.

---

## Démo rapide

```
Cheval7·Maison·Arbre3   ← Patron A : chiffre après chaque mot
Cheval·Maison·Arbre·42  ← Patron B : nombre en fin
```

---

## Fonctionnalités

| Option | Description |
|---|---|
| **Patron** | Chiffre après chaque mot (0–9), ou nombre (0–99) en fin de mot de passe |
| **Dictionnaire** | Français ou Anglais |
| **Nombre de mots** | De 2 à 6 mots |
| **Séparateur** | `Espace`, `-`, `_`, `+`, `=`, `,`, `.` |
| **Majuscule initiale** | Capitalise la première lettre de chaque mot |
| **Stats** | Longueur et entropie estimée affichées en temps réel |

---

## Lancer le projet

Aucun build requis. Il suffit d'un serveur HTTP local (les ES modules ne fonctionnent pas en `file://`).

**Option 1 — Python (inclus sur la plupart des systèmes)**
```bash
python -m http.server
```

**Option 2 — Node.js**
```bash
npx serve .
```

**Option 3 — `execute.cmd`** (Windows, inclus dans le projet)

Ouvrir ensuite [http://localhost:8000](http://localhost:8000) dans le navigateur.

---

## Architecture

Le projet est découpé en trois couches distinctes :

```
/
├── index.html          Interface utilisateur (HTML)
├── styles.css          Mise en forme
├── logo.svg
├── js/
│   ├── dict.js         Couche données  — chargement et cache du dictionnaire
│   ├── generator.js    Couche logique  — génération aléatoire, entropie
│   └── ui.js           Couche UI       — événements DOM, affichage
└── data/
    ├── mots-fr.txt     Dictionnaire français
    └── mots-en.txt     Dictionnaire anglais
```

### `dict.js` — Couche dictionnaire
Charge le fichier `.txt` correspondant à la langue choisie, filtre les mots (4–10 caractères), retire les accents, et met le résultat en cache pour éviter les rechargements.

### `generator.js` — Couche logique
Contient toute la logique de génération, indépendante du DOM :
- Tirage aléatoire cryptographiquement sûr (`crypto.getRandomValues`)
- Construction du mot de passe selon le patron choisi
- Calcul d'entropie estimée

### `ui.js` — Couche interface
Lit les options depuis le DOM, orchestre les appels à `dict.js` et `generator.js`, et met à jour l'affichage. Aucune logique métier.

---

## Note sur l'entropie

L'entropie affichée est une **estimation indicative** basée sur la taille du dictionnaire filtré, le nombre de mots tirés et le patron de chiffres choisi.

Elle est volontairement imparfaite : elle ne tient pas compte de la prévisibilité humaine, des modèles d'attaque avancés, ni du fait que la capitalisation est déterministe. Son rôle est d'**illustrer l'impact des options** sur la robustesse du mot de passe, pas de fournir une valeur cryptographique exacte.

Ce générateur ne remplace pas un gestionnaire de mots de passe.

---

## Licence

[MIT](LICENSE) — libre d'utilisation, de modification et de redistribution.
