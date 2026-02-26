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

export function pickUnique(words, n) {
	const copy = words.slice();
	shuffle(copy);
	return copy.slice(0, Math.min(n, copy.length));
}

// pattern: "none" | "per-word" | "end-double"
export function buildPassword(selectedWords, sep, pattern, addCaps) {
	const words = selectedWords.map(w => addCaps ? capitalizeFirst(w) : w);

	if (pattern === "per-word") {
		return words.map(w => w + randInt(10)).join(sep);
	}
	if (pattern === "end-double") {
		const num = String(randInt(100));
		return words.join(sep) + sep + num;
	}
	return words.join(sep);
}

function log2(n) {
	return Math.log(n) / Math.log(2);
}

// pattern: "none" | "per-word" | "end-double"
export function entropyBits(wordCount, wordsPicked, pattern, addCaps) {
	if (wordCount <= 0 || wordsPicked <= 0) return 0;

	// permutations without replacement: product_{i=0..c-1} (W - i)
	let bits = 0;
	const c = Math.min(wordsPicked, wordCount);
	for (let i = 0; i < c; i++) {
		bits += log2(wordCount - i);
	}

	if (pattern === "per-word") bits += c * log2(10); // one digit per word
	if (pattern === "end-double") bits += log2(100);  // one number 00-99

	// "pretend" caps adds 1 bit per word (2 possibilities)
	if (addCaps) bits += c * log2(2); // == c

	return bits;
}
