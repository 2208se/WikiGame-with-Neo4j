import neo4j from 'neo4j-driver';

// Configuration de connexion
const uri = "bolt://localhost:7687";
const user = "neo4j";
const password = "12345678";  
const database = "neo4j";

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

class WikiGame {
    constructor() {
        this.session = driver.session({ database });
    }

    async findShortestPath(startTitle, endTitle) {
        try {
            const result = await this.session.run(`
                MATCH (start:Subject {title: $startTitle}), (end:Subject {title: $endTitle})
                MATCH path = shortestPath((start)-[:LINKED_TO*]-(end))
                RETURN [node IN nodes(path) | {id: node.id, title: node.title}] AS path,
                       length(path) AS hops
            `, { startTitle, endTitle });

            if (result.records.length === 0) {
                console.log("❌ Aucun chemin trouvé entre ces pages.");
                return;
            }

            const record = result.records[0];
            const path = record.get('path');
            const hops = record.get('hops').toInt();

            console.log(`\n🎯 Chemin trouvé en ${hops} sauts :`);
            console.log("=" .repeat(50));
            
            path.forEach((node, index) => {
                console.log(`${index + 1}. ${node.title} (ID: ${node.id})`);
                console.log(`   📎 https://fr.wikipedia.org/?curid=${node.id}`);
            });

        } catch (error) {
            console.error("❌ Erreur:", error.message);
        }
    }

    async findMultiplePaths(startTitle, endTitle, maxPaths = 3) {
        try {
            const result = await this.session.run(`
                MATCH (start:Subject {title: $startTitle}), (end:Subject {title: $endTitle})
                MATCH path = (start)-[:LINKED_TO*1..5]-(end)
                RETURN [node IN nodes(path) | node.title] AS path_titles,
                       length(path) AS hops
                ORDER BY hops
                LIMIT $maxPaths
            `, { startTitle, endTitle, maxPaths });

            console.log(`\n🔄 ${result.records.length} chemins alternatifs trouvés :`);
            
            result.records.forEach((record, index) => {
                const path = record.get('path_titles');
                const hops = record.get('hops').toInt();
                console.log(`\nOption ${index + 1} (${hops} sauts):`);
                console.log(path.join(' → '));
            });

        } catch (error) {
            console.error("❌ Erreur:", error.message);
        }
    }

    async searchPages(keyword) {
        try {
            const result = await this.session.run(`
                MATCH (s:Subject)
                WHERE toLower(s.title) CONTAINS toLower($keyword)
                RETURN s.id AS id, s.title AS title
                ORDER BY s.pagerank DESC
                LIMIT 10
            `, { keyword });

            console.log(`\n🔍 Résultats pour "${keyword}":`);
            
            if (result.records.length === 0) {
                console.log("Aucun résultat trouvé.");
                return;
            }

            result.records.forEach(record => {
                console.log(`- ${record.get('title')} (ID: ${record.get('id')})`);
            });

        } catch (error) {
            console.error("❌ Erreur:", error.message);
        }
    }

    async close() {
        await this.session.close();
        await driver.close();
    }
}

// Interface ligne de commande
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    const game = new WikiGame();

    console.log("🎮 WIKIGAME - Trouvez le chemin le plus court entre pages Wikipedia!");
    console.log("=" .repeat(60));

    while (true) {
        console.log("\nOptions:");
        console.log("1. Trouver le chemin le plus court");
        console.log("2. Chercher des pages");
        console.log("3. Quitter");

        const choice = await askQuestion("\nChoisissez une option (1-3): ");

        switch (choice) {
            case '1':
                const start = await askQuestion("Page de départ: ");
                const end = await askQuestion("Page d'arrivée: ");
                await game.findShortestPath(start, end);
                break;

            case '2':
                const keyword = await askQuestion("Mot-clé à rechercher: ");
                await game.searchPages(keyword);
                break;

            case '3':
                console.log("👋 Au revoir!");
                await game.close();
                rl.close();
                return;

            default:
                console.log("❌ Option invalide.");
        }
    }
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Lancement du jeu
main().catch(console.error);