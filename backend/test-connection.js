const { Client } = require('pg');
require('dotenv').config();

console.log('--- EXECUTANDO SCRIPT DE TESTE DE CONEXÃO ISOLADO ---');

// Usa as mesmas variáveis de ambiente do nosso .env
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runTest() {
    try {
        console.log('Tentando conectar ao banco de dados...');
        await client.connect();
        console.log('>>> SUCESSO! Conectado ao banco de dados!');

        console.log('\nBuscando todas as tabelas no esquema "public"...');
        // Este comando pede ao PostgreSQL para listar todas as tabelas que ele conhece no esquema 'public'
        const res = await client.query(`
            SELECT tablename FROM pg_tables WHERE schemaname = 'public';
        `);

        console.log('>>> Tabelas encontradas:');
        // O console.table mostra os resultados em um formato de tabela bonito
        console.table(res.rows);

    } catch (err) {
        console.error('\n!!!!! ERRO NO SCRIPT DE TESTE !!!!!');
        console.error(err);
    } finally {
        // Garante que a conexão será fechada no final, mesmo se der erro.
        console.log('\nFechando conexão.');
        await client.end();
    }
}

runTest();