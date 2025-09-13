#!/usr/bin/env node

/**
 * Security Check Script for Korean Safety Chatbot
 * 
 * This script checks for common security issues before deployment:
 * - Hardcoded secrets in code
 * - Missing environment variables
 * - Insecure configurations
 * 
 * Usage: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running security checks...\n');

let hasIssues = false;

// 1. Check for hardcoded secrets in code files
const checkForHardcodedSecrets = () => {
  console.log('1. Checking for hardcoded secrets...');
  
  const sensitivePatterns = [
    /AIzaSy[A-Za-z0-9_-]{33}/g, // Google API keys
    /GOCSPX-[A-Za-z0-9_-]+/g,    // Google OAuth secrets
    /mongodb\+srv:\/\/[^/]+:[^@]+@/g, // MongoDB connection strings
    /sk-[A-Za-z0-9]{48}/g,       // OpenAI API keys
    /"[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com"/g // Google OAuth Client IDs
  ];
  
  const filesToCheck = [
    'vercel.json',
    'DEPLOYMENT.md',
    'README.md',
    'TROUBLESHOOTING.md'
  ];
  
  const excludeFiles = [
    '.env.local',
    '.env.example',
    'scripts/security-check.js'
  ];
  
  let foundSecrets = false;
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      sensitivePatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`   ❌ Found potential secret in ${file}:`);
          matches.forEach(match => {
            console.log(`      - ${match.substring(0, 20)}...`);
          });
          foundSecrets = true;
          hasIssues = true;
        }
      });
    }
  });
  
  if (!foundSecrets) {
    console.log('   ✅ No hardcoded secrets found in documentation files');
  }
};

// 2. Check .env.example completeness
const checkEnvExample = () => {
  console.log('\n2. Checking .env.example completeness...');
  
  const requiredVars = [
    'MONGODB_URI',
    'GEMINI_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'ADMIN_PASSWORD',
    'JWT_SECRET',
    'NODE_ENV'
  ];
  
  if (!fs.existsSync('.env.example')) {
    console.log('   ❌ .env.example file missing');
    hasIssues = true;
    return;
  }
  
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const missingVars = requiredVars.filter(varName => !envExample.includes(varName));
  
  if (missingVars.length > 0) {
    console.log('   ❌ Missing environment variables in .env.example:');
    missingVars.forEach(varName => {
      console.log(`      - ${varName}`);
    });
    hasIssues = true;
  } else {
    console.log('   ✅ All required environment variables documented');
  }
};

// 3. Check vercel.json security
const checkVercelConfig = () => {
  console.log('\n3. Checking vercel.json security...');
  
  if (!fs.existsSync('vercel.json')) {
    console.log('   ℹ️ No vercel.json found');
    return;
  }
  
  const vercelConfig = fs.readFileSync('vercel.json', 'utf8');
  
  // Check if env variables are hardcoded
  if (vercelConfig.includes('"env"') && vercelConfig.includes('GOOGLE_CLIENT')) {
    console.log('   ❌ Environment variables should not be hardcoded in vercel.json');
    console.log('      Use Vercel dashboard to set environment variables instead');
    hasIssues = true;
  } else {
    console.log('   ✅ vercel.json looks secure');
  }
};

// 4. Check .gitignore
const checkGitignore = () => {
  console.log('\n4. Checking .gitignore...');
  
  if (!fs.existsSync('.gitignore')) {
    console.log('   ❌ .gitignore file missing');
    hasIssues = true;
    return;
  }
  
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const requiredEntries = ['.env.local', '.env', 'node_modules'];
  const missingEntries = requiredEntries.filter(entry => !gitignore.includes(entry));
  
  if (missingEntries.length > 0) {
    console.log('   ❌ Missing entries in .gitignore:');
    missingEntries.forEach(entry => {
      console.log(`      - ${entry}`);
    });
    hasIssues = true;
  } else {
    console.log('   ✅ .gitignore properly configured');
  }
};

// 5. Check for .env.local in git
const checkEnvLocalInGit = () => {
  console.log('\n5. Checking if .env.local is tracked by git...');
  
  if (fs.existsSync('.env.local')) {
    // This is a simplified check - in a real scenario, you'd use git commands
    console.log('   ⚠️ .env.local exists - make sure it\'s not tracked by git');
    console.log('      Run: git status to verify it\'s not staged');
  } else {
    console.log('   ✅ No .env.local file found in working directory');
  }
};

// Run all checks
checkForHardcodedSecrets();
checkEnvExample();
checkVercelConfig();
checkGitignore();
checkEnvLocalInGit();

// Summary
console.log('\n' + '='.repeat(50));
if (hasIssues) {
  console.log('❌ Security issues found! Please fix before deployment.');
  console.log('\n📚 See TROUBLESHOOTING.md for detailed resolution steps.');
  process.exit(1);
} else {
  console.log('✅ All security checks passed!');
  console.log('\n🚀 Ready for deployment.');
  process.exit(0);
}