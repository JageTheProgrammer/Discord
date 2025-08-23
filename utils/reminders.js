import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE = path.join(__dirname, '../database/reminders.json');

function readReminders() {
	try {
		return JSON.parse(readFileSync(FILE, 'utf8') || '[]');
	} catch {
		return [];
	}
}

function writeReminders(list) {
	try {
		writeFileSync(FILE, JSON.stringify(list, null, 2), 'utf8');
	} catch (e) {
		console.error('Failed to persist reminders:', e);
	}
}

export function addReminder(reminder) {
	const list = readReminders();
	list.push(reminder);
	writeReminders(list);
}

export function removeReminder(id) {
	const list = readReminders().filter(r => r.id !== id);
	writeReminders(list);
}

export function getReminders() {
	return readReminders();
}

