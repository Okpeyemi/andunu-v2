import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Andunu',
  description: 'Politique de confidentialité et protection des données personnelles d\'Andunu',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-16 mt-18">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Politique de Confidentialité
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
            <h2 className="text-3xl font-bold text-foreground mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Andunu</strong> (« nous », « notre » ou « nos ») s'engage à protéger et à respecter votre vie privée. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et 
              protégeons vos informations personnelles lorsque vous utilisez notre service de livraison de repas.
            </p>
            <p className="text-gray-700 leading-relaxed">
              En utilisant nos services, vous acceptez les pratiques décrites dans cette politique.
            </p>
          </section>

          {/* Informations collectées */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">2. Informations que nous collectons</h2>
            
            <h3 className="text-2xl font-semibold text-foreground mb-3">2.1 Informations personnelles</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous collectons les informations suivantes lorsque vous utilisez notre service :
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Nom complet</strong> : pour identifier votre commande</li>
              <li><strong>Numéro de téléphone</strong> : pour vous contacter concernant votre livraison et vérifier votre identité via OTP</li>
              <li><strong>Adresse de livraison</strong> : pour effectuer la livraison de vos repas</li>
              <li><strong>Préférences de repas</strong> : pour personnaliser votre service</li>
              <li><strong>Horaires de livraison préférés</strong> : pour planifier vos livraisons</li>
            </ul>

            <h3 className="text-2xl font-semibold text-foreground mb-3">2.2 Informations de paiement</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Les informations de paiement sont traitées de manière sécurisée par notre prestataire de services 
              de paiement, FedaPay. Nous ne stockons pas vos informations de carte bancaire ou de paiement mobile 
              sur nos serveurs.
            </p>

            <h3 className="text-2xl font-semibold text-foreground mb-3">2.3 Cookies et technologies similaires</h3>
            <p className="text-gray-700 leading-relaxed">
              Actuellement, nous n'utilisons pas de cookies ou de technologies de suivi similaires sur notre plateforme.
            </p>
          </section>

          {/* Utilisation des données */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">3. Comment nous utilisons vos informations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous utilisons vos informations personnelles pour :
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Traiter et livrer vos commandes de repas</li>
              <li>Communiquer avec vous concernant vos commandes et livraisons</li>
              <li>Vérifier votre identité via un code OTP envoyé par SMS</li>
              <li>Traiter vos paiements via FedaPay</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Répondre à vos questions et demandes de support</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>

          {/* Partage des données */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">4. Partage de vos informations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous pouvons partager vos informations personnelles avec :
            </p>
            
            <h3 className="text-2xl font-semibold text-foreground mb-3">4.1 Prestataires de services</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>FedaPay</strong> : pour le traitement sécurisé des paiements</li>
              <li><strong>Livreurs partenaires</strong> : pour effectuer la livraison de vos repas</li>
              <li><strong>Fournisseurs de services SMS</strong> : pour l'envoi des codes OTP de vérification</li>
            </ul>

            <h3 className="text-2xl font-semibold text-foreground mb-3">4.2 Obligations légales</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous pouvons divulguer vos informations si la loi l'exige ou en réponse à des demandes légales 
              valides des autorités publiques.
            </p>

            <h3 className="text-2xl font-semibold text-foreground mb-3">4.3 Vente ou transfert d'entreprise</h3>
            <p className="text-gray-700 leading-relaxed">
              En cas de fusion, acquisition ou vente d'actifs, vos informations personnelles peuvent être 
              transférées. Nous vous informerons de tout changement de propriété ou d'utilisation de vos 
              informations personnelles.
            </p>
          </section>

          {/* Protection des données */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">5. Protection de vos informations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous prenons la sécurité de vos données très au sérieux et mettons en œuvre des mesures 
              techniques et organisationnelles appropriées pour protéger vos informations personnelles contre :
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>L'accès non autorisé</li>
              <li>La divulgation</li>
              <li>La modification</li>
              <li>La destruction</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est 
              totalement sécurisée. Nous ne pouvons garantir une sécurité absolue.
            </p>
          </section>

          {/* Conservation des données */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">6. Conservation de vos données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous conservons vos informations personnelles aussi longtemps que nécessaire pour :
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Fournir nos services</li>
              <li>Respecter nos obligations légales et réglementaires</li>
              <li>Résoudre les litiges</li>
              <li>Faire respecter nos accords</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Conformément à la législation béninoise, nous conservons vos données pour une durée maximale 
              de 10 ans, sauf obligation légale contraire.
            </p>
          </section>

          {/* Vos droits */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">7. Vos droits</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conformément à la législation sur la protection des données au Bénin, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Droit d'accès</strong> : vous pouvez demander une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : vous pouvez demander la correction de données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : vous pouvez demander la suppression de vos données</li>
              <li><strong>Droit d'opposition</strong> : vous pouvez vous opposer au traitement de vos données</li>
              <li><strong>Droit à la limitation</strong> : vous pouvez demander la limitation du traitement</li>
              <li><strong>Droit à la portabilité</strong> : vous pouvez demander le transfert de vos données</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Pour exercer ces droits, veuillez nous contacter à l'adresse indiquée dans la section "Contact".
            </p>
          </section>

          {/* Mineurs */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">8. Protection des mineurs</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos services sont destinés aux personnes âgées de 14 ans et plus. Nous ne collectons pas 
              sciemment d'informations personnelles auprès de personnes de moins de 14 ans. Si vous êtes 
              parent ou tuteur et que vous pensez que votre enfant nous a fourni des informations personnelles, 
              veuillez nous contacter immédiatement.
            </p>
          </section>

          {/* Modifications */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">9. Modifications de cette politique</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous 
              informerons de tout changement important en publiant la nouvelle politique sur cette page et 
              en mettant à jour la date de "dernière mise à jour" en haut de cette page. Nous vous encourageons 
              à consulter régulièrement cette politique pour rester informé de la manière dont nous protégeons 
              vos informations.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">10. Nous contacter</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en 
              matière de données, veuillez nous contacter :
            </p>
            <div className="bg-orange-50 border-l-4 border-[var(--primary)] p-6 rounded-r-lg">
              <p className="text-gray-800 mb-2"><strong>Andunu</strong></p>
              <p className="text-gray-700 mb-2">St Michel, Cotonou, Bénin</p>
              <p className="text-gray-700 mb-2">Téléphone : +229 61 91 62 09</p>
              <p className="text-gray-700">Email : <span className="text-gray-500 italic">(à venir)</span></p>
            </div>
          </section>

          {/* Note légale */}
          <section className="mb-12">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong>Note importante :</strong> Cette politique de confidentialité est conforme aux 
                exigences de la législation béninoise en matière de protection des données personnelles. 
                Andunu s'engage à respecter toutes les lois et réglementations applicables en matière de 
                protection de la vie privée.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
