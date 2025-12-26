/**
 * Buzzee Logo Generator
 * Generates PNG logo assets with 3D metallic bulge effect
 *
 * Usage: node generate-logos.js
 * Requires: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Assets to generate
const ASSETS = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'logo.png', size: 512 },
  { name: 'favicon.png', size: 64 },
];

// Colors
const COLORS = {
  bgStart: '#E91E63',
  bgEnd: '#F06292',
  // Metallic gradient stops
  metallic: [
    { pos: 0, color: '#FAFAFA' },
    { pos: 0.15, color: '#F0F0F0' },
    { pos: 0.35, color: '#E8E8E8' },
    { pos: 0.50, color: '#D8D8D8' },
    { pos: 0.65, color: '#E0E0E0' },
    { pos: 0.85, color: '#D0D0D0' },
    { pos: 1.0, color: '#B8B8B8' },
  ],
};

/**
 * Draw a rounded rectangle
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generate a logo at the specified size
 */
function generateLogo(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const cornerRadius = size * 0.2;
  const fontSize = size * 0.85;
  const centerX = size / 2;
  const centerY = size / 2;

  // 1. Draw background with gradient
  const bgGradient = ctx.createLinearGradient(0, 0, size, size);
  bgGradient.addColorStop(0, COLORS.bgStart);
  bgGradient.addColorStop(1, COLORS.bgEnd);

  roundRect(ctx, 0, 0, size, size, cornerRadius);
  ctx.fillStyle = bgGradient;
  ctx.fill();

  // Configure text
  ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Position B at 78% to match BuzzeeIcon.tsx
  const textY = size * 0.78;

  // 2. Draw main "B" with metallic gradient
  const metallicGradient = ctx.createLinearGradient(
    centerX,
    textY - fontSize / 2,
    centerX,
    textY + fontSize / 2
  );
  COLORS.metallic.forEach(stop => {
    metallicGradient.addColorStop(stop.pos, stop.color);
  });

  ctx.fillStyle = metallicGradient;
  ctx.fillText('B', centerX, textY);

  // 3. Draw highlight overlay for 3D bulge effect
  const highlightGradient = ctx.createLinearGradient(
    centerX,
    textY - fontSize / 2,
    centerX,
    textY + fontSize / 2
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  highlightGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.12)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = highlightGradient;
  ctx.fillText('B', centerX, textY);

  // 4. Add subtle inner highlight on the "B" edges (bevel effect)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = size * 0.003;
  ctx.strokeText('B', centerX - size * 0.001, textY - size * 0.001);

  return canvas.toBuffer('image/png');
}

/**
 * Main execution
 */
function main() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  // Ensure assets directory exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log('🎨 Generating Buzzee logo assets...\n');

  ASSETS.forEach(asset => {
    const buffer = generateLogo(asset.size);
    const outputPath = path.join(assetsDir, asset.name);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Generated ${asset.name} (${asset.size}x${asset.size})`);
  });

  console.log('\n🎉 All logo assets generated successfully!');
  console.log(`📁 Output directory: ${assetsDir}`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generateLogo, main };
