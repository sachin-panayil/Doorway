const { execSync } = require('child_process');
const path = require('path');

async function main() {
  console.log('Starting data update process.');
  
  try {
    execSync('node docs/api/discussions.js', { stdio: 'inherit' });
    execSync('node  docs/api/analytics.js', { stdio: 'inherit' });
    
    console.log('✅ Data update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data update:', error.message);
    process.exit(1);
  }
}

main();