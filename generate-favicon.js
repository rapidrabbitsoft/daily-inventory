const sharp = require('sharp');
const fs = require('fs');

// Read the SVG file
const svgBuffer = fs.readFileSync('icon.svg');

// Generate different sizes
const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180
};

// Generate each size
Object.entries(sizes).forEach(([filename, size]) => {
    sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(filename)
        .then(() => console.log(`Generated ${filename}`))
        .catch(err => console.error(`Error generating ${filename}:`, err));
});

// For favicon.ico, we'll just use the 32x32 PNG
sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('favicon.ico')
    .then(() => console.log('Generated favicon.ico'))
    .catch(err => console.error('Error generating favicon.ico:', err)); 