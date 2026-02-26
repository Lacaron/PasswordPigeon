// ⚠️ Tenir à jour si les options dans index.html changent
const VALID = {
	lang:    ['fr', 'en'],
	count:   ['2', '3', '4', '5', '6'],
	sep:     { space: ' ', '-': '-', '_': '_', '+': '+', '=': '=', ',': ',', '.': '.' },
	pattern: ['end-double', 'per-word'],
};

function lockRadioGroup(name, value) {
	for (const el of document.querySelectorAll(`input[name="${name}"]`)) {
		el.checked  = el.value === value;
		el.disabled = true;
	}
}

function lockCheckbox(id, value) {
	const el = document.getElementById(id);
	el.checked  = value;
	el.disabled = true;
}

// Returns an array of ignored param strings (e.g. ['lang="klingon"', 'count="99"'])
export function applyUrlParams() {
	const p = new URLSearchParams(window.location.search);
	const ignored = [];

	const lang = p.get('lang');
	if (lang !== null) {
		if (VALID.lang.includes(lang)) lockRadioGroup('lang', lang);
		else ignored.push(`lang="${lang}"`);
	}

	const count = p.get('count');
	if (count !== null) {
		if (VALID.count.includes(count)) lockRadioGroup('count', count);
		else ignored.push(`count="${count}"`);
	}

	const sepRaw = p.get('sep');
	if (sepRaw !== null) {
		const sepVal = VALID.sep[sepRaw] ?? null;
		if (sepVal !== null) lockRadioGroup('sep', sepVal);
		else ignored.push(`sep="${sepRaw}"`);
	}

	const digits = p.get('digits');
	if (digits !== null) {
		if (digits === 'true' || digits === 'false') {
			const on = digits === 'true';
			lockCheckbox('use-digits', on);
			document.getElementById('digit-pattern-row').style.display = on ? 'flex' : 'none';
		} else {
			ignored.push(`digits="${digits}"`);
		}
	}

	const pattern = p.get('pattern');
	if (pattern !== null) {
		if (VALID.pattern.includes(pattern)) lockRadioGroup('pattern', pattern);
		else ignored.push(`pattern="${pattern}"`);
	}

	const caps = p.get('caps');
	if (caps !== null) {
		if (caps === 'true' || caps === 'false') lockCheckbox('caps', caps === 'true');
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
