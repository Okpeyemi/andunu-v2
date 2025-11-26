import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const repas = [
    { name: 'Atassi', price: 400 },
    { name: 'Atieke', price: 400 },
    { name: 'Telibo', price: 400 },
    { name: 'Riz créole', price: 400 },
    { name: 'Agoun', price: 400 },
];

const accompagnementsNames = ['Frite', 'Alloco', 'Aileron', 'Poulet', 'Poisson', 'Fromage', 'Oeuf'];

async function addRepasWithAccompagnements() {
    console.log('🚀 Ajout des repas et associations...\n');

    // ÉTAPE 1: Récupérer tous les accompagnements
    console.log('📋 Récupération des accompagnements...');
    const { data: accompagnements, error: accompagnementsError } = await supabase
        .from('accompagnements')
        .select('id, name')
        .in('name', accompagnementsNames);

    if (accompagnementsError) {
        console.error('❌ Erreur lors de la récupération des accompagnements:', accompagnementsError.message);
        return;
    }

    if (!accompagnements || accompagnements.length === 0) {
        console.error('❌ Aucun accompagnement trouvé. Veuillez d\'abord exécuter le script add-accompagnements.ts');
        return;
    }

    console.log(`✅ ${accompagnements.length} accompagnements trouvés\n`);

    // ÉTAPE 2: Ajouter les repas
    console.log('🍽️  Ajout des repas...');
    const repasIds: { [name: string]: string } = {};

    for (const r of repas) {
        try {
            // Vérifier si le repas existe déjà
            const { data: existing, error: checkError } = await supabase
                .from('repas')
                .select('id, name')
                .eq('name', r.name)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error(`❌ Erreur lors de la vérification de "${r.name}":`, checkError.message);
                continue;
            }

            if (existing) {
                // Mettre à jour le repas existant
                const { error: updateError } = await supabase
                    .from('repas')
                    .update({
                        prices: [r.price],
                        disponible: true,
                    })
                    .eq('id', existing.id);

                if (updateError) {
                    console.error(`❌ Erreur lors de la mise à jour de "${r.name}":`, updateError.message);
                } else {
                    repasIds[r.name] = existing.id;
                    console.log(`✅ "${r.name}" mis à jour (${r.price} FCFA)`);
                }
            } else {
                // Créer un nouveau repas
                const { data: newRepas, error: insertError } = await supabase
                    .from('repas')
                    .insert([{
                        name: r.name,
                        prices: [r.price],
                        disponible: true,
                    }])
                    .select()
                    .single();

                if (insertError) {
                    console.error(`❌ Erreur lors de l'ajout de "${r.name}":`, insertError.message);
                } else if (newRepas) {
                    repasIds[r.name] = newRepas.id;
                    console.log(`✅ "${r.name}" ajouté (${r.price} FCFA)`);
                }
            }
        } catch (err) {
            console.error(`❌ Erreur inattendue pour "${r.name}":`, err);
        }
    }

    console.log(`\n🔗 Création des associations repas-accompagnements...\n`);

    // ÉTAPE 3: Créer les associations
    for (const repasName in repasIds) {
        const repasId = repasIds[repasName];
        let successCount = 0;

        // Supprimer les anciennes associations
        await supabase
            .from('repas_accompagnements')
            .delete()
            .eq('repas_id', repasId);

        // Créer les nouvelles associations
        for (const acc of accompagnements) {
            const { error: assocError } = await supabase
                .from('repas_accompagnements')
                .insert([{
                    repas_id: repasId,
                    accompagnement_id: acc.id,
                }]);

            if (assocError) {
                console.error(`  ❌ Erreur association "${repasName}" - "${acc.name}":`, assocError.message);
            } else {
                successCount++;
            }
        }

        console.log(`✅ "${repasName}" associé à ${successCount}/${accompagnements.length} accompagnements`);
    }

    // ÉTAPE 4: Afficher le récapitulatif
    console.log('\n📊 Récapitulatif final:\n');

    const { data: allRepas, error: listError } = await supabase
        .from('repas')
        .select(`
      id,
      name,
      prices,
      disponible
    `)
        .in('name', repas.map(r => r.name))
        .order('name', { ascending: true });

    if (listError) {
        console.error('❌ Erreur lors de la récupération des repas:', listError.message);
    } else if (allRepas) {
        for (const r of allRepas) {
            // Compter les accompagnements associés
            const { count } = await supabase
                .from('repas_accompagnements')
                .select('*', { count: 'exact', head: true })
                .eq('repas_id', r.id);

            console.log(`📍 ${r.name}`);
            console.log(`   Prix: ${r.prices[0]} FCFA`);
            console.log(`   Accompagnements: ${count || 0}`);
            console.log(`   Disponible: ${r.disponible ? '✓' : '✗'}`);
            console.log('');
        }
    }

    console.log('✨ Script terminé!');
}

addRepasWithAccompagnements().catch(console.error);
