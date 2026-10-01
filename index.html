# À quoi jouer ce soir ? — version site web

## Fichiers

- `index.html` — toute l'appli (une seule page, 3 styles au choix)
- `package.json` — indique à Vercel le format des fonctions
- `firestore.rules` — règles de sécurité à coller dans la console Firebase (voir plus bas)
- `api/steam-cover.js` — jaquette officielle d'un jeu par son nom
- `api/steam-library.js` — bibliothèque Steam d'un joueur (profil public)
- `api/steam-info.js` — description, genres, développeur et statut multijoueur d'un jeu
- `api/game-price.js` — prix le plus bas actuel, tous magasins confondus (CheapShark, gratuit, sans clé)

## Réglages nécessaires

1. **Firebase** : la config est déjà dans `index.html` (`FIREBASE_CONFIG`).
2. **Authentification (nouveau)** : Firebase Console → ton projet → **Authentication**
   → onglet **Sign-in method** → active le fournisseur **E-mail/Mot de passe**
   (juste l'activer, rien d'autre à configurer). Sans cette étape, la création
   de compte échoue avec une erreur `auth/configuration-not-found` ou
   `auth/operation-not-allowed`.
   - Le formulaire ne demande qu'un **pseudo** et un **mot de passe** : en
     coulisses, le site transforme le pseudo en une fausse adresse e-mail
     interne (jamais montrée, jamais utilisée pour envoyer quoi que ce soit)
     pour que Firebase Auth — pensé autour d'e-mails — puisse s'en servir.
     C'est aussi ce qui garantit l'unicité du pseudo.
3. **Règles Firestore (nouveau, recommandé)** : Firebase Console → **Firestore
   Database** → onglet **Rules** → remplace le contenu par celui de
   `firestore.rules` → **Publier**. Sans ça, ton projet reste en « mode test »
   (accès complet à tout le monde pendant 30 jours) — ça fonctionne, mais ce
   n'est pas fait pour durer. Les règles fournies : rendent la bibliothèque
   personnelle de chacun strictement privée, et rendent une soirée de
   l'historique définitivement impossible à modifier ou supprimer une fois
   clôturée.
   ⚠️ Je n'ai pas pu tester ces règles contre un vrai projet Firebase (pas
   d'accès réseau depuis mon environnement) — teste bien la création de
   compte et la clôture d'une soirée juste après les avoir publiées, et
   reviens vers moi si quelque chose coince.
4. **Clé Steam** (pour « Lier mon compte Steam ») :
   - https://steamcommunity.com/dev/apikey → « Domain Name » : ton adresse `xxx.vercel.app`
   - Vercel → ton projet → Settings → Environment Variables →
     `STEAM_API_KEY` = ta clé → Save → Deployments → ⋯ → Redeploy.
   - Ne mets jamais cette clé dans `index.html` : elle doit rester côté serveur.

Chaque joueur doit avoir « Détails du jeu » en **Public** dans les paramètres de
confidentialité de son profil Steam.

## Limite connue : présence des amis

Firestore seul ne sait pas détecter une vraie déconnexion (contrairement à la
Realtime Database, qui a un mécanisme `onDisconnect`). Le statut 🟢/🟡/⚪
est donc écrit uniquement lors d'actions précises (connexion, entrée/sortie
d'un salon) et affiché comme « hors ligne » après 10 minutes sans mise à
jour. Concrètement : si quelqu'un ferme l'onglet sans rien faire d'autre, il
peut apparaître « en ligne » jusqu'à 10 minutes après être parti.

## Fonctionnalités

- **Tableau de bord (nouveau)** : une fois connecté, le site s'ouvre en grande
  fenêtre (jusqu'à ~1440px sur bureau) avec un menu latéral permanent —
  Accueil, Mes jeux, Mes amis, Salons, Thèmes, Historique, Paramètres. Chaque
  section a son propre défilement : la liste de jeux ne mange plus l'écran.
  Sur petit écran, le menu devient un tiroir ☰.
- **5 thèmes (Monster Hunter retiré)** : Flat, R.E.P.O., **Far Far West**
  (nouveau), **Minecraft** (nouveau), **Médiéval** (nouveau). Sélecteur visuel
  dans Thèmes, changement immédiat et sauvegardé avec le compte. Chaque
  nouveau thème a son propre effet de révélation à la roulette (affiche
  punaisée + poussière pour le western, explosion de pixels pour Minecraft,
  sceau de cire pour le médiéval).
- **Import et synchro Steam personnels** : dans le profil, « 🔗 Importer
  Steam » lie un compte Steam (recherche, sélection multiple, tout
  sélectionner/désélectionner). Une fois lié, le bouton devient
  « 🔄 Synchroniser » et ne propose plus que les jeux réellement nouveaux —
  rien n'est ajouté automatiquement sans confirmation. Chaque jeu personnel
  affiche sa provenance (« Steam » ou « Manuel »).
- **Amis (nouveau)** : recherche par pseudo, demandes à accepter/refuser,
  statut approximatif (🟢 en ligne / 🟡 dans un salon / ⚪ hors ligne — voir
  limite ci-dessous), retrait d'un ami.
- **Invitations en salon (nouveau)** : bouton « 👥 Inviter des amis » dans le
  salon (ouvert à tout participant connecté, pas réservé à l'hôte), badge
  🔔 sur l'accueil, refus propre si la soirée a été clôturée entre-temps.
- **Comptes** : pseudo + mot de passe, session gardée entre les
  visites. Chaque compte a sa propre bibliothèque de jeux, automatiquement
  proposée dans chaque salon rejoint (fusionnée avec celle des autres,
  « Proposé par : … »). Le flux sans compte (juste un prénom + un code de
  salle) reste disponible via « Continuer sans compte ».
- **Historique (nouveau)** : bouton « 🏁 Clôturer la soirée » dans l'onglet
  Roulette (réservé à l'hôte du salon). Enregistre participants, jeux joués
  dans l'ordre, et Chef(s) de soirée dans « Dernières soirées », consultable
  depuis le profil.
- Salle partagée par code, avec un hôte (le créateur de la salle) qui peut
  exclure un joueur ; chacun peut quitter la salle.
- Bibliothèque partagée : ajout manuel, import Steam (avec filtre « multijoueur
  uniquement »), ou copier-coller. Fusion automatique des doublons.
- Tri de la bibliothèque : nom, ajout récent, genre, ou provenance (regroupé
  par personne).
- Swipe façon Tinder, matchs (liste ou grille), fiche de chaque jeu (description
  Steam + bouton « prix le plus bas »).
- Roulette « Chef de soirée » façon ouverture de caisse, avec validation d'un
  jeu par le Chef (grand pop-up, réutilise les matchs déjà calculés).
- Trois styles visuels au choix (bouton ◐ dans l'en-tête), mémorisé par appareil.
