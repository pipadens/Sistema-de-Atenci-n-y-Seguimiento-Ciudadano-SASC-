from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import sqlite3

app = Flask(__name__)
app.secret_key = 'sasc_morelos_clave_secreta_super_segura'
DB_NAME = 'sasc_morelos.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Tabla de usuarios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT DEFAULT 'ciudadano' -- Puede ser 'ciudadano' o 'admin'
        )
    ''')
    
    # Tabla de reportes con columna 'estatus' incorporada
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reportes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            titulo TEXT NOT NULL,
            categoria TEXT NOT NULL,
            descripcion TEXT,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            calle TEXT,
            colonia TEXT,
            estatus TEXT DEFAULT 'Pendiente',
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )
    ''')
    conn.commit()
    conn.close()

# --- DECORADORES DE SEGURIDAD ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"success": False, "error": "Inicia sesión para continuar."}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Restringe el acceso exclusivamente a usuarios con rol de administrador."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('user_role') != 'admin':
            return jsonify({"success": False, "error": "Acceso denegado. Se requieren privilegios de administrador."}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- ENDPOINTS DE ADMINISTRACIÓN ---

@app.route('/api/admin/reportes', methods=['GET'])
@admin_required
def admin_obtener_reportes():
    """Devuelve todos los reportes junto con la información del ciudadano que los creó."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT r.*, u.nombre as autor, u.email as autor_email 
        FROM reportes r 
        LEFT JOIN usuarios u ON r.usuario_id = u.id 
        ORDER BY r.fecha DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in rows]), 200

@app.route('/api/admin/reportes/<int:reporte_id>/estatus', methods=['PATCH'])
@admin_required
def admin_actualizar_estatus(reporte_id):
    """Permite al administrador cambiar el estatus operativo de un reporte."""
    data = request.json
    nuevo_estatus = data.get('estatus')
    
    estatus_validos = ['Pendiente', 'En proceso', 'Resuelto', 'Rechazado']
    if nuevo_estatus not in estatus_validos:
        return jsonify({"success": False, "error": "Estatus no válido"}), 400

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('UPDATE reportes SET estatus = ? WHERE id = ?', (nuevo_estatus, reporte_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": f"Reporte #{reporte_id} actualizado a '{nuevo_estatus}'"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)