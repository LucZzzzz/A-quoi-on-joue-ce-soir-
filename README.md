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
