# 🚀 Guide de Configuration FedaPay - Andunu

## ✅ Étapes de configuration rapide

### 1️⃣ Créer un compte FedaPay

1. Allez sur [https://fedapay.com](https://fedapay.com)
2. Créez un compte
3. Vérifiez votre email
4. Connectez-vous à votre tableau de bord

### 2️⃣ Obtenir vos clés API

1. Dans le tableau de bord FedaPay, allez dans **Paramètres**
2. Cliquez sur **API**
3. Vous verrez deux environnements :
   - **Sandbox** (pour les tests)
   - **Live** (pour la production)

4. Copiez vos clés **Sandbox** :
   - Secret Key (commence par `sk_sandbox_...`)
   - Public Key (commence par `pk_sandbox_...`)

### 3️⃣ Configurer les variables d'environnement

Ouvrez le fichier `.env.local` et remplacez les valeurs :

```env
# Remplacez ces valeurs par vos vraies clés
FEDAPAY_SECRET_KEY=sk_sandbox_votre_cle_secrete_ici
FEDAPAY_PUBLIC_KEY=pk_sandbox_votre_cle_publique_ici
FEDAPAY_ENVIRONMENT=sandbox
NEXT_PUBLIC_FEDAPAY_CALLBACK_URL=http://localhost:3000/payment/callback
```

### 4️⃣ Tester l'intégration

1. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Allez sur [http://localhost:3000/planifier](http://localhost:3000/planifier)

3. Remplissez le formulaire :
   - Sélectionnez des jours
   - Choisissez des plats
   - Entrez une adresse
   - Choisissez une heure
   - Entrez vos informations
   - Choisissez un mode de paiement

4. Cliquez sur **Confirmer**

5. Vous serez redirigé vers la page de paiement FedaPay (sandbox)

6. Utilisez ces données de test :
   - **Numéro** : `64000001`
   - **Pays** : Bénin (BJ)
   - Le paiement sera automatiquement approuvé

7. Vérifiez que vous êtes redirigé vers `/payment/callback` avec le statut

## 🧪 Numéros de test (Sandbox)

FedaPay fournit ces numéros pour tester :

| Numéro | Pays | Résultat |
|--------|------|----------|
| 64000001 | Bénin | ✅ Approuvé |
| 64000002 | Bénin | ❌ Décliné |
| 64000003 | Bénin | ⏱️ En attente |

## 🔄 Passer en production

Quand vous êtes prêt pour la production :

1. Obtenez vos clés **Live** depuis FedaPay
2. Mettez à jour `.env.local` (ou configurez sur votre plateforme de déploiement) :
   ```env
   FEDAPAY_SECRET_KEY=sk_live_votre_cle_secrete_ici
   FEDAPAY_PUBLIC_KEY=pk_live_votre_cle_publique_ici
   FEDAPAY_ENVIRONMENT=live
   NEXT_PUBLIC_FEDAPAY_CALLBACK_URL=https://andunu.com/payment/callback
   ```

3. Déployez votre application

4. Testez avec de vrais paiements (petits montants d'abord)

## ⚠️ Important

- ❌ **NE JAMAIS** committer vos clés API dans Git
- ✅ Les clés sont déjà dans `.gitignore`
- ✅ Utilisez toujours **Sandbox** pour les tests
- ✅ Vérifiez que le callback URL est accessible publiquement en production

## 📊 Vérifier les transactions

1. Connectez-vous à [https://app.fedapay.com](https://app.fedapay.com)
2. Allez dans **Transactions**
3. Vous verrez toutes vos transactions avec leurs statuts

## 🆘 Problèmes courants

### Erreur : "Configuration FedaPay manquante"
➡️ Vérifiez que `FEDAPAY_SECRET_KEY` est bien défini dans `.env.local`

### Erreur : "Unauthorized"
➡️ Vérifiez que votre clé API est correcte et correspond à l'environnement (sandbox/live)

### Le callback ne fonctionne pas
➡️ Vérifiez que `NEXT_PUBLIC_FEDAPAY_CALLBACK_URL` pointe vers la bonne URL

### Paiement bloqué sur "pending"
➡️ En sandbox, utilisez les numéros de test fournis par FedaPay

## 📞 Support

- **Documentation** : [https://docs.fedapay.com](https://docs.fedapay.com)
- **Email** : support@fedapay.com
- **Téléphone** : Consultez le site FedaPay pour les numéros de support

## ✨ Fonctionnalités implémentées

- ✅ Création de transaction
- ✅ Génération de token de paiement
- ✅ Redirection vers page de paiement
- ✅ Gestion du callback (succès/échec)
- ✅ Métadonnées personnalisées (commande, plats, etc.)
- ✅ Deux modes de paiement (par jour/hebdomadaire)
- ✅ Calcul automatique avec réduction

## 🎯 Prochaines étapes (optionnel)

- [ ] Configurer les webhooks pour les notifications en temps réel
- [ ] Ajouter un système de gestion des commandes
- [ ] Envoyer des emails de confirmation
- [ ] Créer un tableau de bord admin
- [ ] Implémenter les remboursements

---

**Besoin d'aide ?** Consultez `FEDAPAY_INTEGRATION.md` pour plus de détails techniques.
