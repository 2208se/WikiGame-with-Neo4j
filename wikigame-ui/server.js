import express from 'express';
import cors from 'cors';
import neo4j from 'neo4j-driver';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Neo4j configuration
const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '12345678')
);

// API Routes
app.post('/api/path', async (req, res) => {
    const { start, end } = req.body;
    
    try {
        const session = driver.session();
        const result = await session.run(`
            MATCH (start:Subject {title: $start}), (end:Subject {title: $end})
            MATCH path = shortestPath((start)-[:LINKED_TO*]-(end))
            RETURN [node IN nodes(path) | {id: node.id, title: node.title}] AS path,
                   length(path) AS hops
        `, { start, end });

        await session.close();

        if (result.records.length > 0) {
            const record = result.records[0];
            res.json({
                success: true,
                path: record.get('path'),
                hops: record.get('hops').toInt()
            });
        } else {
            res.json({
                success: false,
                error: 'Aucun chemin trouvé entre ces pages'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/search', async (req, res) => {
    const { keyword } = req.body;
    
    try {
        const session = driver.session();
        const result = await session.run(`
            MATCH (s:Subject)
            WHERE toLower(s.title) CONTAINS toLower($keyword)
            RETURN s.id AS id, s.title AS title
            ORDER BY s.pagerank DESC
            LIMIT 10
        `, { keyword });

        await session.close();

        const results = result.records.map(record => ({
            id: record.get('id'),
            title: record.get('title')
        }));

        res.json({
            success: true,
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const session = driver.session();
        
        const nodeCount = await session.run('MATCH (n:Subject) RETURN count(n) AS count');
        const relCount = await session.run('MATCH ()-[r:LINKED_TO]->() RETURN count(r) AS count');
        const maxPR = await session.run('MATCH (s:Subject) RETURN max(s.pagerank) AS maxPagerank');
        
        await session.close();

        res.json({
            success: true,
            stats: {
                nodes: nodeCount.records[0].get('count').toInt(),
                relationships: relCount.records[0].get('count').toInt(),
                maxPagerank: maxPR.records[0].get('maxPagerank')
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`🚀 WikiGame server running at http://localhost:${port}`);
});