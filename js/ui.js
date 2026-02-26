import { loadDict } from "./dict.js";
import { pickUnique, buildPassword, entropyBits } from "./generator.js";
import { applyUrlParams } from "./params.js";

let lastPwd = "";

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
	const useDigits = document.getElementById("use-digits").checked;
	const pattern = useDigits ? (getRadioValue("pattern") ?? "end-double") : "none";
	const addCaps = document.getElementById("caps").checked;

	try {
		const words = await loadDict(lang);
		const chosen = pickUnique(words, count);
		const pwd = buildPassword(chosen, sep, pattern, addCaps);

		lastPwd = pwd;
		document.getElementById("out").textContent = pwd;

		updateStats(pwd, words.length, count, pattern, addCaps);

		return pwd;
	} catch (e) {
		status.textContent = e.message;
		document.getElementById("out").textContent = "Erreur de chargement du dictionnaire.";
		setPwdVisible(true);
		lastPwd = "";
		return "";
	}
}

async function copyOut() {
	const status = document.getElementById("status");
	status.textContent = "";

	const pwd = lastPwd;
	if (!pwd) {
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

function setPwdVisible(visible) {
	const out = document.getElementById("out");
	const bouton = document.getElementById("cacherpwd");
	out.classList.toggle("hiddentext", !visible);
	bouton.textContent = visible ? "Cacher" : "Révéler";
}

function togglePwd() {
	const out = document.getElementById("out");
	setPwdVisible(out.classList.contains("hiddentext"));
}

function updateStats(pwd, dictSize, count, pattern, addCaps) {
	document.getElementById("len").textContent = pwd.length;
	const bits = entropyBits(dictSize, count, pattern, addCaps);
	document.getElementById("entropy").textContent = Math.floor(bits);
}

const SEP_ALIAS = { ' ': 'space', '-': '-', '_': '_', '+': '+', '=': '=', ',': ',', '.': '.' };

function buildParamUrl(lock) {
	const p = new URLSearchParams();
	p.set('lang',    getRadioValue('lang') ?? 'fr');
	p.set('count',   getRadioValue('count') ?? '3');
	p.set('sep',     SEP_ALIAS[getRadioValue('sep')] ?? 'space');
	const useDigits = document.getElementById('use-digits').checked;
	p.set('digits',  useDigits);
	if (useDigits) p.set('pattern', getRadioValue('pattern') ?? 'end-double');
	p.set('caps',    document.getElementById('caps').checked);
	p.set('reveal',  !document.getElementById('out').classList.contains('hiddentext'));
	p.set('lock',    lock);
	return `${location.origin}${location.pathname}?${p.toString()}`;
}

async function copyParamUrl(lock) {
	const status = document.getElementById('url-copy-status');
	try {
		await navigator.clipboard.writeText(buildParamUrl(lock));
		status.textContent = 'Copié.';
		setTimeout(() => status.textContent = '', 1200);
	} catch {
		status.textContent = 'Copie impossible (permissions navigateur).';
	}
}

document.getElementById("gen").addEventListener("click", generate);
document.getElementById("copy").addEventListener("click", copyOut);
document.getElementById("cacherpwd").addEventListener("click", togglePwd);
document.getElementById("copy-url-locked").addEventListener("click", () => copyParamUrl(true));
document.getElementById("copy-url-free").addEventListener("click",   () => copyParamUrl(false));
document.getElementById("remove-lock").addEventListener("click", () => {
	for (const el of document.querySelectorAll('.toggle-row input:disabled')) {
		el.disabled = false;
	}
	document.getElementById("remove-lock").disabled = true;
});

document.getElementById("use-digits").addEventListener("change", function () {
	const row = document.getElementById("digit-pattern-row");
	row.style.display = this.checked ? "flex" : "none";
});

for (const el of document.querySelectorAll('.panel:not(.advanced-panel) input, select')) el.addEventListener("change", generate);

// Apply URL params before first generation
const ignoredParams = applyUrlParams();
const hasLocks = document.querySelectorAll('.toggle-row input:disabled').length > 0;
document.getElementById("remove-lock").disabled = !hasLocks;

if (ignoredParams.length > 0) {
	const warn = document.createElement('div');
	warn.className = 'url-warning';
	warn.textContent = `Paramètre(s) URL ignoré(s) : ${ignoredParams.join(', ')}`;
	document.body.appendChild(warn);
}

// GO!
generate();
