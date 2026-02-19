const dictCache = { fr: null, en: null };

function randInt(maxExclusive) {
	const arr = new Uint32Array(1);
	crypto.getRandomValues(arr);
	return arr[0] % maxExclusive;
}

function capitalizeFirst(str) {
	if (!str) return str;
	return str[0].toUpperCase() + str.slice(1);
}

function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = randInt(i + 1);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function stripAccents(str) {
	return str
		.normalize("NFD")                 // split letter + accent
		.replace(/[\u0300-\u036f]/g, ""); // remove accent marks
}

async function loadDict(lang) {
	if (dictCache[lang]) return dictCache[lang];

	const MIN_LEN = 4;
	const MAX_LEN = 10;

	const file = lang === "fr" ? "mots-fr.txt" : "mots-en.txt";
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

function pickUnique(words, n) {
	const copy = words.slice();
	shuffle(copy);
	return copy.slice(0, Math.min(n, copy.length));
}

function buildPassword(selectedWords, sep, addNums, addCaps) {
	return selectedWords
		.map(w => {
			let word = addCaps ? capitalizeFirst(w) : w;
			if (addNums) word += randInt(10);
			return word;
		})
		.join(sep);
}

function log2(n) {
	return Math.log(n) / Math.log(2);
}

function entropyBits(wordCount, wordsPicked, addNums, addCaps) {
	if (wordCount <= 0 || wordsPicked <= 0) return 0;

	// permutations without replacement: product_{i=0..c-1} (W - i)
	let bits = 0;
	const c = Math.min(wordsPicked, wordCount);
	for (let i = 0; i < c; i++) {
		bits += log2(wordCount - i);
	}

	// digits 0-9 after each word (random per word)
	if (addNums) bits += c * log2(10);

	// "pretend" caps adds 1 bit per word (2 possibilities)
	if (addCaps) bits += c * log2(2); // == c

	return bits;
}
