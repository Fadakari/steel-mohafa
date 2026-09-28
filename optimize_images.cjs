const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const images = [
    {
        src: 'C:\\Users\\ASUS\\Downloads\\Gemini_Generated_Image_h7nta2h7nta2h7nt.jpg',
        dest: 'public/team/maryam-moradi-steel-sales-manager.webp'
    },
    {
        src: 'C:\\Users\\ASUS\\Downloads\\file_000000000ec881f4b5d26ebac0f80a50.png',
        dest: 'public/team/reyhaneh-derakhshanzadeh-sales-manager.webp'
    },
    {
        src: 'C:\\Users\\ASUS\\Downloads\\Picsart_26-09-26_10-11-48-492.jpg',
        dest: 'public/team/kimia-najafzadeh-heavy-sections-sales.webp'
    }
];

async function optimizeImages() {
    for (const img of images) {
        if (!fs.existsSync(img.src)) {
            console.error(`File not found: ${img.src}`);
            continue;
        }
        try {
            await sharp(img.src)
                .resize(400, 400, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .webp({ quality: 80, effort: 6 })
                .toFile(path.join(__dirname, img.dest));
            console.log(`Optimized ${img.dest}`);
        } catch (err) {
            console.error(`Error processing ${img.src}:`, err);
        }
    }
}

optimizeImages();
