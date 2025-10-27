# 🧾 Système de Reçu - Andunu

## 📋 Vue d'ensemble

Le système de reçu permet aux utilisateurs de télécharger un reçu détaillé de leur commande après un paiement réussi.

## 🎯 Fonctionnalités

### ✅ Ce qui est inclus dans le reçu

1. **En-tête Andunu** - Logo et titre
2. **Informations de transaction**
   - Numéro de transaction FedaPay
   - Date et heure de la commande

3. **Informations client**
   - Nom complet
   - Numéro de téléphone

4. **Détails de livraison**
   - Adresse de livraison
   - Créneau horaire choisi

5. **Menu commandé**
   - Liste des jours sélectionnés
   - Plat choisi pour chaque jour

6. **Résumé du paiement**
   - Mode de paiement (par jour/hebdomadaire)
   - Nombre de jours
   - Réduction appliquée (si paiement hebdomadaire)
   - **Montant total payé**

## 🔄 Flux de fonctionnement

```
1. Utilisateur complète le formulaire (Steps 1-7)
   ↓
2. Clique sur "Confirmer" au Step 7
   ↓
3. Les données sont sauvegardées dans localStorage
   ↓
4. Redirection vers FedaPay pour paiement
   ↓
5. Paiement effectué
   ↓
6. Retour sur /payment/callback?id=XXX&status=approved
   ↓
7. Récupération des données depuis localStorage
   ↓
8. Affichage du reçu avec bouton de téléchargement
```

## 💾 Stockage des données

### localStorage
Les données de commande sont stockées temporairement dans `localStorage` sous la clé `orderData` :

```typescript
{
  selectedDays: string[];           // Ex: ["Lundi", "Mercredi", "Vendredi"]
  meals: Record<string, string>;    // Ex: {"Lundi": "Riz sauce", ...}
  location: string;                 // Ex: "Cotonou, Rue 123"
  deliveryTime: string;             // Ex: "12:00 - 13:00"
  userInfo: {
    fullName: string;               // Ex: "Jean Dupont"
    phone: string;                  // Ex: "22997000000"
  };
  paymentOption: 'daily' | 'weekly';
  amount: number;                   // Montant en FCFA
}
```

### Pourquoi localStorage ?
- ✅ Simple et rapide
- ✅ Pas besoin de base de données pour cette version
- ✅ Données disponibles immédiatement après le retour de FedaPay
- ⚠️ Limité au navigateur (les données sont perdues si l'utilisateur change de navigateur)

## 📄 Téléchargement du reçu

### Méthode actuelle : window.print()
Le bouton "Télécharger le reçu" utilise `window.print()` qui :
- Ouvre la boîte de dialogue d'impression du navigateur
- Permet de sauvegarder en PDF
- Fonctionne sur tous les navigateurs
- Ne nécessite pas de bibliothèque externe

### Styles d'impression
Le reçu utilise des classes Tailwind `print:` pour :
- Masquer les boutons lors de l'impression
- Optimiser la mise en page pour le PDF
- Supprimer les ombres et bordures inutiles

## 🎨 Design du reçu

### Structure
- **Format** : A4 optimisé
- **Couleurs** : Noir/gris pour le texte, couleur primaire pour les accents
- **Sections** : Clairement séparées avec des arrière-plans gris clair
- **Icônes** : SVG pour chaque section (client, livraison, menu)

### Responsive
- ✅ Adapté pour mobile et desktop
- ✅ Optimisé pour l'impression
- ✅ Lisible sur tous les écrans

## 🔮 Améliorations futures

### Phase 1 : Base de données
- [ ] Sauvegarder les commandes dans une base de données
- [ ] Récupérer les données depuis l'API au lieu de localStorage
- [ ] Permettre de consulter l'historique des reçus

### Phase 2 : Génération PDF côté serveur
- [ ] Utiliser une bibliothèque comme `jsPDF` ou `react-pdf`
- [ ] Générer le PDF côté serveur
- [ ] Envoyer le reçu par email automatiquement

### Phase 3 : Fonctionnalités avancées
- [ ] QR code sur le reçu (pour vérification)
- [ ] Numéro de commande unique
- [ ] Logo personnalisé
- [ ] Conditions générales au bas du reçu
- [ ] Signature numérique

## 📝 Composants créés

### 1. Receipt.tsx
Composant principal qui affiche le reçu formaté.

**Props :**
```typescript
{
  transactionId: string;
  orderData: OrderData;
}
```

**Fonctionnalités :**
- Affichage formaté de toutes les informations
- Bouton de téléchargement
- Styles d'impression optimisés

### 2. Page callback mise à jour
`/app/payment/callback/page.tsx`

**Modifications :**
- Récupération des données depuis localStorage
- Affichage conditionnel du reçu si paiement réussi
- Pas de redirection automatique pour permettre le téléchargement

### 3. Step7Payment mis à jour
`/components/planning/Step7Payment.tsx`

**Modifications :**
- Sauvegarde des données dans localStorage avant redirection FedaPay
- Données incluent tout ce qui est nécessaire pour le reçu

## 🧪 Tests

### Tester le flux complet

1. **Remplir le formulaire**
   ```
   - Allez sur /planifier
   - Remplissez les 7 étapes
   - Choisissez un mode de paiement
   ```

2. **Effectuer le paiement**
   ```
   - Utilisez le numéro de test : 64000001
   - Validez le paiement sur FedaPay
   ```

3. **Vérifier le reçu**
   ```
   - Vous êtes redirigé vers /payment/callback
   - Le reçu s'affiche automatiquement
   - Cliquez sur "Télécharger le reçu"
   - Vérifiez que toutes les informations sont correctes
   ```

### Vérifications
- ✅ Toutes les informations sont présentes
- ✅ Le montant est correct
- ✅ La réduction est appliquée (si hebdomadaire)
- ✅ Le PDF est bien formaté
- ✅ Les données correspondent à la commande

## 🔐 Sécurité

### Données sensibles
- ❌ Pas de numéro de carte bancaire (géré par FedaPay)
- ✅ Seulement les informations de commande
- ✅ Données stockées temporairement (localStorage)

### Recommandations
- En production, utilisez une base de données
- Ajoutez une authentification pour l'historique
- Chiffrez les données sensibles si nécessaire

## 📞 Support

Si l'utilisateur perd son reçu :
1. **Version actuelle** : Il peut refaire le paiement (pas idéal)
2. **Version future** : Connexion à son compte pour retrouver l'historique

## 🎊 Résumé

Le système de reçu est maintenant opérationnel ! Les utilisateurs peuvent :
- ✅ Voir un reçu détaillé après paiement
- ✅ Télécharger le reçu en PDF
- ✅ Avoir toutes les informations de leur commande
- ✅ Conserver une preuve de paiement

---

**Note** : Pour une version production complète, il est recommandé d'implémenter une base de données et un système d'envoi d'email automatique du reçu.
