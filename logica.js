// REEMPLAZA ESTA URL con la de tu despliegue de Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyIFQh2ZJns4-MN01Xl6DJEKuSeaGlS5J5yzPnFvzcm5E-uN0wQjEq-Qi5SEYm-UPT-/exec';

let currentUser = JSON.parse(localStorage.getItem('gastro_user')) || null;
let currentTab = 'all';
let editingRecipeId = null;

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
            
            let actionButtons = '';
            if (currentUser && r.userId === currentUser.id) {
                const recipeJson = JSON.stringify(r).replace(/"/g, '&quot;');
                actionButtons = `
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button onclick="editRecipeClick(${recipeJson})" style="padding: 0.5rem; font-size: 0.8rem; flex: 1;">Editar</button>
                        <button onclick="deleteRecipeClick('${r.id}')" style="padding: 0.5rem; font-size: 0.8rem; flex: 1; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171;">Eliminar</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <img src="${r.imageUrl || 'https://placehold.co/400x200/2a1b3d/ffffff?text=Sin+Imagen'}" class="recipe-img" alt="${r.title}">
                <div class="recipe-content">
                    <div class="recipe-title">${r.title}</div>
                    <div class="recipe-meta">Por ${r.username} • ${new Date(r.timestamp).toLocaleDateString()}</div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">${r.description}</p>
                    ${actionButtons}
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
    editingRecipeId = null;
    document.getElementById('modal-title').innerText = 'Nueva Receta';
    document.getElementById('modal-submit-btn').innerText = 'Guardar Receta';
    document.getElementById('recipe-title').value = '';
    document.getElementById('recipe-image').value = '';
    document.getElementById('recipe-desc').value = '';
    document.getElementById('recipe-modal').classList.remove('hidden');
}

function editRecipeClick(recipe) {
    editingRecipeId = recipe.id;
    document.getElementById('modal-title').innerText = 'Editar Receta';
    document.getElementById('modal-submit-btn').innerText = 'Actualizar Receta';
    document.getElementById('recipe-title').value = recipe.title;
    document.getElementById('recipe-image').value = recipe.imageUrl;
    document.getElementById('recipe-desc').value = recipe.description;
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
        const payload = {
            action: editingRecipeId ? 'editRecipe' : 'addRecipe',
            userId: currentUser.id,
            username: currentUser.username,
            title,
            imageUrl,
            description
        };
        
        if (editingRecipeId) {
            payload.recipeId = editingRecipeId;
        }

        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            closeModal();
            loadRecipes();
        } else {
            alert(data.message || 'Error al guardar la receta');
        }
    } catch (e) {
        alert('Error de conexión');
    }
}

async function deleteRecipeClick(recipeId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer.')) return;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'deleteRecipe',
                recipeId: recipeId,
                userId: currentUser.id
            })
        });
        const data = await res.json();
        if (data.success) {
            loadRecipes();
        } else {
            alert(data.message || 'Error al eliminar');
        }
    } catch (e) {
        alert('Error de conexión');
    }
}
