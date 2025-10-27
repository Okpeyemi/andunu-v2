# Intégration FedaPay - Andunu

## 📋 Vue d'ensemble

Cette documentation explique comment l'intégration FedaPay fonctionne dans l'application Andunu pour gérer les paiements.

## 🔧 Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# FedaPay Configuration
FEDAPAY_SECRET_KEY=your-secret-key
FEDAPAY_PUBLIC_KEY=your-public-key
FEDAPAY_ENVIRONMENT=sandbox  # ou 'live' pour la production
NEXT_PUBLIC_FEDAPAY_CALLBACK_URL=http://localhost:3000/payment/callback
```

### 2. Obtenir vos clés API FedaPay

1. Créez un compte sur [FedaPay](https://fedapay.com)
2. Accédez à votre tableau de bord
3. Allez dans **Paramètres > API**
4. Copiez vos clés **Sandbox** pour le développement
5. En production, utilisez vos clés **Live**

## 🏗️ Architecture

### Composants créés

1. **API Route** : `/app/api/payment/create-transaction/route.ts`
   - Crée une transaction FedaPay
   - Génère le token de paiement
   - Retourne l'URL de paiement

2. **Page de callback** : `/app/payment/callback/page.tsx`
   - Gère le retour après paiement
   - Affiche le statut (succès/échec)
   - Redirige l'utilisateur

3. **Step7Payment** : Mis à jour pour intégrer FedaPay
   - Collecte les informations de paiement
   - Appelle l'API pour créer la transaction
   - Redirige vers la page de paiement FedaPay

## 🔄 Flux de paiement

```
1. Utilisateur remplit le formulaire (Steps 1-6)
   ↓
2. Utilisateur choisit le mode de paiement (Step 7)
   ↓
3. Clic sur "Confirmer"
   ↓
4. Appel API : POST /api/payment/create-transaction
   ↓
5. Création de la transaction FedaPay
   ↓
6. Génération du token et URL de paiement
   ↓
7. Redirection vers la page de paiement FedaPay
   ↓
8. Utilisateur effectue le paiement
   ↓
9. FedaPay redirige vers /payment/callback?id=XXX&status=approved
   ↓
10. Affichage du statut et redirection
```

## 💳 Modes de paiement

### Paiement par jour
- Montant : 2000 FCFA/jour
- Paiement immédiat pour un jour

### Paiement hebdomadaire
- Montant : (2000 FCFA × nombre de jours) - 10%
- Réduction de 10% appliquée
- Paiement pour tous les jours sélectionnés

## 📊 Données envoyées à FedaPay

```json
{
  "description": "Commande Andunu - 3 jour(s) - Paiement hebdomadaire",
  "amount": 5400,
  "currency": { "iso": "XOF" },
  "callback_url": "http://localhost:3000/payment/callback",
  "customer": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "22997000000@andunu.com",
    "phone_number": {
      "number": "22997000000",
      "country": "bj"
    }
  },
  "custom_metadata": {
    "selectedDays": "Lundi, Mercredi, Vendredi",
    "meals": "{\"Lundi\":\"Riz sauce\",\"Mercredi\":\"Attiéké poisson\",\"Vendredi\":\"Alloco\"}",
    "location": "Cotonou, Rue 123",
    "deliveryTime": "12:00 - 13:00",
    "paymentOption": "weekly"
  }
}
```

## 🔐 Sécurité

- ✅ Clé secrète stockée côté serveur uniquement
- ✅ Validation des données avant envoi
- ✅ Gestion des erreurs appropriée
- ✅ HTTPS obligatoire en production

## 🧪 Tests

### Mode Sandbox

FedaPay fournit des numéros de test pour le mode sandbox :

- **Numéro de test** : `64000001` (Bénin)
- **Statut** : Tous les paiements sont approuvés automatiquement

### Tester le flux complet

1. Lancez l'application : `npm run dev`
2. Allez sur `/planifier`
3. Remplissez le formulaire (Steps 1-6)
4. Choisissez un mode de paiement
5. Cliquez sur "Confirmer"
6. Vous serez redirigé vers la page de paiement FedaPay (sandbox)
7. Effectuez le paiement avec les données de test
8. Vérifiez le retour sur `/payment/callback`

## 📝 Statuts de transaction

| Statut | Description |
|--------|-------------|
| `pending` | En attente (statut par défaut) |
| `approved` | Paiement réussi ✅ |
| `declined` | Décliné par l'utilisateur |
| `canceled` | Annulé (solde insuffisant) |
| `refunded` | Remboursé |
| `transferred` | Transféré sur le compte marchand |
| `expired` | Expiré (délai dépassé) |

## 🚀 Déploiement en production

1. Obtenez vos clés **Live** depuis FedaPay
2. Mettez à jour les variables d'environnement :
   ```env
   FEDAPAY_SECRET_KEY=your-live-secret-key
   FEDAPAY_PUBLIC_KEY=your-live-public-key
   FEDAPAY_ENVIRONMENT=live
   NEXT_PUBLIC_FEDAPAY_CALLBACK_URL=https://andunu.com/payment/callback
   ```
3. Testez le flux complet en production
4. Configurez les webhooks FedaPay (optionnel mais recommandé)

## 🔔 Webhooks (Optionnel)

Pour recevoir des notifications automatiques sur les changements de statut :

1. Créez une route webhook : `/app/api/webhooks/fedapay/route.ts`
2. Configurez l'URL dans votre tableau de bord FedaPay
3. Vérifiez la signature des webhooks pour la sécurité

## 📞 Support

- **Documentation FedaPay** : https://docs.fedapay.com
- **Support FedaPay** : support@fedapay.com
- **Tableau de bord** : https://app.fedapay.com

## ⚠️ Notes importantes

- Les montants doivent toujours être en **nombre entier** (pas de décimales)
- La devise par défaut est **XOF** (Franc CFA)
- Le callback URL doit être accessible publiquement en production
- Testez toujours en mode sandbox avant de passer en live
