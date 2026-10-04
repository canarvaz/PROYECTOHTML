const USERS = {
	recepcion1: '1234',
	admin: 'admin',
};

const form = document.getElementById('loginForm');
const alertBox = document.getElementById('loginAlert');

function showError(message) {
	alertBox.textContent = message;
	alertBox.classList.remove('d-none');
}

function clearError() {
	alertBox.classList.add('d-none');
}

form.addEventListener('submit', function (event) {
	event.preventDefault();
	clearError();

	if (!form.checkValidity()) {
		form.classList.add('was-validated');
		return;
	}

	form.classList.remove('was-validated');

	const username = document.getElementById('username').value.trim();
	const password = document.getElementById('password').value;

	if (USERS[username] && USERS[username] === password) {
		window.location.href = '/recepcion.html';
		return;
	}

	showError('Usuario o contraseña incorrectos.');
	document.getElementById('password').value = '';
	document.getElementById('password').focus();
});

document.getElementById('password').addEventListener('input', clearError);