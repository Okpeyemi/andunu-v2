# 🔒 Console d'administration - Andunu

## 📋 Vue d'ensemble

Interface d'administration sécurisée pour gérer l'application Andunu. Accès réservé aux administrateurs avec authentification par email et mot de passe.

## 🎯 Accès

### URL de la console
```
/console
```

**Note importante** : Le nom `/console` a été choisi pour être discret et ne pas attirer l'attention. C'est une pratique courante pour les interfaces d'administration.

### Alternatives possibles
Si vous souhaitez changer le nom, voici d'autres options discrètes :
- `/sys` - Court et technique
- `/ctrl` - Contrôle
- `/hub` - Centre de gestion
- `/ops` - Opérations
- `/core` - Noyau
- `/vault` - Coffre-fort
- `/nexus` - Point central

## 🔐 Authentification

### Credentials de test
```
Email: admin@andunu.com
Mot de passe: admin123
```

**⚠️ IMPORTANT** : Ces credentials sont pour le développement uniquement. En production, utilisez des mots de passe forts et uniques.

### Sécurité implémentée
- ✅ Validation email
- ✅ Champ mot de passe masqué (toggle show/hide)
- ✅ Authentification simulée
- ✅ sessionStorage pour l'état admin
- ✅ Protection des routes admin
- ✅ Design sombre pour différencier de l'interface client

## 📄 Pages créées

### 1. `/console` - Page de connexion admin
**Fonctionnalités :**
- Logo avec icône cadenas
- Titre "Console d'administration"
- Input email avec icône
- Input mot de passe avec toggle show/hide
- Messages d'erreur
- Bouton de connexion avec spinner
- Design sombre (gradient gris)
- Infos de test en mode développement

**Design :**
- Fond : Gradient noir/gris
- Carte : Fond gris transparent avec backdrop-blur
- Icônes : SVG inline
- Couleurs : Gris + couleur primaire (orange)

### 2. `/admin/dashboard` - Dashboard admin
**Fonctionnalités :**
- Header avec logo et email admin
- Bouton de déconnexion
- 4 cartes de statistiques :
  - Commandes aujourd'hui
  - Revenus du jour
  - Clients actifs
  - Commandes en attente
- Actions rapides (4 boutons)
- Liste des commandes récentes
- Protection de route (redirection si non authentifié)

**Design :**
- Fond : Gris clair
- Header : Blanc avec bordure
- Cartes : Blanches avec icônes colorées
- Layout : Responsive grid

## 🔄 Flux d'authentification admin

```
1. Admin va sur /console
   ↓
2. Entre email + mot de passe
   ↓
3. Clique sur "Se connecter"
   ↓
4. Vérification des credentials (API TODO)
   ↓
5. Si correct: sessionStorage + redirection /admin/dashboard
   ↓
6. Si incorrect: message d'erreur
```

## 💾 Stockage

### sessionStorage
```typescript
// État admin
sessionStorage.setItem('isAdmin', 'true');

// Email admin
sessionStorage.setItem('adminEmail', email);
```

### Protection des routes
```typescript
// Dans chaque page admin
useEffect(() => {
  const isAdmin = sessionStorage.getItem('isAdmin');
  if (!isAdmin || isAdmin !== 'true') {
    router.push('/console');
  }
}, [router]);
```

## 🎨 Design

### Console (/console)
- **Thème** : Sombre (gradient gris/noir)
- **Carte** : Backdrop-blur + bordure grise
- **Inputs** : Fond gris foncé avec icônes
- **Bouton** : Couleur primaire (orange)
- **Icônes** : Cadenas, email, mot de passe, œil

### Dashboard (/admin/dashboard)
- **Thème** : Clair (fond gris)
- **Header** : Blanc sticky
- **Cartes stats** : Blanches avec icônes colorées
  - Bleu : Commandes
  - Vert : Revenus
  - Violet : Clients
  - Orange : En attente
- **Actions** : Boutons avec hover orange

## 🔮 Intégration API (TODO)

### Endpoints à créer

#### 1. Login admin
```typescript
POST /api/admin/login
Body: {
  email: string
  password: string
}
Response: {
  success: boolean
  token?: string  // JWT
  admin?: {
    id: string
    email: string
    name: string
    role: string
  }
}
```

#### 2. Vérifier session
```typescript
GET /api/admin/verify
Headers: {
  Authorization: Bearer <token>
}
Response: {
  valid: boolean
  admin?: AdminData
}
```

#### 3. Logout
```typescript
POST /api/admin/logout
Headers: {
  Authorization: Bearer <token>
}
Response: {
  success: boolean
}
```

### Base de données

#### Table admins
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

#### Hasher les mots de passe
```typescript
import bcrypt from 'bcrypt';

// Créer un admin
const hashedPassword = await bcrypt.hash(password, 10);

// Vérifier le mot de passe
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 🔐 Sécurité

### Implémenté
- ✅ Validation email
- ✅ Mot de passe masqué
- ✅ sessionStorage (pas localStorage)
- ✅ Protection des routes admin
- ✅ Design différencié (évite confusion)

### À ajouter en production
- [ ] JWT pour authentification
- [ ] Refresh tokens
- [ ] Rate limiting (limiter les tentatives)
- [ ] 2FA (authentification à deux facteurs)
- [ ] Logs des connexions admin
- [ ] IP whitelisting (optionnel)
- [ ] Expiration de session
- [ ] HTTPS obligatoire
- [ ] Protection CSRF
- [ ] Hashage bcrypt des mots de passe

### Recommandations de sécurité

```typescript
// Mot de passe fort requis
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Limiter les tentatives
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Expiration de session
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 heures
```

## 📊 Dashboard

### Statistiques affichées
1. **Commandes aujourd'hui** - Nombre de commandes du jour
2. **Revenus du jour** - Total des paiements en FCFA
3. **Clients actifs** - Nombre de clients avec commandes
4. **Commandes en attente** - Commandes non livrées

### Actions rapides
1. **Nouvelle commande** - Créer une commande manuellement
2. **Ajouter un plat** - Gérer le menu
3. **Voir les rapports** - Statistiques détaillées
4. **Paramètres** - Configuration de l'app

### Commandes récentes
- Liste des dernières commandes
- Détails : Client, plat, heure, statut
- Actions : Voir détails, marquer comme livrée

## 🚀 Prochaines étapes

### Phase 1 : Backend (Prioritaire)
- [ ] Créer les endpoints API
- [ ] Base de données pour les admins
- [ ] Hashage des mots de passe (bcrypt)
- [ ] JWT pour l'authentification

### Phase 2 : Dashboard fonctionnel
- [ ] Récupérer les vraies statistiques
- [ ] Liste des commandes avec données réelles
- [ ] Filtres et recherche
- [ ] Export des données (CSV, PDF)

### Phase 3 : Gestion complète
- [ ] CRUD commandes
- [ ] CRUD plats/menu
- [ ] CRUD clients
- [ ] Gestion des paiements
- [ ] Notifications

### Phase 4 : Sécurité avancée
- [ ] 2FA (Google Authenticator)
- [ ] Logs d'activité admin
- [ ] Rôles et permissions (admin, manager, viewer)
- [ ] Audit trail

## 🧪 Tests

### Tester le flux complet

1. **Connexion**
   ```
   - Allez sur /console
   - Email: admin@andunu.com
   - Mot de passe: admin123
   - Cliquez sur "Se connecter"
   ```

2. **Dashboard**
   ```
   - Vérifiez l'affichage des stats
   - Testez les actions rapides
   - Cliquez sur "Déconnexion"
   ```

3. **Protection**
   ```
   - Essayez d'accéder à /admin/dashboard sans être connecté
   - Vous devez être redirigé vers /console
   ```

## 📱 Responsive

- ✅ Mobile : Layout vertical
- ✅ Tablet : Grid 2 colonnes
- ✅ Desktop : Grid 4 colonnes
- ✅ Header sticky sur scroll

## 🎨 Personnalisation

### Changer le nom de la console
```typescript
// Renommer le dossier
mv app/console app/votre-nom

// Mettre à jour les liens
router.push('/votre-nom');
```

### Changer les couleurs
```css
/* Console - Thème sombre */
bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900

/* Dashboard - Thème clair */
bg-gray-50
```

## 🔒 Bonnes pratiques

1. **Ne jamais exposer l'URL** de la console publiquement
2. **Utiliser HTTPS** en production
3. **Mots de passe forts** obligatoires
4. **Logs des actions** admin
5. **Backup régulier** de la base de données
6. **2FA** pour les admins principaux
7. **IP whitelisting** si possible
8. **Session timeout** après inactivité

## 📞 Support

En cas de problème :
1. Vérifier les credentials
2. Vérifier sessionStorage dans DevTools
3. Vérifier les logs de la console
4. Tester en mode incognito

---

**Note** : La console admin est actuellement fonctionnelle côté frontend. L'intégration backend avec base de données et authentification JWT est nécessaire pour la production.

## 🎊 Résumé

- ✅ Page de connexion admin sécurisée (`/console`)
- ✅ Dashboard avec statistiques
- ✅ Protection des routes
- ✅ Design professionnel et différencié
- ✅ Déconnexion fonctionnelle
- ⚠️ Backend à implémenter pour production
