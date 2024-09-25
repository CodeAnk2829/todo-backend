import express from 'express';
import cors from 'cors';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const client = new Client({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json()); 

async function createConnection() {
    try {
        await client.connect();
        
    } catch(err) {
        throw err;
    }
}

createConnection();

app.get('/todos', async (req, res) => {
    const result = await client.query('SELECT * FROM todos');
    res.json(result.rows);
});

app.post('/todos', async (req, res) => {
    const { task, description } = req.body;
    const result = await client.query(
        'INSERT INTO todos (task, description) VALUES ($1, $2) RETURNING *',
        [task, description]
    );
    res.json(result.rows[0]);
});

app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const result = await client.query(
        'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
        [completed, id]
    );
    res.json(result.rows[0]);
});

app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    await client.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: 'Todo deleted' });
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
