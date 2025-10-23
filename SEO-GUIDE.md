# Guide SEO - Andunu

## 📋 Configuration SEO Complète

Ce projet utilise les fonctionnalités SEO natives de Next.js 14+ pour optimiser le référencement.

## ✅ Éléments Implémentés

### 1. **Métadonnées de Base** (`app/layout.tsx`)
- ✅ Titre avec template dynamique
- ✅ Description optimisée (155 caractères)
- ✅ Mots-clés pertinents
- ✅ Auteurs et créateurs
- ✅ URL canonique

### 2. **Open Graph** (Facebook, LinkedIn)
- ✅ Type de contenu : website
- ✅ Locale : fr_FR
- ✅ Image OG (1200x630px)
- ✅ Titre et description optimisés
- ✅ Site name

### 3. **Twitter Cards**
- ✅ Type : summary_large_image
- ✅ Image Twitter (1200x630px)
- ✅ Handle Twitter : @andunu
- ✅ Titre et description

### 4. **Robots & Indexation**
- ✅ Fichier `robots.ts` généré automatiquement
- ✅ Règles pour tous les user agents
- ✅ Disallow pour /api/ et /admin/
- ✅ Configuration GoogleBot optimisée

### 5. **Sitemap XML** (`app/sitemap.ts`)
- ✅ Génération automatique
- ✅ Fréquence de changement
- ✅ Priorités définies
- ✅ Sections principales incluses

### 6. **Web App Manifest** (`app/manifest.ts`)
- ✅ PWA ready
- ✅ Icônes 192x192 et 512x512
- ✅ Couleurs de thème
- ✅ Mode standalone

### 7. **Données Structurées (JSON-LD)**
- ✅ Schema.org WebSite
- ✅ Schema.org Organization
- ✅ Schema.org Service
- ✅ Informations de contact
- ✅ Réseaux sociaux

## 🎯 Actions Requises

### Images SEO à Créer

Placez ces images dans le dossier `/public/` :

1. **`og-image.jpg`** (1200x630px)
   - Image pour Open Graph (Facebook, LinkedIn)
   - Doit contenir le logo et un message clair

2. **`twitter-image.jpg`** (1200x630px)
   - Image pour Twitter Cards
   - Peut être identique à og-image.jpg

3. **`icon-192.png`** (192x192px)
   - Icône PWA petite taille

4. **`icon-512.png`** (512x512px)
   - Icône PWA grande taille

5. **`logo.png`**
   - Logo de l'entreprise pour Schema.org

6. **`favicon.ico`**
   - Favicon du site (32x32px)

### Codes de Vérification

Dans `app/layout.tsx`, ligne 84, remplacez :
```typescript
verification: {
  google: 'votre-code-google-search-console',
}
```

Par votre code réel après avoir vérifié votre site sur :
- Google Search Console
- Bing Webmaster Tools (optionnel)
- Yandex Webmaster (optionnel)

### URL de Base

Dans `app/layout.tsx`, ligne 45, remplacez :
```typescript
metadataBase: new URL('https://andunu.com'),
```

Par votre URL de production réelle.

## 🔍 Vérification SEO

### Outils Recommandés

1. **Google Search Console**
   - Vérifier l'indexation
   - Surveiller les performances
   - Détecter les erreurs

2. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Tester les données structurées

3. **Facebook Sharing Debugger**
   - https://developers.facebook.com/tools/debug/
   - Vérifier les Open Graph tags

4. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Tester les Twitter Cards

5. **Lighthouse (Chrome DevTools)**
   - Score SEO
   - Performance
   - Accessibilité

### Commandes Utiles

```bash
# Vérifier le build
npm run build

# Tester en production locale
npm run start

# Accéder aux fichiers SEO générés
# http://localhost:3000/robots.txt
# http://localhost:3000/sitemap.xml
# http://localhost:3000/manifest.json
```

## 📊 Checklist SEO

- [ ] Images OG/Twitter créées et optimisées
- [ ] Favicon ajouté
- [ ] Code Google Search Console ajouté
- [ ] URL de base configurée
- [ ] Sitemap soumis à Google Search Console
- [ ] Robots.txt vérifié
- [ ] Données structurées testées
- [ ] Open Graph testé sur Facebook
- [ ] Twitter Cards testées
- [ ] Score Lighthouse > 90 en SEO
- [ ] Temps de chargement < 3s
- [ ] Mobile-friendly vérifié

## 🚀 Optimisations Supplémentaires

### Performance
- Images Next.js optimisées (déjà fait avec `next/image`)
- Lazy loading automatique
- Fonts optimisées avec `next/font`

### Accessibilité
- Attributs `alt` sur toutes les images
- Labels ARIA sur les liens sociaux
- Contraste des couleurs vérifié
- Navigation au clavier

### Contenu
- Balises H1, H2, H3 hiérarchisées
- Texte descriptif et unique
- Appels à l'action clairs
- Liens internes cohérents

## 📝 Maintenance

### Mensuelle
- Vérifier les positions dans Google Search Console
- Analyser les requêtes de recherche
- Mettre à jour le contenu si nécessaire

### Trimestrielle
- Audit SEO complet
- Vérifier les backlinks
- Optimiser les pages lentes
- Mettre à jour les mots-clés

## 🔗 Ressources

- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Open Graph Protocol](https://ogp.me/)
