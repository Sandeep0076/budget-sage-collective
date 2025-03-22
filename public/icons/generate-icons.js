// This script generates PWA icons for different sizes
// Run with Node.js: node generate-icons.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create the apple-touch-icon as well (typically 180x180)
sizes.push(180);

// Function to generate a simple gradient icon with text
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0ea5e9');  // Light blue
  gradient.addColorStop(1, '#10b981');  // Green
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add text if icon is large enough
  if (size >= 96) {
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Adjust font size based on icon size
    const fontSize = Math.floor(size / 4);
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Add "$" symbol
    ctx.fillText('$', size / 2, size / 2);
  }
  
  return canvas.toBuffer();
}

// Generate icons for each size
sizes.forEach(size => {
  const iconBuffer = generateIcon(size);
  
  // Special case for apple-touch-icon
  if (size === 180) {
    fs.writeFileSync(path.join(__dirname, 'apple-touch-icon.png'), iconBuffer);
    console.log(`Generated apple-touch-icon.png (${size}x${size})`);
  } else {
    fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.png`), iconBuffer);
    console.log(`Generated icon-${size}x${size}.png`);
  }
});

console.log('All PWA icons generated successfully!');
