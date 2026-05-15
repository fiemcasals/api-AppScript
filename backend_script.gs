/**
 * BACKEND PARA RECETARIO GASTROCLOUD
 * Este script debe ir en Extensiones > Apps Script de tu Google Sheet
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const userSheet = ss.getSheetByName('users') || ss.insertSheet('users');
const recipeSheet = ss.getSheetByName('recipes') || ss.insertSheet('recipes');

// Inicializa las cabeceras si las hojas están vacías
function initialize() {
  if (userSheet.getLastRow() === 0) userSheet.appendRow(['id', 'username', 'password', 'name']);
  if (recipeSheet.getLastRow() === 0) recipeSheet.appendRow(['id', 'userId', 'username', 'title', 'description', 'imageUrl', 'timestamp']);
}

// Maneja las peticiones POST (Login, Registro, Guardar Receta)
function doPost(e) {
  initialize();
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return response({ success: false, message: "Error en el formato de datos" });
  }
  
  const action = data.action;

  try {
    if (action === 'login') {
      const users = userSheet.getDataRange().getValues();
      for (let i = 1; i < users.length; i++) {
        if (users[i][1] === data.username && users[i][2] === data.password) {
          return response({ 
            success: true, 
            user: { id: users[i][0], username: users[i][1], name: users[i][3] } 
          });
        }
      }
      return response({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    if (action === 'register') {
      const id = Utilities.getUuid();
      userSheet.appendRow([id, data.username, data.password, data.name]);
      return response({ success: true });
    }

    if (action === 'addRecipe') {
      const id = Utilities.getUuid();
      recipeSheet.appendRow([
        id, 
        data.userId, 
        data.username, 
        data.title, 
        data.description, 
        data.imageUrl, 
        new Date().toISOString()
      ]);
      return response({ success: true });
    }

  } catch (err) {
    return response({ success: false, message: err.toString() });
  }
}

function doGet(e) {
  initialize();
  const action = e.parameter.action;
  
  if (action === 'getRecipes') {
    const userId = e.parameter.userId;
    const rows = recipeSheet.getDataRange().getValues();
    const headers = rows.shift();
    
    let recipes = rows.map(r => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });

    if (userId) {
      recipes = recipes.filter(r => r.userId === userId);
    }
    
    return response(recipes.reverse());
  }
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
