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

export function applyUrlParams() {
	const p = new URLSearchParams(window.location.search);

	const lang = p.get('lang');
	if (VALID.lang.includes(lang)) lockRadioGroup('lang', lang);

	const count = p.get('count');
	if (VALID.count.includes(count)) lockRadioGroup('count', count);

	const sepRaw = p.get('sep');
	if (sepRaw !== null) {
		const sepVal = VALID.sep[sepRaw] ?? null;
		if (sepVal !== null) lockRadioGroup('sep', sepVal);
	}

	const digits = p.get('digits');
	if (digits === 'true' || digits === 'false') {
		const on = digits === 'true';
		lockCheckbox('use-digits', on);
		document.getElementById('digit-pattern-row').style.display = on ? 'flex' : 'none';
	}

	const pattern = p.get('pattern');
	if (VALID.pattern.includes(pattern)) lockRadioGroup('pattern', pattern);

	const caps = p.get('caps');
	if (caps === 'true' || caps === 'false') lockCheckbox('caps', caps === 'true');

	const reveal = p.get('reveal');
	if (reveal === 'true') {
		document.getElementById('out').classList.remove('hiddentext');
		document.getElementById('cacherpwd').textContent = 'Cacher';
	} else if (reveal === 'false') {
		document.getElementById('out').classList.add('hiddentext');
		document.getElementById('cacherpwd').textContent = 'Révéler';
	}
}
