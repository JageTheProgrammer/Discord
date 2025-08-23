export function parseDuration(input) {
	// Supports formats like: 10s, 5m, 2h, 1d, or combinations like 1h30m
	if (!input || typeof input !== 'string') return null;
	const re = /(\d+)\s*([smhd])/gi;
	let match;
	let total = 0;
	while ((match = re.exec(input))) {
		const val = parseInt(match[1], 10);
		switch ((match[2] || 's').toLowerCase()) {
			case 's': total += val * 1000; break;
			case 'm': total += val * 60 * 1000; break;
			case 'h': total += val * 60 * 60 * 1000; break;
			case 'd': total += val * 24 * 60 * 60 * 1000; break;
			default: return null;
		}
	}
	return total > 0 ? total : null;
}

