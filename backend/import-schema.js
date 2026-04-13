const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function importSchema() {
    console.log('🔄 Connecting to FreeSQLDatabase...');
    
    let connection;
    try {
        // Create connection
        const useSsl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true,
            connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000),
            ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
        });

        console.log('✅ Connected to database successfully!');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        console.log('');

        // Read schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        console.log('📖 Reading schema file...');
        const schema = await fs.readFile(schemaPath, 'utf8');

        console.log('🚀 Executing complete schema...');
        console.log('');

        // Execute the entire schema as one statement (multipleStatements: true allows this)
        try {
            await connection.query(schema);
            console.log('✅ All tables and data created successfully!');
        } catch (error) {
            console.error('❌ Error executing schema:', error.message);
            throw error;
        }

        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('✅ Schema import completed successfully!');
        console.log('═══════════════════════════════════════════════');
        console.log('');
        console.log('🎉 Your database is ready!');
        console.log('');
        console.log('Default admin account:');
        console.log('   Email: admin@system.com');
        console.log('   Password: Admin@123');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ Import failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.errno);
        console.error('');
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            console.error('⚠️  Cannot connect to database. Please check:');
            console.error('   - Database host is correct:', process.env.DB_HOST);
            console.error('   - Database credentials are correct');
            console.error('   - Database is accessible from your IP');
            console.error('   - You may need to whitelist your IP in FreeSQLDatabase control panel');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('⚠️  Access denied. Please check:');
            console.error('   - DB_USER is correct');
            console.error('   - DB_PASSWORD is correct');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('⚠️  Database does not exist. Please check:');
            console.error('   - DB_NAME is correct');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run import
importSchema();
