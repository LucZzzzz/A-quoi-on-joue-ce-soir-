# On joue à quoi ce soir ? — version site web

Cette version tourne comme un vrai site (hors de Claude), ce qui permet
d'aller chercher automatiquement les vraies jaquettes Steam. Elle utilise
Firebase (gratuit) pour que vos téléphones restent synchronisés.

## Fichiers

- `index.html` — toute l'appli (une seule page)
- `api/steam-cover.js` — la fonction serveur qui va chercher la jaquette
  officielle d'un jeu sur Steam (contourne le blocage navigateur)

## Déploiement — voir le guide pas à pas donné dans la conversation

En résumé :
1. Mets ces fichiers dans un dépôt GitHub (upload par le site, pas besoin de
   ligne de commande).
2. Connecte ce dépôt à Vercel (gratuit) → déploiement automatique.
3. Crée un projet Firebase (gratuit), active Firestore, colle la config
   dans `FIREBASE_CONFIG` en haut du `<script>` de `index.html`.
4. Renvoie sur GitHub → Vercel redéploie tout seul.
5. Partage le lien `....vercel.app` à tes amis, chacun entre le même code
   de salle pour être synchronisé.

## Sécurité Firestore (à faire après les premiers tests)

Par défaut, Firestore en "mode test" autorise tout le monde à lire/écrire
pendant 30 jours — pratique pour démarrer, mais à resserrer ensuite.
Exemple de règle simple (Firestore > Règles) :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId}/{document=**} {
      allow read, write: if true; // à personnaliser plus tard si besoin
    }
  }
}
```
# À quoi jouer ce soir ? — version site web

## Fichiers

- `index.html` — toute l'appli (une seule page)
- `package.json` — indique à Vercel le format des fonctions
- `api/steam-cover.js` — cherche la jaquette officielle d'un jeu par son nom
- `api/steam-library.js` — récupère la bibliothèque Steam d'un joueur (profil public)

## Réglages nécessaires

1. **Firebase** : la config est déjà dans `index.html` (`FIREBASE_CONFIG`).
2. **Clé Steam** (pour « Lier mon compte Steam ») :
   - https://steamcommunity.com/dev/apikey → « Domain Name » : ton adresse `xxx.vercel.app`
   - Vercel → ton projet → Settings → Environment Variables →
     `STEAM_API_KEY` = ta clé → Save → Deployments → ⋯ → Redeploy.
   - Ne mets jamais cette clé dans `index.html` : elle doit rester côté serveur.

Chaque joueur doit avoir « Détails du jeu » en **Public** dans les paramètres de
confidentialité de son profil Steam.
