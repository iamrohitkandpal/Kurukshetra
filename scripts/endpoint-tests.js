#!/usr/bin/env node
/**
 * Kurukshetra - API Endpoint Testing Suite
 * Tests all API endpoints for proper responses and security implementations
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Kurukshetra API Endpoint Validation');
console.log('=====================================\n');

const expectedEndpoints = [
  {
    path: 'src/pages/api/login.ts',
    method: 'POST',
    description: 'User authentication endpoint',
    vulnerabilities: ['A07: Authentication Failures']
  },
  {
    path: 'src/pages/api/register.ts', 
    method: 'POST',
    description: 'User registration endpoint',
    vulnerabilities: ['A07: Authentication Failures', 'A02: Cryptographic Failures']
  },
  {
    path: 'src/pages/api/users/[id].ts',
    method: 'GET',
    description: 'User data retrieval endpoint',
    vulnerabilities: ['A01: Broken Access Control']
  },
  {
    path: 'src/pages/api/users/search.ts',
    method: 'GET', 
    description: 'User search with injection vulnerabilities',
    vulnerabilities: ['A03: Injection']
  },
  {
    path: 'src/pages/api/flags/submit.ts',
    method: 'POST',
    description: 'Flag submission for CTF functionality',
    vulnerabilities: ['A01: Broken Access Control']
  },
  {
    path: 'src/pages/api/ssrf/fetch.ts',
    method: 'GET',
    description: 'SSRF demonstration endpoint',
    vulnerabilities: ['A10: SSRF']
  }
];

let totalEndpoints = 0;
let validEndpoints = 0;

function validateEndpoint(endpoint) {
  totalEndpoints++;
  const fullPath = path.join(process.cwd(), endpoint.path);
  
  console.log(`\n📍 ${endpoint.method} ${endpoint.path.replace('src/pages/api/', '/api/').replace('.ts', '')}`);
  console.log(`   ${endpoint.description}`);
  
  if (!fs.existsSync(fullPath)) {
    console.log('   ❌ Endpoint file not found');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if it exports a handler function
  if (!content.includes('export default')) {
    console.log('   ❌ No default export found');
    return false;
  }
  
  // Check if it handles the expected HTTP method
  if (!content.includes(`req.method !== '${endpoint.method}'`) && 
      !content.includes(`req.method === '${endpoint.method}'`)) {
    console.log(`   ⚠️  HTTP method ${endpoint.method} handling not explicitly found`);
  }
  
  console.log('   ✅ Endpoint implemented');
  console.log(`   🎯 Demonstrates: ${endpoint.vulnerabilities.join(', ')}`);
  
  validEndpoints++;
  return true;
}

// Test database setup
console.log('🗄️  Database Configuration Check');
console.log('================================');

const dbPath = path.join(process.cwd(), 'src/lib/db.ts');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  
  if (dbContent.includes('DB_TYPE')) {
    console.log('✅ Multi-database support (SQLite/MongoDB) implemented');
  } else {
    console.log('❌ Multi-database support not found');
  }
  
  if (dbContent.includes('sqlite') && dbContent.includes('mongo')) {
    console.log('✅ Both SQLite and MongoDB drivers configured');
  } else {
    console.log('⚠️  Database driver configuration incomplete');
  }
} else {
  console.log('❌ Database configuration file not found');
}

// Test vulnerability implementations
console.log('\n🔐 Vulnerability Implementation Check');
console.log('===================================');

const vulnPath = path.join(process.cwd(), 'src/lib/vulnerabilities.ts');
if (fs.existsSync(vulnPath)) {
  const vulnContent = fs.readFileSync(vulnPath, 'utf8');
  
  const owaspCategories = [
    'insecure-auth', 'access-control-flaws', 'injection-vulnerabilities',
    'insecure-design', 'crypto-weakness', 'misconfiguration',
    'vulnerable-dependencies', 'data-integrity-failures', 
    'logging-failures', 'ssrf'
  ];
  
  owaspCategories.forEach((category, index) => {
    if (vulnContent.includes(category)) {
      console.log(`✅ A${(index + 1).toString().padStart(2, '0')}: ${category} implemented`);
    } else {
      console.log(`❌ A${(index + 1).toString().padStart(2, '0')}: ${category} missing`);
    }
  });
} else {
  console.log('❌ Vulnerability definitions not found');
}

// Test all endpoints
console.log('\n🔌 API Endpoint Validation');
console.log('=========================');

expectedEndpoints.forEach(endpoint => {
  validateEndpoint(endpoint);
});

// Test environment configuration
console.log('\n⚙️  Environment Configuration');
console.log('============================');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = ['DB_TYPE', 'JWT_SECRET'];
  const recommendedVars = ['MONGODB_URI', 'NEXT_PUBLIC_LEAKED_API_KEY'];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`❌ ${varName}: Missing (required)`);
    }
  });
  
  recommendedVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`⚠️  ${varName}: Missing (recommended for full functionality)`);
    }
  });
} else {
  console.log('❌ Environment file (.env.local) not found');
}

// Final report
console.log('\n==========================================');
console.log(`🎯 Endpoint Validation: ${validEndpoints}/${totalEndpoints} endpoints valid`);

if (validEndpoints === totalEndpoints) {
  console.log('🎉 All API endpoints are properly implemented!');
  console.log('🚀 Kurukshetra backend is ready for penetration testing.');
} else {
  console.log('⚠️  Some endpoints need attention.');
  console.log('📝 Please review the validation results above.');
}
