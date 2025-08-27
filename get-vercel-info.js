const { execSync } = require('child_process');

console.log('🔍 Getting Vercel project information...\n');

try {
  // Check if vercel CLI is installed
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed\n');
  
  // Get project info
  console.log('📋 Current project information:');
  const projectInfo = execSync('vercel project ls --token ' + process.env.VERCEL_TOKEN, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(projectInfo);
  
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('\n📝 Manual steps to get Vercel info:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Click on your project');
  console.log('3. Go to Settings → General');
  console.log('4. Copy Project ID and Team ID');
  console.log('5. Add them as GitHub secrets:');
  console.log('   - VERCEL_ORG_ID (Team ID)');
  console.log('   - VERCEL_PROJECT_ID (Project ID)');
}
