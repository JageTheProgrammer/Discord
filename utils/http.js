import axios from 'axios';

export const http = axios.create({
	headers: { 'User-Agent': 'DiscordBot' },
});

export const gh = axios.create({
	baseURL: 'https://api.github.com',
	headers: () => {
		const headers = { 'User-Agent': 'DiscordBot' };
		if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
		return headers;
	},
});

