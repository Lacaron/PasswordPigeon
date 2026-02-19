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
	const addNums = document.getElementById("nums").checked;
	const addCaps = document.getElementById("caps").checked;

	try {
		const words = await loadDict(lang);
		const chosen = pickUnique(words, count);
		const pwd = buildPassword(chosen, sep, addNums, addCaps);

		lastPwd = pwd;
		document.getElementById("out").textContent = pwd;

		updateStats(pwd, words.length, count, addNums, addCaps);

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

function updateStats(pwd, dictSize, count, addNums, addCaps) {
	document.getElementById("len").textContent = pwd.length;
	const bits = entropyBits(dictSize, count, addNums, addCaps);
	document.getElementById("entropy").textContent = Math.floor(bits);
}

document.getElementById("gen").addEventListener("click", generate);
document.getElementById("copy").addEventListener("click", copyOut);
document.getElementById("cacherpwd").addEventListener("click", togglePwd);
for (const el of document.querySelectorAll('input, select')) el.addEventListener("change", generate);

// GO!
generate();
