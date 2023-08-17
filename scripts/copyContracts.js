// scripts/copyContracts.js

const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'build', 'contracts');
const targetDir = path.join(__dirname, '..', 'src', 'contracts');

async function copyContracts() {
  try {
    const files = await fs.readdir(sourceDir);
    await Promise.all(
      files.map(async (file) => {
        const sourceFile = path.join(sourceDir, file);
        const targetFile = path.join(targetDir, file);
        await fs.copyFile(sourceFile, targetFile);
        console.log(`Copied: ${sourceFile} -> ${targetFile}`);
      })
    );
    console.log('Contracts copied successfully!');
  } catch (error) {
    console.error('Error copying contracts:', error);
  }
}

copyContracts();
