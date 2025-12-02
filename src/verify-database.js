import { sequelize } from './config/database.config.js';

async function verifyDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection successful');
    
    // Query tables
    const [resourceData] = await sequelize.query('SELECT * FROM resource_data');
    const [resources] = await sequelize.query('SELECT * FROM resources');
    const [changeHistory] = await sequelize.query('SELECT * FROM change_history');
    
    console.log('\n--- RESOURCE DATA ---');
    console.log(`Total records: ${resourceData.length}`);
    resourceData.forEach(r => console.log(`  - ${r.name} (${r.category})`));
    
    console.log('\n--- RESOURCES ---');
    console.log(`Total records: ${resources.length}`);
    resources.forEach(r => console.log(`  - ID ${r.id}: Quantity ${r.quantity}`));
    
    console.log('\n--- CHANGE HISTORY ---');
    console.log(`Total records: ${changeHistory.length}`);
    
    console.log('\nDatabase verification complete');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
