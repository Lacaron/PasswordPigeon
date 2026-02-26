// ⚠️ Tenir à jour si les options dans index.html changent
const VALID = {
	lang:    ['fr', 'en'],
	count:   ['2', '3', '4', '5', '6'],
	sep:     { space: ' ', '-': '-', '_': '_', '+': '+', '=': '=', ',': ',', '.': '.' },
	pattern: ['end-double', 'per-word'],
};

function applyRadioGroup(name, value, shouldLock) {
	for (const el of document.querySelectorAll(`input[name="${name}"]`)) {
		el.checked  = el.value === value;
		if (shouldLock) el.disabled = true;
	}
}

function applyCheckbox(id, value, shouldLock) {
	const el = document.getElementById(id);
	el.checked  = value;
	if (shouldLock) el.disabled = true;
}

// Returns an array of ignored param strings (e.g. ['lang="klingon"', 'count="99"'])
export function applyUrlParams() {
	const p = new URLSearchParams(window.location.search);
	const ignored = [];

	// lock=false désactive le verrouillage (les valeurs sont quand même appliquées)
	const lockRaw = p.get('lock');
	const shouldLock = lockRaw !== 'false';
	if (lockRaw !== null && lockRaw !== 'true' && lockRaw !== 'false') {
		ignored.push(`lock="${lockRaw}"`);
	}

	const lang = p.get('lang');
	if (lang !== null) {
		if (VALID.lang.includes(lang)) applyRadioGroup('lang', lang, shouldLock);
		else ignored.push(`lang="${lang}"`);
	}

	const count = p.get('count');
	if (count !== null) {
		if (VALID.count.includes(count)) applyRadioGroup('count', count, shouldLock);
		else ignored.push(`count="${count}"`);
	}

	const sepRaw = p.get('sep');
	if (sepRaw !== null) {
		const sepVal = VALID.sep[sepRaw] ?? null;
		if (sepVal !== null) applyRadioGroup('sep', sepVal, shouldLock);
		else ignored.push(`sep="${sepRaw}"`);
	}

	const digits = p.get('digits');
	if (digits !== null) {
		if (digits === 'true' || digits === 'false') {
			const on = digits === 'true';
			applyCheckbox('use-digits', on, shouldLock);
			document.getElementById('digit-pattern-row').style.display = on ? 'flex' : 'none';
		} else {
			ignored.push(`digits="${digits}"`);
		}
	}

	const pattern = p.get('pattern');
	if (pattern !== null) {
		if (VALID.pattern.includes(pattern)) applyRadioGroup('pattern', pattern, shouldLock);
		else ignored.push(`pattern="${pattern}"`);
	}

	const caps = p.get('caps');
	if (caps !== null) {
		if (caps === 'true' || caps === 'false') applyCheckbox('caps', caps === 'true', shouldLock);
		else ignored.push(`caps="${caps}"`);
	}

	const reveal = p.get('reveal');
	if (reveal !== null) {
		if (reveal === 'true') {
			document.getElementById('out').classList.remove('hiddentext');
			document.getElementById('cacherpwd').textContent = 'Cacher';
		} else if (reveal === 'false') {
			document.getElementById('out').classList.add('hiddentext');
			document.getElementById('cacherpwd').textContent = 'Révéler';
		} else {
			ignored.push(`reveal="${reveal}"`);
		}
	}

	return ignored;
}
