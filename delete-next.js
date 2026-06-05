const fs = require('fs');
const path = require('path');
try {
    fs.rmSync(path.join(__dirname, '.next'), { recursive: true, force: true });
    console.log('Successfully deleted .next directory');
} catch (e) {
    console.error('Error deleting .next:', e);
}
