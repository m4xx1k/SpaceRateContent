const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const folderPath = __dirname;

function processFiles(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error(':/ [ReadDirErr] Помилка при читанні папки:', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            const fileExtension = path.extname(file).toLowerCase();

            if (fileExtension === '.webp' || fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png' || fileExtension === '.bmp' || fileExtension === '.svg') {
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error(`:/ [StatErr] Помилка при отриманні інформації про файл "${file}":`, err);
                        return;
                    }

                    const fileSizeInKB = stats.size / 1024;
                    if (fileSizeInKB > 50) {
                        const quality = 60;
                        let outputFunction;

                        if (fileExtension === '.webp') {
                            outputFunction = (pipeline) => pipeline.webp({ quality });
                        } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
                            outputFunction = (pipeline) => pipeline.jpeg({ quality });
                        } else if (fileExtension === '.png') {
                            outputFunction = (pipeline) => pipeline.png({ compressionLevel: Math.floor(quality / 10) });
                        } else if (fileExtension === '.bmp') {
                            outputFunction = (pipeline) => pipeline.bmp({ quality: Math.floor(quality / 10) });
                        } else if (fileExtension === '.svg') {
                            console.log('=) [SkipSVG] SVG зображення не можуть бути зжаті. Пропускаємо.')
                            return;
                        }

                        if (outputFunction) {
                            sharp(filePath)
                                .metadata()
                                .then(({ width, height }) => {
                                    sharp(filePath)
                                        .resize({ width: Math.round(width * 3 / 4), height: Math.round(height * 3 / 4), withoutEnlargement: true })
                                        .toBuffer()
                                        .then(buffer => {
                                            const pipeline = sharp(buffer);
                                            outputFunction(pipeline)
                                                .toFile(filePath, (err, info) => {
                                                    if (err) {
                                                        console.error(`:/ [ResizeErr] Помилка при зменшенні розміру фото "${file}":`, err);
                                                        return;
                                                    }

                                                    console.log(`=) [Success] Фото ${filePath} було успішно зжате до ${quality}% якості`);
                                                });
                                        })
                                        .catch(err => {
                                            console.error(`:/ [SharpErr] Помилка при обробці фото "${file}" sharp-ом:`, err);
                                        });
                                })
                                .catch(err => {
                                    console.error(`:/ [MetadataErr] Не вдається отримати метадані для "${file}":`, err);
                                });
                        }
                    } else {
                        console.log('=) [SkipSmall] Файл "${file}" має розмір менше 50КБ. Пропускаємо.')
                    }
                });
            } else if (fs.statSync(filePath).isDirectory()) {
                processFiles(filePath);
            } else {
                console.log(`:/ [SkipUnsup] Файл "${file}" має непідтримуваний формат (${fileExtension}). Пропускаємо.`);
            }
        });
    });
}

processFiles(folderPath);

