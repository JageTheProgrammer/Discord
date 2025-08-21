import https from 'https';

async function fetchGithub(username) {
	const url = `https://api.github.com/users/${username}`;

	return new Promise((resolve, reject) => {
		https.get(url, {
			headers: {
				'User-Agent': 'DiscordBot'
			}
		}, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				try {
					const parsedData = JSON.parse(data);
					if (res.statusCode === 200) {
						resolve(parsedData);
					} else {
						resolve(null);
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

export default fetchGithub;