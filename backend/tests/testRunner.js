#!/usr/bin/env node

/**
 * Test Runner Script for Container Management System
 * 
 * Usage:
 *   node tests/testRunner.js                    # Run all tests
 *   node tests/testRunner.js --model            # Run model tests only
 *   node tests/testRunner.js --service          # Run service tests only
 *   node tests/testRunner.js --controller       # Run controller tests only
 *   node tests/testRunner.js --repository       # Run repository tests only
 *   node tests/testRunner.js --coverage         # Run with coverage
 *   node tests/testRunner.js --watch            # Run in watch mode
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(`--${flag}`);

// Test configurations
const testConfigs = {
  all: {
    command: 'npm test',
    description: 'Running all tests...'
  },
  model: {
    command: 'npm test container.test.js',
    description: 'Running model tests...'
  },
  repository: {
    command: 'npm test containerRepository.test.js',
    description: 'Running repository tests...'
  },
  service: {
    command: 'npm test containerService.test.js',
    description: 'Running service tests...'
  },
  controller: {
    command: 'npm test containerController.test.js',
    description: 'Running controller tests...'
  },
  coverage: {
    command: 'npm test -- --coverage',
    description: 'Running tests with coverage report...'
  },
  watch: {
    command: 'npm test -- --watch',
    description: 'Running tests in watch mode...'
  }
};

function printHeader() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Container Management Test Runner              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
}

function printUsage() {
  console.log('Usage:');
  console.log('  node tests/testRunner.js [options]');
  console.log();
  console.log('Options:');
  console.log('  --model       Run model layer tests only');
  console.log('  --repository  Run repository layer tests only');
  console.log('  --service     Run service layer tests only');
  console.log('  --controller  Run controller layer tests only');
  console.log('  --coverage    Run all tests with coverage report');
  console.log('  --watch       Run tests in watch mode');
  console.log('  --help        Show this help message');
  console.log();
}

function printTestSummary() {
  console.log('📋 Available Test Suites:');
  console.log('  • Model Tests (container.test.js) - Direct Mongoose model testing');
  console.log('  • Repository Tests (containerRepository.test.js) - Data access layer');
  console.log('  • Service Tests (containerService.test.js) - Business logic layer');
  console.log('  • Controller Tests (containerController.test.js) - HTTP API endpoints');
  console.log();
}

function runCommand(command, description) {
  try {
    console.log(`🚀 ${description}`);
    console.log(`📝 Command: ${command}`);
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    
    execSync(command, { 
      cwd: rootDir, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('─'.repeat(60));
    console.log(`✅ Tests completed successfully in ${duration}s`);
    
  } catch (error) {
    console.log('─'.repeat(60));
    console.log(`❌ Tests failed with exit code: ${error.status}`);
    process.exit(error.status);
  }
}

function main() {
  printHeader();
  
  // Show help
  if (hasFlag('help') || hasFlag('h')) {
    printUsage();
    printTestSummary();
    return;
  }
  
  // Determine which tests to run
  let config;
  
  if (hasFlag('model')) {
    config = testConfigs.model;
  } else if (hasFlag('repository')) {
    config = testConfigs.repository;
  } else if (hasFlag('service')) {
    config = testConfigs.service;
  } else if (hasFlag('controller')) {
    config = testConfigs.controller;
  } else if (hasFlag('coverage')) {
    config = testConfigs.coverage;
  } else if (hasFlag('watch')) {
    config = testConfigs.watch;
  } else {
    config = testConfigs.all;
  }
  
  // Add coverage flag if specified with other test types
  if (hasFlag('coverage') && !config.command.includes('--coverage')) {
    config = {
      ...config,
      command: `${config.command} -- --coverage`,
      description: `${config.description} (with coverage)`
    };
  }
  
  // Add watch flag if specified with other test types
  if (hasFlag('watch') && !config.command.includes('--watch')) {
    config = {
      ...config,
      command: `${config.command} -- --watch`,
      description: `${config.description} (watch mode)`
    };
  }
  
  // Run the tests
  runCommand(config.command, config.description);
}

// Run the script
main();