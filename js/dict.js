const dictCache = { fr: null, en: null };

function stripAccents(str) {
	return str
		.normalize("NFD")                 // split letter + accent
		.replace(/[\u0300-\u036f]/g, ""); // remove accent marks
}

export async function loadDict(lang) {
	if (dictCache[lang]) return dictCache[lang];

	const MIN_LEN = 4;
	const MAX_LEN = 10;

	const file = lang === "fr" ? "data/mots-fr.txt" : "data/mots-en.txt";
	const res = await fetch(file);
	if (!res.ok) throw new Error(`Impossible de charger ${file}`);

	const text = await res.text();
	const words = text
		.split(/\r?\n/)
		.map(w => w.trim())
		.filter(Boolean)
		.map(w => stripAccents(w).toLowerCase())
		.filter(w => w.length >= MIN_LEN && w.length <= MAX_LEN);

	dictCache[lang] = words;
	return words;
}
