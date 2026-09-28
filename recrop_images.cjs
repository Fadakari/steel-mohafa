const sharp = require('sharp');
const path = require('path');

async function processImages() {
    // Malek
    try {
        await sharp('public/team/asghar-farahnia-pipes-fittings.jpg')
            .resize(400, 400, {
                fit: sharp.fit.cover,
                position: sharp.position.top
            })
            .webp({ quality: 80 })
            .toFile('public/team/malek-farahnia-sales-manager.webp');
        console.log('Optimized Malek');
    } catch (err) {
        console.error(err);
    }

    // Maryam
    try {
        await sharp('C:\\Users\\ASUS\\Downloads\\Gemini_Generated_Image_h7nta2h7nta2h7nt.jpg')
            .resize(400, 400, {
                fit: sharp.fit.cover,
                position: sharp.position.top
            })
            .webp({ quality: 80 })
            .toFile('public/team/maryam-moradi-steel-sales-manager.webp');
        console.log('Optimized Maryam');
    } catch (err) {
        console.error(err);
    }
}

processImages();
