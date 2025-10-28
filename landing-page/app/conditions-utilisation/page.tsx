import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Conditions d\'Utilisation | Andunu',
  description: 'Conditions générales d\'utilisation du service de livraison de repas Andunu',
};

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-16 mt-18">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Conditions d'Utilisation
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">1. Acceptation des conditions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bienvenue sur <strong>Andunu</strong> ! En accédant à notre plateforme et en utilisant nos services de livraison 
              de repas, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez 
              pas ces Conditions, veuillez ne pas utiliser nos services.
            </p>
          </section>

          {/* Description du service */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">2. Description du service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Andunu</strong> est un service de livraison de repas permettant de planifier vos repas, choisir vos plats 
              et recevoir vos commandes à domicile. Actuellement disponible à Cotonou, avec expansion prévue 
              dans tout le Bénin.
            </p>
          </section>

          {/* Éligibilité */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">3. Éligibilité</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Pour utiliser nos services, vous devez :</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Avoir au moins 14 ans</li>
              <li>Avoir la capacité légale de conclure un contrat</li>
              <li>Fournir des informations exactes lors de votre inscription</li>
            </ul>
          </section>

          {/* Compte utilisateur */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">4. Compte utilisateur</h2>
            <h3 className="text-2xl font-semibold text-foreground mb-3">4.1 Création et sécurité</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vous devez fournir des informations exactes et protéger la confidentialité de votre compte. 
              Nous utilisons un système de vérification par OTP pour sécuriser votre numéro de téléphone.
            </p>
          </section>

          {/* Commandes et paiements */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">5. Commandes et paiements</h2>
            <h3 className="text-2xl font-semibold text-foreground mb-3">5.1 Prix et paiement</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tous les prix sont en FCFA. Les paiements sont traités par FedaPay (cartes bancaires et Mobile Money). 
              Options : paiement quotidien ou hebdomadaire.
            </p>
          </section>

          {/* Livraison */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">6. Livraison</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Zone actuelle : Cotonou uniquement. Vous devez être disponible pendant le créneau horaire choisi.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-6">
              <p className="text-gray-800 mb-2"><strong>⚠️ Politique en développement</strong></p>
              <p className="text-gray-700">
                Politique concernant les problèmes de livraison à venir. Contactez-nous en cas de problème.
              </p>
            </div>
          </section>

          {/* Annulation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">7. Annulation et remboursement</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="text-gray-800 mb-2"><strong>⚠️ Politique en développement</strong></p>
              <p className="text-gray-700">
                Contactez-nous au +229 61 91 62 09 pour toute demande d'annulation ou de remboursement.
              </p>
            </div>
          </section>

          {/* Utilisation acceptable */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">8. Utilisation acceptable</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Vous acceptez de ne pas :</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Utiliser nos services à des fins illégales</li>
              <li>Fournir des informations fausses</li>
              <li>Interférer avec le fonctionnement de nos services</li>
              <li>Harceler notre personnel ou d'autres utilisateurs</li>
            </ul>
          </section>

          {/* Propriété intellectuelle */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">9. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">
              Tous les contenus (nom, logo, design, code) sont la propriété exclusive d'<strong>Andunu</strong> et protégés 
              par les lois sur la propriété intellectuelle.
            </p>
          </section>

          {/* Limitation de responsabilité */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">10. Limitation de responsabilité</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos services sont fournis « en l'état ». Nous ne sommes pas responsables des dommages indirects 
              ou des pertes de profits résultant de l'utilisation de nos services.
            </p>
          </section>

          {/* Modifications */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">11. Modifications des conditions</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous pouvons modifier ces conditions à tout moment. Les modifications prennent effet dès leur 
              publication. Votre utilisation continue constitue votre acceptation des nouvelles conditions.
            </p>
          </section>

          {/* Résiliation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">12. Résiliation</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous pouvons suspendre ou résilier votre compte en cas de violation de ces conditions. 
              Vous pouvez fermer votre compte à tout moment en nous contactant.
            </p>
          </section>

          {/* Droit applicable */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">13. Droit applicable et juridiction</h2>
            <p className="text-gray-700 leading-relaxed">
              Ces conditions sont régies par les lois de la République du Bénin. Tout litige sera soumis 
              à la juridiction exclusive des tribunaux de Cotonou, Bénin.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">14. Nous contacter</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pour toute question concernant ces conditions :
            </p>
            <div className="bg-orange-50 border-l-4 border-[var(--primary)] p-6 rounded-r-lg">
              <p className="text-gray-800 mb-2"><strong>Andunu</strong></p>
              <p className="text-gray-700 mb-2">St Michel, Cotonou, Bénin</p>
              <p className="text-gray-700 mb-2">Téléphone : +229 61 91 62 09</p>
              <p className="text-gray-700">Email : <span className="text-gray-500 italic">(à venir)</span></p>
            </div>
          </section>

          {/* Lien vers politique de confidentialité */}
          <section className="mb-12">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Document complémentaire</strong>
              </p>
              <p className="text-gray-700">
                Pour en savoir plus sur la protection de vos données personnelles, consultez notre{' '}
                <Link href="/politique-de-confidentialite" className="text-[var(--primary)] hover:underline font-semibold">
                  Politique de Confidentialité
                </Link>.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
