# GastroCloud: Recetario Web con Google Sheets como Base de Datos

Este proyecto es un ejemplo pedagógico completo sobre cómo construir una aplicación web funcional (Frontend) que utiliza **Google Sheets** como base de datos (Backend) a través de **Google Apps Script**, y que luego se publica gratuitamente en **GitHub Pages**.

## 1. Configuración del Backend (Google Sheets)

La base de datos de esta aplicación es una hoja de cálculo estándar de Google.

### Pasos:
1. Crea un nuevo archivo en Google Sheets.
2. Crea (o renombra) dos pestañas en la parte inferior:
   - `users` (para almacenar los registros de usuarios).
   - `recipes` (para almacenar las recetas).
3. Ve al menú superior: **Extensiones > Apps Script**.
4. Borra el código predeterminado y pega el contenido del archivo `backend_script.gs` que se encuentra en este repositorio.
5. Guarda el proyecto de Apps Script.

### Despliegue de la API:
Para que la página web pueda comunicarse con el Excel, hay que exponer el script como una API pública:
1. Arriba a la derecha, haz clic en **Implementar > Nueva implementación**.
2. Tipo de implementación: **Aplicación Web**.
3. Configuración:
   - Ejecutar como: **Yo** (tu cuenta).
   - Quién tiene acceso: **Cualquier persona** (⚠️ *CRÍTICO: Si no pones esto, GitHub Pages será bloqueado por CORS/Permisos*).
4. Dale a "Implementar". Google te pedirá autorizar permisos avanzados (puedes decirle "Ir a proyecto seguro").
5. Copia la **URL de la aplicación web**.

---

## 2. Configuración del Frontend (HTML/CSS/JS)

El frontend está compuesto por tres archivos clásicos.

### Pasos:
1. **`index.html`**: Contiene la estructura (Login, Dashboard de recetas y Formulario de carga).
2. **`estilos.css`**: Define la estética visual (Glassmorphism, Modo oscuro).
3. **`logica.js`**: El cerebro del frontend. 
   - ⚠️ **Paso clave**: Debes pegar la "URL de la aplicación web" (obtenida en el paso anterior) en la variable `API_URL` ubicada en la primera línea de `logica.js`.

---

## 3. Subida a GitHub y Gestión de Credenciales

Para alojar el proyecto en GitHub, se debe crear un repositorio y subir los archivos. Debido a las políticas modernas de seguridad, no se puede usar la contraseña habitual de GitHub en la terminal.

### Pasos:
1. Crear un repositorio vacío en GitHub.
2. Iniciar Git localmente (`git init`, `git add .`, `git commit -m "Initial commit"`, `git branch -M main`).
3. Crear un **Token de Acceso Personal (PAT)** en GitHub: *Settings > Developer settings > Personal access tokens (classic)* con permisos de `repo`.
4. Vincular el repositorio remoto incrustando el token para evitar fallos de autenticación:
   ```bash
   git remote set-url origin https://TU_TOKEN@github.com/usuario/repo.git
   ```
5. Subir el código: `git push -u origin main`.

---

## 4. Despliegue en GitHub Pages

El paso final es poner la web en vivo para que cualquier persona en el mundo pueda usarla.

### Pasos:
1. En tu repositorio de GitHub, ve a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, busca la sección **Pages** (bajo "Code and automation").
3. En la sección **Build and deployment**:
   - Source: Mantén "Deploy from a branch".
   - Branch: Selecciona **`main`** (o `master`) y la carpeta **`/(root)`**.
4. Haz clic en **Save** (Guardar).
5. Espera unos 1 a 3 minutos. Arriba aparecerá un mensaje con el link oficial de tu página: `https://tu-usuario.github.io/nombre-del-repo/`.

¡Listo! Al entrar a esa URL, la página estará en vivo, conectada directamente a tu hoja de cálculo.
