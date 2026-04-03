const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

function showMessage(message, type = 'success') {
  alert(message);
}

if (registerForm) {
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !password) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return db.collection('users').doc(user.uid).set({
          name,
          email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        showMessage('Registration successful! You can now login.');
        registerForm.reset();
      })
      .catch((error) => {
        showMessage(error.message, 'error');
      });
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showMessage('Please enter both email and password.', 'error');
      return;
    }

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        showMessage('Login successful! Redirecting to dashboard...');
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        showMessage(error.message, 'error');
      });
  });
}
