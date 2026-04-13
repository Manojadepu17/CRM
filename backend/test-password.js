const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testPassword() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database\n');
        
        const [admin] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@system.com']);
        
        if (admin.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }
        
        console.log('Testing password: Admin@123');
        console.log('Stored hash:', admin[0].password);
        console.log('');
        
        const isMatch = await bcrypt.compare('Admin@123', admin[0].password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('\n❌ Password does not match!');
            console.log('Generating new hash for Admin@123...\n');
            
            const newHash = await bcrypt.hash('Admin@123', 10);
            console.log('New hash:', newHash);
            console.log('\nUpdating admin password...');
            
            await connection.execute('UPDATE users SET password = ? WHERE email = ?', [newHash, 'admin@system.com']);
            console.log('✅ Password updated successfully!');
        } else {
            console.log('\n✅ Password matches! Login should work.');
        }
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testPassword();
