#!/usr/bin/env node

/**
 * 🔐 Korean Safety Chatbot - Secret Generation Tool
 *
 * Purpose: Generate strong, cryptographically secure secrets for rotation
 * Usage: node scripts/generate-secrets.js [type]
 * Types: admin, jwt, mongodb, all
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Secret generation configurations
const SECRET_CONFIGS = {
  ADMIN_PASSWORD: {
    length: 32,
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
    description: 'Admin login password'
  },
  JWT_SECRET: {
    length: 64,
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    description: 'JWT token signing key'
  },
  MONGODB_PASSWORD: {
    length: 24,
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    description: 'MongoDB database password'
  }
};

/**
 * Generate cryptographically secure random string
 * @param {number} length - Length of the generated string
 * @param {string} charset - Character set to use
 * @returns {string} - Generated secure string
 */
function generateSecureSecret(length, charset) {
  let result = '';
  const charsetLength = charset.length;

  // Use crypto.randomBytes for cryptographic security
  const randomBytes = crypto.randomBytes(length * 2); // Extra bytes for better distribution

  for (let i = 0; i < length; i++) {
    // Use modulo with rejection sampling to avoid bias
    let randomIndex;
    do {
      randomIndex = randomBytes[i * 2] * 256 + randomBytes[i * 2 + 1];
    } while (randomIndex >= Math.floor(65536 / charsetLength) * charsetLength);

    result += charset[randomIndex % charsetLength];
  }

  return result;
}

/**
 * Generate all secrets with metadata
 * @returns {Object} - Object containing all generated secrets
 */
function generateAllSecrets() {
  const secrets = {};
  const timestamp = new Date().toISOString();

  console.log('🔐 Generating new secrets...\n');

  for (const [key, config] of Object.entries(SECRET_CONFIGS)) {
    const secret = generateSecureSecret(config.length, config.charset);
    secrets[key] = {
      value: secret,
      generated: timestamp,
      length: config.length,
      description: config.description
    };

    console.log(`✅ ${key}: ${config.description}`);
    console.log(`   Length: ${config.length} characters`);
    console.log(`   Preview: ${secret.substring(0, 8)}...`);
    console.log('');
  }

  return secrets;
}

/**
 * Generate single secret by type
 * @param {string} type - Type of secret to generate
 * @returns {Object|null} - Generated secret object or null if invalid type
 */
function generateSingleSecret(type) {
  const key = type.toUpperCase();
  const config = SECRET_CONFIGS[key];

  if (!config) {
    console.error(`❌ Invalid secret type: ${type}`);
    console.log('Available types: admin, jwt, mongodb');
    return null;
  }

  const secret = generateSecureSecret(config.length, config.charset);
  const timestamp = new Date().toISOString();

  console.log(`🔐 Generated ${key}:`);
  console.log(`Description: ${config.description}`);
  console.log(`Length: ${config.length} characters`);
  console.log(`Value: ${secret}`);
  console.log(`Generated: ${timestamp}`);

  return {
    [key]: {
      value: secret,
      generated: timestamp,
      length: config.length,
      description: config.description
    }
  };
}

/**
 * Save secrets to backup file for rotation tracking
 * @param {Object} secrets - Generated secrets object
 */
function saveSecretsBackup(secrets) {
  const backupDir = path.join(__dirname, '..', 'security-backups');

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('📁 Created security-backups directory');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `secrets-backup-${timestamp}.json`);

  const backupData = {
    generated: new Date().toISOString(),
    secrets: secrets,
    note: 'IMPORTANT: Delete this file after secrets are rotated in production',
    rotation_schedule: {
      next_rotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
      rotation_interval: '90 days'
    }
  };

  try {
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`💾 Backup saved: ${backupFile}`);
    console.log('⚠️  Remember to delete backup file after rotation!');
  } catch (error) {
    console.error('❌ Failed to save backup:', error.message);
  }
}

/**
 * Display rotation instructions
 */
function displayRotationInstructions() {
  console.log('\n📋 Secret Rotation Instructions:');
  console.log('');
  console.log('1. 🔄 Update .env.local file:');
  console.log('   - Copy new secrets to .env.local');
  console.log('   - Test application locally');
  console.log('');
  console.log('2. 🌐 Update Vercel environment variables:');
  console.log('   - vercel env add ADMIN_PASSWORD --prod');
  console.log('   - vercel env add JWT_SECRET --prod');
  console.log('   - Test in preview environment first');
  console.log('');
  console.log('3. 🗄️ Update MongoDB Atlas (if rotating database password):');
  console.log('   - Create new database user with new password');
  console.log('   - Update MONGODB_URI with new credentials');
  console.log('   - Test connection, then remove old user');
  console.log('');
  console.log('4. ✅ Verification:');
  console.log('   - Test all authentication flows');
  console.log('   - Verify admin login works');
  console.log('   - Check database connectivity');
  console.log('');
  console.log('5. 🧹 Cleanup:');
  console.log('   - Delete backup files');
  console.log('   - Update rotation schedule');
  console.log('   - Document rotation completion');
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const type = args[0];

  console.log('🛡️ Korean Safety Chatbot - Secret Generation Tool');
  console.log('===============================================\n');

  if (!type || type === 'all') {
    // Generate all secrets
    const secrets = generateAllSecrets();
    saveSecretsBackup(secrets);
    displayRotationInstructions();
  } else if (type === 'admin') {
    generateSingleSecret('ADMIN_PASSWORD');
  } else if (type === 'jwt') {
    generateSingleSecret('JWT_SECRET');
  } else if (type === 'mongodb') {
    generateSingleSecret('MONGODB_PASSWORD');
  } else if (type === 'help' || type === '-h' || type === '--help') {
    console.log('Usage: node scripts/generate-secrets.js [type]\n');
    console.log('Types:');
    console.log('  all      - Generate all secrets (default)');
    console.log('  admin    - Generate admin password only');
    console.log('  jwt      - Generate JWT secret only');
    console.log('  mongodb  - Generate MongoDB password only');
    console.log('  help     - Show this help message');
  } else {
    console.error(`❌ Unknown command: ${type}`);
    console.log('Use "help" for usage information');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecureSecret,
  generateAllSecrets,
  generateSingleSecret,
  SECRET_CONFIGS
};