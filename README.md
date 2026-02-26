# PasswordPigeon

Générateur de mots de passe basé sur des mots mémorisables (style diceware), entièrement côté client.

## Fonctionnalités

- Dictionnaires français et anglais
- Choix du nombre de mots (2–6)
- Choix du séparateur
- Majuscule initiale optionnelle
- Ajout de chiffres avec choix de position (`Mot·Mot·Mot·##` ou `Mot#·Mot#·Mot#`)
- Calcul de longueur et d'entropie en temps réel
- Aucune donnée envoyée — tout se passe dans le navigateur

## Paramètres URL

Il est possible de pré-configurer et verrouiller des options via l'URL. Les contrôles verrouillés sont visuellement désactivés et ne peuvent pas être modifiés par l'utilisateur.

| Paramètre | Valeurs acceptées | Défaut | Verrouillable |
|-----------|-------------------|--------|---------------|
| `lang` | `fr` \| `en` | `fr` | oui |
| `count` | `2` `3` `4` `5` `6` | `3` | oui |
| `sep` | `space` \| `-` \| `_` \| `+` \| `=` \| `,` \| `.` | `space` | oui |
| `digits` | `true` \| `false` | `true` | oui |
| `pattern` | `end-double` \| `per-word` | `end-double` | oui |
| `caps` | `true` \| `false` | `true` | oui |
| `reveal` | `true` \| `false` | `false` | non |

### Valeurs de `pattern`

| Valeur | Exemple |
|--------|---------|
| `end-double` | `Chat Pluie Soleil 42` |
| `per-word` | `Chat3 Pluie7 Soleil1` |

### Exemples

```
# Interface en anglais, 4 mots
index.html?lang=en&count=4

# Sans chiffres, séparateur tiret
index.html?digits=false&sep=-

# Mot de passe révélé dès le chargement
index.html?reveal=true

# Tout verrouillé pour un déploiement spécifique
index.html?lang=fr&count=3&sep=space&digits=true&pattern=per-word&caps=true&reveal=true
```

## Structure

```
├── index.html
├── styles.css
└── js/
    ├── dict.js       — chargement des dictionnaires
    ├── generator.js  — génération du mot de passe et calcul d'entropie
    ├── params.js     — lecture et application des paramètres URL
    └── ui.js         — gestion de l'interface
```
