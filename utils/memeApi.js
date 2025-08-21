// utils/memeApi.js
const https = require('https');

async function getMeme() {
    return new Promise((resolve, reject) => {
        https.get('https://meme-api.com/gimme', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (res.statusCode === 200 && parsedData.url) {
                        resolve(parsedData.url);
                    } else {
                        resolve(null); // Failed to fetch meme
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

module.exports = { getMeme };