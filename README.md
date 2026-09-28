# À quoi jouer ce soir ? — version site web

## Fichiers

- `index.html` — toute l'appli (une seule page, 3 styles au choix)
- `package.json` — indique à Vercel le format des fonctions
- `api/steam-cover.js` — jaquette officielle d'un jeu par son nom
- `api/steam-library.js` — bibliothèque Steam d'un joueur (profil public)
- `api/steam-info.js` — description, genres, développeur et statut multijoueur d'un jeu
- `api/game-price.js` — prix le plus bas actuel, tous magasins confondus (CheapShark, gratuit, sans clé)

## Réglages nécessaires

1. **Firebase** : la config est déjà dans `index.html` (`FIREBASE_CONFIG`).
2. **Clé Steam** (pour « Lier mon compte Steam ») :
   - https://steamcommunity.com/dev/apikey → « Domain Name » : ton adresse `xxx.vercel.app`
   - Vercel → ton projet → Settings → Environment Variables →
     `STEAM_API_KEY` = ta clé → Save → Deployments → ⋯ → Redeploy.
   - Ne mets jamais cette clé dans `index.html` : elle doit rester côté serveur.

Chaque joueur doit avoir « Détails du jeu » en **Public** dans les paramètres de
confidentialité de son profil Steam.

## Fonctionnalités

- Salle partagée par code (pas de compte), avec un hôte (le créateur de la
  salle) qui peut exclure un joueur ; chacun peut quitter la salle.
- Bibliothèque partagée : ajout manuel, import Steam (avec filtre « multijoueur
  uniquement »), ou copier-coller. Fusion automatique des doublons.
- Tri de la bibliothèque : nom, ajout récent, genre, ou provenance (regroupé
  par personne).
- Swipe façon Tinder, matchs (liste ou grille), fiche de chaque jeu (description
  Steam + bouton « prix le plus bas »).
- Trois styles visuels au choix (bouton ◐ dans l'en-tête), mémorisé par appareil.
