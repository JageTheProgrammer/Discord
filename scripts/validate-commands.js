import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ALLOWED_FOLDERS = ['community', 'dev', 'fun', 'infra', 'moderation'];

function isValidName(name) {
	return typeof name === 'string' && /^[a-z0-9_-]{1,32}$/.test(name);
}

function isValidDescription(desc) {
	return typeof desc === 'string' && desc.length >= 1 && desc.length <= 100;
}

function validateOption(option, ctx, errors) {
	if (!isValidName(option.name)) {
		errors.push(`${ctx} invalid option name: ${JSON.stringify(option.name)}`);
	}
	if (!isValidDescription(option.description)) {
		errors.push(
			`${ctx} invalid option description: type=${typeof option.description} len=${(option.description || '').length}`,
		);
	}
	if (Array.isArray(option.options)) {
		for (const sub of option.options) {
			validateOption(sub, `${ctx}>${sub.name}`, errors);
		}
	}
}

async function main() {
	const commandsDir = path.join(process.cwd(), 'commands');
	const folders = readdirSync(commandsDir).filter(f => ALLOWED_FOLDERS.includes(f));
	const commands = [];
	const errors = [];

	let index = 0;
	for (const folder of folders) {
		const folderPath = path.join(commandsDir, folder);
		const files = readdirSync(folderPath).filter(f => f.endsWith('.js'));
		for (const file of files) {
			const filePath = path.join(folderPath, file);
			let mod;
			try {
				mod = await import(pathToFileURL(filePath).href);
			} catch (e) {
				console.warn(`warn: skipping ${folder}/${file} due to import error: ${e?.code || e?.message}`);
				continue;
			}
			const cmd = mod.default ?? mod;
			if (!cmd?.data || !cmd?.execute) continue;
			const json = cmd.data.toJSON();
			if (commands.some(c => c.name === json.name)) continue;
			index += 1;
			commands.push({ file: `${folder}/${file}`, json });
			if (!isValidName(json.name)) errors.push(`#${index} invalid command name: ${json.name}`);
			if (!isValidDescription(json.description)) errors.push(`#${index} /${json.name} invalid description: len=${(json.description || '').length}`);
			if (Array.isArray(json.options)) {
				for (const opt of json.options) validateOption(opt, `#${index} /${json.name}`, errors);
			}
			console.log(String(index).padStart(3, ' ') + ` | ${folder}/${file} -> /${json.name}`);
		}
	}

	console.log(`\nTotal: ${commands.length}`);
	if (commands[43]) {
		const c44 = commands[43];
		console.log(`44th: ${c44.file} -> /${c44.json.name} : ${c44.json.description}`);
	}
	if (errors.length) {
		console.log('\nErrors:');
		for (const e of errors) console.log(' - ' + e);
		process.exitCode = 1;
	}
}

main();

