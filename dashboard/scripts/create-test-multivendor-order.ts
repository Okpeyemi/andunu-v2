import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestOrder() {
    console.log('🚀 Création d\'une commande test avec vendeurs par jour...\n');

    // 1. Récupérer des vendeurs actifs
    const { data: vendeurs } = await supabase
        .from('vendeurs')
        .select('id, nom_complet')
        .eq('actif', true)
        .limit(2);

    if (!vendeurs || vendeurs.length < 2) {
        console.error('❌ Il faut au moins 2 vendeurs actifs pour ce test');
        return;
    }

    const [vendeur1, vendeur2] = vendeurs;
    console.log(`Vendeurs sélectionnés:`);
    console.log(`- ${vendeur1.nom_complet} (${vendeur1.id})`);
    console.log(`- ${vendeur2.nom_complet} (${vendeur2.id})`);

    // 2. Créer la commande
    const commande = {
        client_nom: "Test Multi-Vendeurs",
        client_telephone: "770000000",
        adresse_livraison: "Dakar, Test",
        heure_livraison: "12:00",
        jours_selectionnes: ["Lundi", "Mardi"],
        repas: {
            "Lundi": { mainDish: "Repas Vendeur 1", ingredients: [] },
            "Mardi": { mainDish: "Repas Vendeur 2", ingredients: [] }
        },
        mode_paiement: "daily",
        statut_paiement: "pending",
        montant_total: 5000,
        statut: "en_attente",
        // Mapping manuel pour le test
        vendeurs_par_jour: {
            "Lundi": vendeur1.id,
            "Mardi": vendeur2.id
        },
        // Pour compatibilité, on met le premier vendeur
        vendeur_id: vendeur1.id
    };

    const { data, error } = await supabase
        .from('commandes')
        .insert(commande)
        .select()
        .single();

    if (error) {
        console.error('❌ Erreur lors de la création:', error.message);
        return;
    }

    console.log('\n✅ Commande créée avec succès!');
    console.log(`ID: ${data.id}`);
    console.log('Vendeurs par jour:', JSON.stringify(data.vendeurs_par_jour, null, 2));

    console.log('\n👉 Allez sur /orders pour voir le résultat:');
    console.log('   - La colonne Vendeur devrait afficher "2 vendeurs"');
    console.log('   - Le détail devrait montrer le tableau des vendeurs');
}

createTestOrder().catch(console.error);
