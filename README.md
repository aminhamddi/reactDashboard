# OEE Audit - Dashboard Web

Interface d'administration et de visualisation des audits OEE. Tableau de bord interactif avec statistiques, heatmaps et classements.

## Architecture

```
dashboard-web/
├── src/
│   ├── App.jsx                  # Routes principales
│   ├── main.jsx                 # Point d'entrée React
│   ├── services/
│   │   ├── api.js               # Appels API (dashboard, audits, ranking...)
│   │   ├── adminApi.js          # Appels API admin (plants, users, services...)
│   │   └── auth.js              # Gestion token JWT
│   ├── pages/
│   │   ├── Login.jsx            # Page de connexion
│   │   ├── Dashboard.jsx        # Tableau de bord principal
│   │   ├── Audits.jsx           # Liste des audits
│   │   └── admin/
│   │       ├── AdminDashboard.jsx   # Vue admin principale
│   │       ├── AdminUsers.jsx       # CRUD utilisateurs
│   │       ├── AdminPlants.jsx      # CRUD usines + targets
│   │       └── AdminServices.jsx    # CRUD services
│   ├── components/
│   │   ├── ScoreCard.jsx        # Carte score par usine + target
│   │   ├── Heatmap.jsx          # Heatmap catégories/services × usines
│   │   ├── SiteRanking.jsx      # Classement par site
│   │   ├── ProjectRanking.jsx   # Classement par projet
│   │   ├── ServiceSiteMatrix.jsx    # Matrice service × site
│   │   ├── LineChart.jsx        # Graphique évolution mensuelle
│   │   ├── BarChart.jsx         # Graphique comparatif
│   │   ├── RealtimeIndicator.jsx    # Indicateur temps réel WebSocket
│   │   └── admin/
│   │       └── AdminLayout.jsx  # Layout navigation admin
│   └── constants/
│       └── colors.js            # Palette de couleurs
├── vite.config.js
├── tailwind.config.js
├── package.json
└── index.html
```

## Prérequis

- **Node.js** 18+
- **npm** ou **yarn**
- Backend API lancé sur le port 8000

## Installation

```bash
cd dashboard-web
npm install
```

## Lancement

```bash
npm run dev
```

Dashboard accessible sur : `http://localhost:5173`
Le serveur écoute sur toutes les interfaces (`0.0.0.0`).

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Connexion (email + mot de passe) |
| `/dashboard` | Tableau de bord : scores, heatmap, ranking, matrice |
| `/audits` | Liste de tous les audits avec filtres |
| `/admin` | Vue d'ensemble admin (stats) |
| `/admin/plants` | Gestion des usines + Target/ST Target |
| `/admin/services` | Gestion des services |
| `/admin/users` | Gestion des utilisateurs (CRUD + rôles) |

## Fonctionnalités

- **Score Cards** : score par usine avec target configurable et barre de progression
- **Heatmap** : scores par catégorie × usine et par service × usine
- **Classement Site** : ranking des usines par score avec indicateurs visuels
- **Classement Projet** : ranking des projets par score
- **Matrice Service × Site** : tableau croisé avec scores et totaux
- **Temps réel** : WebSocket pour mise à jour automatique à la finalisation d'un audit
- **Admin CRUD** : gestion des usines, services, projets et utilisateurs

## Technologies

- **React 19** + **React Router 7**
- **Tailwind CSS 3** pour le styling
- **Recharts** pour les graphiques
- **Axios** pour les appels API
- **Vite 7** comme bundler
