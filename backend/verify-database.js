const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkDatabase() {
    console.log('═══════════════════════════════════════════════');
    console.log('📊 DATABASE VERIFICATION');
    console.log('═══════════════════════════════════════════════\n');
    
    try {
        // Connection details
        console.log('🔌 Connection Details:');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   User: ${process.env.DB_USER}`);
        console.log(`   Port: ${process.env.DB_PORT}`);
        console.log('');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Database connection successful!\n');
        
        // Check tables
        console.log('📋 TABLES:');
        const [tables] = await connection.execute('SHOW TABLES');
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`   ${index + 1}. ${tableName}`);
        });
        console.log(`   Total: ${tables.length} tables\n`);
        
        // Check users
        console.log('👥 USERS:');
        const [users] = await connection.execute('SELECT id, email, full_name, role, is_verified, verification_status, created_at FROM users');
        console.table(users);
        console.log(`   Total users: ${users.length}\n`);
        
        // Check templates
        console.log('📄 TEMPLATES:');
        const [templates] = await connection.execute('SELECT id, name, category, is_active FROM templates');
        console.table(templates);
        console.log(`   Total templates: ${templates.length}\n`);
        
        // Check documents
        console.log('📝 DOCUMENTS:');
        const [documents] = await connection.execute('SELECT COUNT(*) as count FROM documents');
        console.log(`   Total documents: ${documents[0].count}\n`);
        
        // Check verifications
        console.log('🔐 VERIFICATIONS:');
        const [verifications] = await connection.execute('SELECT COUNT(*) as count FROM verifications');
        console.log(`   Total verifications: ${verifications[0].count}\n`);
        
        // Check views
        console.log('📊 VIEWS:');
        const [views] = await connection.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
        views.forEach((view, index) => {
            const viewName = Object.values(view)[0];
            console.log(`   ${index + 1}. ${viewName}`);
        });
        console.log(`   Total: ${views.length} views\n`);
        
        // Check indexes
        console.log('🔍 KEY INDEXES:');
        const [indexes] = await connection.execute("SHOW INDEX FROM users WHERE Key_name != 'PRIMARY'");
        console.log(`   Users table indexes: ${indexes.length}`);
        
        console.log('\n✅ Database structure verified successfully!');
        
        await connection.end();
        
    } catch (error) {
        console.error('\n❌ Database check failed:', error.message);
        console.error('Error code:', error.code);
        process.exit(1);
    }
}

checkDatabase();
