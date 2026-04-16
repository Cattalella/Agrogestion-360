const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Successfully connected to the database');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.stack);
  }
}

testConnection();
