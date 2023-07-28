const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const folderPath = __dirname; // Шлях до папки з фотографіями (в даному випадку, поточна директорія)

function processFiles(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Помилка при читанні папки:', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            const fileExtension = path.extname(file);

            if (fileExtension === '.webp') {
                console.log(`Фото "${file}" уже має формат .webp`);
                return;
            }

            if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png' || fileExtension === '.svg') {
                const webpFilePath = path.join(folderPath, path.basename(file, fileExtension) + '.webp');

                sharp(filePath)
                    .toFormat('webp')
                    .toFile(webpFilePath, (err, info) => {
                        if (err) {
                            console.error(`Помилка при форматуванні фото "${file}" у формат WebP:`, err);
                            return;
                        }

                        console.log(`Фото ${filePath} було успішно сформатовано у формат WebP`);
                    });
            } else if (fs.statSync(filePath).isDirectory()) {
                processFiles(filePath); // Рекурсивно обробляємо вкладену папку
            } else {
                console.log(`Файл "${file}" має непідтримуваний формат (${fileExtension}). Пропускаємо.`);
            }
        });
    });
}

processFiles(folderPath);
