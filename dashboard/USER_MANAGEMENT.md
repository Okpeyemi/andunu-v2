# Gestion des Utilisateurs - Dashboard Andunu

## 📋 Vue d'ensemble

Page complète de gestion des utilisateurs permettant aux super administrateurs de visualiser, filtrer et gérer tous les utilisateurs de la plateforme.

## 🔗 Accès

- **URL**: `/users`
- **Accès**: Réservé aux super_admin uniquement
- **Navigation**: Depuis le dashboard principal → Bouton "Gérer les utilisateurs"

## ✨ Fonctionnalités

### 1. **Liste des utilisateurs**
- Affichage de tous les utilisateurs avec leurs informations
- Colonnes : Utilisateur, Contact, Rôle, Statut, Dernière connexion, Actions
- Design responsive avec tableau scrollable

### 2. **Filtres avancés**

#### 🔍 Recherche textuelle
- Recherche par nom complet
- Recherche par email
- Recherche par numéro de téléphone
- Recherche en temps réel

#### 🎭 Filtre par rôle
- Tous les rôles
- Super Admin
- Client

#### ✅ Filtre par statut
- Tous les statuts
- Actif
- Inactif
- Suspendu

### 3. **Actions de gestion**

#### Pour les comptes **Actifs** :
- ⏸️ **Désactiver le compte** : Passe le statut à `inactive`
- 🚫 **Suspendre le compte** : Passe le statut à `suspended`

#### Pour les comptes **Inactifs** :
- ✅ **Activer le compte** : Passe le statut à `active`

#### Pour les comptes **Suspendus** :
- ✅ **Réactiver le compte** : Passe le statut à `active`

### 4. **Modal de détails**
- Affichage complet des informations utilisateur
- Actions contextuelles selon le statut
- Interface intuitive avec badges colorés

## 🎨 Interface

### Badges de statut
- 🟢 **Actif** : Badge vert
- ⚪ **Inactif** : Badge gris
- 🔴 **Suspendu** : Badge rouge

### Badges de rôle
- 🟣 **Super Admin** : Badge violet
- 🔵 **Client** : Badge bleu

## 🔧 Implémentation technique

### Composants
- **Page principale**: `/app/users/page.tsx`
- **Fonction RPC**: `get_user_email()` pour récupérer les emails depuis `auth.users`

### Sécurité
- Vérification de l'authentification au chargement
- Vérification du rôle super_admin
- Redirection automatique si non autorisé

### État local
```typescript
- users: Liste complète des utilisateurs
- filteredUsers: Liste filtrée selon les critères
- searchTerm: Terme de recherche
- roleFilter: Filtre par rôle
- statusFilter: Filtre par statut
- selectedUser: Utilisateur sélectionné pour le modal
```

### API Supabase
```typescript
// Récupérer tous les profils
supabase.from('profiles').select('*')

// Récupérer l'email d'un utilisateur
supabase.rpc('get_user_email', { user_id })

// Mettre à jour le statut
supabase.from('profiles').update({ status }).eq('id', userId)
```

## 📊 Statistiques affichées
- Nombre total d'utilisateurs trouvés
- Mise à jour en temps réel selon les filtres

## 🚀 Utilisation

### Accéder à la page
1. Connectez-vous en tant que super_admin
2. Depuis le dashboard, cliquez sur "Gérer les utilisateurs"

### Rechercher un utilisateur
1. Utilisez la barre de recherche
2. Tapez le nom, email ou téléphone
3. Les résultats se filtrent automatiquement

### Filtrer par critères
1. Sélectionnez un rôle dans le menu déroulant
2. Sélectionnez un statut dans le menu déroulant
3. Les filtres se combinent avec la recherche

### Gérer un utilisateur
1. Cliquez sur "Gérer" dans la colonne Actions
2. Consultez les informations dans le modal
3. Choisissez l'action appropriée :
   - Activer/Désactiver
   - Suspendre/Réactiver
4. Confirmez l'action

## ⚠️ Notes importantes

1. **Protection des super_admin** : Un super_admin ne peut pas modifier son propre statut
2. **Emails** : Les emails sont récupérés via une fonction RPC car ils sont stockés dans `auth.users`
3. **Temps réel** : Les modifications sont reflétées immédiatement dans la liste
4. **Session** : La vérification de session est effectuée à chaque chargement

## 🔮 Améliorations futures

- [ ] Pagination pour les grandes listes
- [ ] Export des données en CSV
- [ ] Historique des actions admin
- [ ] Modification des informations utilisateur
- [ ] Changement de rôle
- [ ] Suppression de compte (avec confirmation)
- [ ] Envoi d'email de notification
- [ ] Statistiques détaillées par utilisateur
- [ ] Filtres de date (inscription, dernière connexion)
- [ ] Tri des colonnes

## 🐛 Dépannage

### Les emails ne s'affichent pas
- Vérifiez que la fonction `get_user_email()` existe dans Supabase
- Vérifiez les permissions de la fonction

### Erreur "Non authentifié"
- Reconnectez-vous via `/console`
- Vérifiez que vous êtes bien super_admin

### Les modifications ne s'appliquent pas
- Vérifiez les politiques RLS sur la table `profiles`
- Consultez la console du navigateur pour les erreurs

## 📝 Exemple de flux

```
1. Admin se connecte → /console
2. Redirection → / (dashboard)
3. Clic sur "Gérer les utilisateurs" → /users
4. Liste chargée avec tous les utilisateurs
5. Recherche "Jean" → Filtrage automatique
6. Clic sur "Gérer" pour Jean Dupont
7. Modal s'ouvre avec les détails
8. Clic sur "Suspendre le compte"
9. Confirmation → Statut mis à jour
10. Modal se ferme → Liste rafraîchie
```

## 🎯 Objectif

Fournir aux super administrateurs un outil puissant et intuitif pour gérer efficacement tous les utilisateurs de la plateforme Andunu, avec des actions rapides et des filtres avancés.
