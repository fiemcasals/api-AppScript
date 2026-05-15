// REEMPLAZA ESTA URL con la de tu despliegue de Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyIFQh2ZJns4-MN01Xl6DJEKuSeaGlS5J5yzPnFvzcm5E-uN0wQjEq-Qi5SEYm-UPT-/exec';

let currentUser = JSON.parse(localStorage.getItem('gastro_user')) || null;
let currentTab = 'all';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showDashboard();
    }
});

function toggleAuth(showLogin) {
    document.getElementById('login-form').classList.toggle('hidden', !showLogin);
    document.getElementById('register-form').classList.toggle('hidden', showLogin);
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) return alert('Completa todos los campos');

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username, password })
        });
        const data = await res.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('gastro_user', JSON.stringify(currentUser));
            showDashboard();
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error(e);
        alert('Error al conectar con la base de datos');
    }
}

async function register() {
    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    if (!name || !username || !password) return alert('Completa todos los campos');

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'register', name, username, password })
        });
        const data = await res.json();
        if (data.success) {
            alert('Registro exitoso, ahora puedes iniciar sesión');
            toggleAuth(true);
        }
    } catch (e) {
        alert('Error en el registro');
    }
}

function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('user-nav').classList.remove('hidden');
    document.getElementById('add-recipe-btn').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `Hola, ${currentUser.name}`;
    loadRecipes();
}

function logout() {
    localStorage.removeItem('gastro_user');
    location.reload();
}

async function loadRecipes() {
    const container = document.getElementById('recipes-container');
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Cargando recetas...</p>';

    let url = `${API_URL}?action=getRecipes`;
    if (currentTab === 'mine') {
        url += `&userId=${currentUser.id}`;
    }

    try {
        const res = await fetch(url);
        const recipes = await res.json();

        container.innerHTML = '';
        if (recipes.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No hay recetas aún.</p>';
            return;
        }

        recipes.forEach(r => {
            const card = document.createElement('div');
            card.className = 'recipe-card glass';
            card.innerHTML = `
                <img src="${r.imageUrl || 'https://via.placeholder.com/400x200?text=Sin+Imagen'}" class="recipe-img" alt="${r.title}">
                <div class="recipe-content">
                    <div class="recipe-title">${r.title}</div>
                    <div class="recipe-meta">Por ${r.username} • ${new Date(r.timestamp).toLocaleDateString()}</div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">${r.description}</p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        container.innerHTML = '<p>Error al cargar las recetas.</p>';
    }
}

function switchTab(tab, el) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    loadRecipes();
}

function openModal() {
    document.getElementById('recipe-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('recipe-modal').classList.add('hidden');
}

async function saveRecipe() {
    const title = document.getElementById('recipe-title').value;
    const imageUrl = document.getElementById('recipe-image').value;
    const description = document.getElementById('recipe-desc').value;

    if (!title || !description) return alert('Título y descripción son obligatorios');

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'addRecipe',
                userId: currentUser.id,
                username: currentUser.username,
                title,
                imageUrl,
                description
            })
        });
        const data = await res.json();
        if (data.success) {
            closeModal();
            loadRecipes();
            // Limpiar form
            document.getElementById('recipe-title').value = '';
            document.getElementById('recipe-image').value = '';
            document.getElementById('recipe-desc').value = '';
        }
    } catch (e) {
        alert('Error al guardar la receta');
    }
}
