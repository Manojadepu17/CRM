const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');
        
        const [users] = await connection.execute('SELECT id, email, role, is_verified FROM users');
        
        console.log('\n📋 Users in database:');
        console.table(users);
        
        const [admin] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@system.com']);
        
        if (admin.length > 0) {
            console.log('\n✅ Admin user found:');
            console.log('Email:', admin[0].email);
            console.log('Role:', admin[0].role);
            console.log('Verified:', admin[0].is_verified);
            console.log('Password hash (first 20 chars):', admin[0].password.substring(0, 20) + '...');
        } else {
            console.log('\n❌ Admin user not found!');
        }
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAdmin();
