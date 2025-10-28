# 🔐 Système d'authentification - Andunu

## 📋 Vue d'ensemble

Système d'authentification par OTP (One-Time Password) via SMS pour sécuriser l'accès à l'application.

## 🎯 Fonctionnalités

### Page Login (`/login`)
- ✅ Logo Andunu
- ✅ Input pour numéro de téléphone avec validation
- ✅ Composant PhoneInput réutilisé
- ✅ Bouton avec état de chargement (Spinner)
- ✅ Messages d'erreur
- ✅ Lien retour vers l'accueil

### Page OTP (`/otp`)
- ✅ 6 inputs pour le code OTP
- ✅ Auto-focus et navigation automatique entre les champs
- ✅ Support du copier-coller
- ✅ Masquage partiel du numéro de téléphone
- ✅ Compte à rebours pour renvoyer le code (60s)
- ✅ Bouton "Renvoyer le code"
- ✅ Vérification automatique quand les 6 chiffres sont entrés
- ✅ Messages d'erreur
- ✅ Lien pour changer de numéro

## 🔄 Flux d'authentification

```
1. Utilisateur va sur /login
   ↓
2. Entre son numéro de téléphone
   ↓
3. Clique sur "Recevoir le code"
   ↓
4. API envoie un OTP par SMS (TODO)
   ↓
5. Numéro sauvegardé dans sessionStorage
   ↓
6. Redirection vers /otp
   ↓
7. Utilisateur entre le code à 6 chiffres
   ↓
8. Vérification automatique ou manuelle
   ↓
9. Si correct: authentification + redirection vers /planifier
   ↓
10. Si incorrect: message d'erreur + réessayer
```

## 💾 Stockage

### sessionStorage
```typescript
// Numéro de téléphone
sessionStorage.setItem('phoneNumber', phone);

// État d'authentification
sessionStorage.setItem('isAuthenticated', 'true');
```

### Pourquoi sessionStorage ?
- ✅ Données disponibles pendant la session
- ✅ Supprimées à la fermeture du navigateur
- ✅ Plus sécurisé que localStorage pour l'auth
- ✅ Pas besoin de JWT pour cette version

## 🎨 Design

### Page Login
- **Layout** : Centré verticalement et horizontalement
- **Logo** : Grande taille (5xl) en couleur primaire
- **Input** : PhoneInput avec bordure arrondie
- **Bouton** : Pleine largeur avec spinner pendant le chargement
- **Responsive** : Adapté mobile et desktop

### Page OTP
- **Inputs** : 6 champs carrés alignés horizontalement
- **Taille** : 56x64px (desktop), 48x56px (mobile)
- **Focus** : Ring primaire sur focus
- **Masquage** : Numéro partiellement masqué (***1234)
- **Countdown** : Affichage du temps restant avant renvoi

## 🔧 Composants utilisés

### Existants
- `PhoneInput` - Input de téléphone avec validation
- `Spinner` - Indicateur de chargement

### Nouveaux
- `/app/login/page.tsx` - Page de connexion
- `/app/otp/page.tsx` - Page de vérification OTP

## 🧪 Tests

### Pour tester le flux complet

1. **Page Login**
   ```
   - Allez sur /login
   - Entrez un numéro: 22997000000
   - Cliquez sur "Recevoir le code"
   ```

2. **Page OTP**
   ```
   - Entrez le code: 123456 (code de test)
   - Ou testez avec un mauvais code
   - Testez le copier-coller
   - Testez le compte à rebours
   ```

3. **Vérifications**
   ```
   - Navigation entre les champs fonctionne
   - Backspace revient au champ précédent
   - Copier-coller remplit tous les champs
   - Vérification auto quand 6 chiffres entrés
   - Redirection vers /planifier si code correct
   ```

## 🔮 Intégration API (TODO)

### Endpoint à créer

#### 1. Envoyer OTP
```typescript
POST /api/auth/send-otp
Body: {
  phone: string
}
Response: {
  success: boolean
  message: string
}
```

#### 2. Vérifier OTP
```typescript
POST /api/auth/verify-otp
Body: {
  phone: string
  otp: string
}
Response: {
  success: boolean
  token?: string  // JWT pour l'authentification
  user?: {
    id: string
    phone: string
    name?: string
  }
}
```

### Services SMS recommandés

#### Option 1 : Twilio
- ✅ Fiable et populaire
- ✅ API simple
- ❌ Coût par SMS

#### Option 2 : Africa's Talking
- ✅ Spécialisé en Afrique
- ✅ Bon support local
- ✅ Prix compétitifs

#### Option 3 : Termii
- ✅ Populaire en Afrique de l'Ouest
- ✅ Support WhatsApp et SMS
- ✅ Dashboard simple

### Exemple d'intégration (Twilio)

```typescript
// app/api/auth/send-otp/route.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  const { phone } = await request.json();
  
  // Générer un code à 6 chiffres
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Sauvegarder l'OTP en base de données avec expiration (5 min)
  // TODO: Implémenter la sauvegarde
  
  // Envoyer le SMS
  await client.messages.create({
    body: `Votre code Andunu: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
  
  return Response.json({ success: true });
}
```

## 🔐 Sécurité

### Bonnes pratiques implémentées
- ✅ Validation du numéro de téléphone
- ✅ Code à 6 chiffres (difficile à deviner)
- ✅ Masquage partiel du numéro
- ✅ sessionStorage (pas localStorage)

### À ajouter en production
- [ ] Rate limiting (limiter les tentatives)
- [ ] Expiration de l'OTP (5-10 minutes)
- [ ] Blocage après X tentatives échouées
- [ ] Logs des tentatives de connexion
- [ ] JWT pour l'authentification persistante
- [ ] HTTPS obligatoire
- [ ] Protection CSRF

### Recommandations
```typescript
// Limiter à 3 tentatives par numéro
const MAX_ATTEMPTS = 3;

// Expiration de l'OTP
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Délai entre deux envois
const RESEND_DELAY = 60 * 1000; // 60 secondes
```

## 📱 UX/UI

### Fonctionnalités UX
- ✅ Auto-focus sur le premier champ
- ✅ Navigation automatique entre les champs
- ✅ Support du copier-coller
- ✅ Backspace intelligent
- ✅ Vérification automatique
- ✅ États de chargement clairs
- ✅ Messages d'erreur explicites
- ✅ Compte à rebours visible

### Accessibilité
- ✅ `inputMode="numeric"` pour clavier numérique mobile
- ✅ Labels appropriés
- ✅ États disabled visibles
- ✅ Contraste des couleurs
- ⚠️ À ajouter: ARIA labels pour screen readers

## 🚀 Prochaines étapes

### Phase 1 : Backend (Prioritaire)
- [ ] Créer les endpoints API
- [ ] Intégrer un service SMS (Twilio/Africa's Talking)
- [ ] Implémenter la génération et validation d'OTP
- [ ] Ajouter une base de données pour stocker les OTP

### Phase 2 : Sécurité
- [ ] Ajouter rate limiting
- [ ] Implémenter JWT
- [ ] Ajouter expiration des OTP
- [ ] Logs et monitoring

### Phase 3 : Fonctionnalités avancées
- [ ] Connexion avec WhatsApp (alternative SMS)
- [ ] "Se souvenir de moi" (cookie sécurisé)
- [ ] Profil utilisateur
- [ ] Historique des commandes

## 📊 État actuel

### ✅ Fonctionnel
- Interface complète (Login + OTP)
- Navigation et UX
- Validation frontend
- Simulation de l'authentification

### ⚠️ En attente
- Intégration API backend
- Service SMS réel
- Base de données
- Sécurité production

## 🧪 Code de test

Pour tester sans API :
- **Code OTP** : `123456`
- **Numéro** : N'importe quel numéro valide

## 📞 Support

Pour intégrer un service SMS :
1. Choisir un provider (Twilio, Africa's Talking, Termii)
2. Créer un compte et obtenir les credentials
3. Créer les endpoints API
4. Tester avec de vrais numéros
5. Déployer en production

---

**Note** : Le système actuel est fonctionnel côté frontend. L'intégration backend avec un vrai service SMS est nécessaire pour la production.
