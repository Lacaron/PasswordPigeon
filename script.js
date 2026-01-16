const dictCache = { fr: null, en: null };

function randInt(maxExclusive) {
	return Math.floor(Math.random() * maxExclusive);
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

function getRadioValue(name) {
	const el = document.querySelector(`input[name="${name}"]:checked`);
	return el ? el.value : null;
}

async function generate() {
	const status = document.getElementById("status");
	status.textContent = "";

	const lang = getRadioValue("lang");
	const count = Number(getRadioValue("count"));
	const sep = getRadioValue("sep");
	const addNums = document.getElementById("nums").checked;
	const addCaps = document.getElementById("caps").checked;

	try {
		const words = await loadDict(lang);
		const chosen = pickUnique(words, count);
		const pwd = buildPassword(chosen, sep, addNums, addCaps);

		document.getElementById("out").textContent = pwd;

		updateStats(pwd, words.length, count, addNums, addCaps);

		return pwd;
	} catch (e) {
		status.textContent = e.message;
		document.getElementById("out").textContent = "Erreur de chargement du dictionnaire.";
		return "";
	}
}

async function copyOut() {
	const status = document.getElementById("status");
	status.textContent = "";

	const pwd = document.getElementById("out").textContent;
	if (!pwd || pwd === "..." || pwd.startsWith("Erreur")) {
		status.textContent = "Rien à copier.";
		return;
	}

	try {
		await navigator.clipboard.writeText(pwd);
		status.textContent = "Copié.";
		setTimeout(() => status.textContent = "", 1200);
	} catch {
		status.textContent = "Copie impossible (permissions navigateur).";
	}
}

// Entropy stuff
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

function updateStats(pwd, dictSize, count, addNums, addCaps) {
	document.getElementById("len").textContent = pwd.length;
	const bits = entropyBits(dictSize, count, addNums, addCaps);
	document.getElementById("entropy").textContent = Math.floor(bits.toFixed(1));
}

document.getElementById("gen").addEventListener("click", generate);
document.getElementById("copy").addEventListener("click", copyOut);
for (const el of document.querySelectorAll('input, select')) el.addEventListener("change", generate);

// GO!
generate();