const fs = require('fs');
const path = require('path');

function patch() {
  try {
    const filePath = path.resolve(__dirname, '..', 'node_modules', 'docx-preview', 'dist', 'docx-preview.mjs');
    if (!fs.existsSync(filePath)) {
      console.log('docx-preview file not found, skipping patch.');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const marker = 'sourceMappingURL';
    if (content.indexOf(marker) === -1) {
      console.log('No sourceMappingURL found in docx-preview.mjs; nothing to do.');
      return;
    }

    // Remove any trailing sourceMappingURL comment lines
    const patched = content.replace(/\n?\/\/#\s*sourceMappingURL=.*$/m, '\n// sourceMappingURL removed by postinstallFixDocxPreview.js');
    fs.writeFileSync(filePath, patched, 'utf8');
    console.log('Patched docx-preview.mjs to remove sourceMappingURL.');
  } catch (err) {
    console.error('Failed to patch docx-preview:', err);
    process.exitCode = 0; // non-fatal
  }
}

patch();
