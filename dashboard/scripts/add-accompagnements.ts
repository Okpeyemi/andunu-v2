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

const accompagnements = [
    { name: 'Frite', price: 300, description: 'Frites croustillantes' },
    { name: 'Alloco', price: 400, description: 'Banane plantain frite' },
    { name: 'Aileron', price: 500, description: 'Aileron de poulet grillé' },
    { name: 'Poulet', price: 800, description: 'Morceau de poulet grillé' },
    { name: 'Poisson', price: 1000, description: 'Poisson grillé ou frit' },
    { name: 'Fromage', price: 350, description: 'Portion de fromage' },
    { name: 'Oeuf', price: 200, description: 'Oeuf dur ou au plat' },
];

async function addAccompagnements() {
    console.log('🚀 Ajout des accompagnements...\n');

    for (const acc of accompagnements) {
        try {
            // Vérifier si l'accompagnement existe déjà
            const { data: existing, error: checkError } = await supabase
                .from('accompagnements')
                .select('id, name')
                .eq('name', acc.name)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error(`❌ Erreur lors de la vérification de "${acc.name}":`, checkError.message);
                continue;
            }

            if (existing) {
                // Mettre à jour l'accompagnement existant
                const { error: updateError } = await supabase
                    .from('accompagnements')
                    .update({
                        price: acc.price,
                        description: acc.description,
                        disponible: true,
                    })
                    .eq('id', existing.id);

                if (updateError) {
                    console.error(`❌ Erreur lors de la mise à jour de "${acc.name}":`, updateError.message);
                } else {
                    console.log(`✅ "${acc.name}" mis à jour (${acc.price} FCFA)`);
                }
            } else {
                // Créer un nouvel accompagnement
                const { error: insertError } = await supabase
                    .from('accompagnements')
                    .insert([{
                        name: acc.name,
                        price: acc.price,
                        description: acc.description,
                        disponible: true,
                    }]);

                if (insertError) {
                    console.error(`❌ Erreur lors de l'ajout de "${acc.name}":`, insertError.message);
                } else {
                    console.log(`✅ "${acc.name}" ajouté (${acc.price} FCFA)`);
                }
            }
        } catch (err) {
            console.error(`❌ Erreur inattendue pour "${acc.name}":`, err);
        }
    }

    console.log('\n📊 Récapitulatif des accompagnements:');

    // Afficher tous les accompagnements
    const { data: allAccompagnements, error: listError } = await supabase
        .from('accompagnements')
        .select('*')
        .order('name', { ascending: true });

    if (listError) {
        console.error('❌ Erreur lors de la récupération des accompagnements:', listError.message);
    } else {
        console.table(allAccompagnements?.map(a => ({
            Nom: a.name,
            Prix: `${a.price} FCFA`,
            Description: a.description,
            Disponible: a.disponible ? '✓' : '✗',
        })));
    }

    console.log('\n✨ Script terminé!');
}

addAccompagnements().catch(console.error);
