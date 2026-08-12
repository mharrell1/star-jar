import http.server
import socketserver
import json
import sqlite3
import os
import sys
import urllib.parse
import time
from datetime import datetime

PORT = int(os.environ.get("PORT", 8000))
DB_PATH = os.path.join(os.path.dirname(__file__), "starjar.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            activities TEXT NOT NULL,
            history TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

class StarJarApiHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/user':
            query = urllib.parse.parse_qs(parsed.query)
            email = query.get('email', [''])[0].strip().lower()
            if not email:
                return self.send_json({'error': 'Email required'}, 400)
            
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE lower(email) = ?", (email,))
            row = cursor.fetchone()
            conn.close()

            if row:
                try:
                    activities = json.loads(row['activities'])
                except:
                    activities = []
                try:
                    history = json.loads(row['history'])
                except:
                    history = []
                
                return self.send_json({
                    'success': True,
                    'user': {
                        'id': row['id'],
                        'email': row['email'],
                        'name': row['name'],
                        'activities': activities,
                        'history': history,
                        'updatedAt': row['updated_at']
                    }
                })
            else:
                return self.send_json({'error': 'User not found'}, 404)

        # Fallback to static file server
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            req = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            return self.send_json({'error': 'Invalid JSON body'}, 400)

        if parsed.path == '/api/register':
            email = req.get('email', '').strip().lower()
            password = req.get('password', '')
            name = req.get('name', '').strip() or email.split('@')[0]
            activities = req.get('activities', [])
            history = req.get('history', [])

            if not email or not password:
                return self.send_json({'error': 'Email and password are required.'}, 400)

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE lower(email) = ?", (email,))
            if cursor.fetchone():
                conn.close()
                return self.send_json({'error': 'An account with this email already exists.'}, 400)

            user_id = f"usr-{int(time.time() * 1000)}"
            now_iso = datetime.utcnow().isoformat() + "Z"
            act_json = json.dumps(activities)
            hist_json = json.dumps(history)

            cursor.execute("""
                INSERT INTO users (id, email, password, name, activities, history, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, email, password, name, act_json, hist_json, now_iso, now_iso))
            conn.commit()
            conn.close()

            return self.send_json({
                'success': True,
                'user': {
                    'id': user_id,
                    'email': email,
                    'name': name,
                    'activities': activities,
                    'history': history,
                    'createdAt': now_iso
                }
            })

        elif parsed.path == '/api/login':
            email = req.get('email', '').strip().lower()
            password = req.get('password', '')

            if not email or not password:
                return self.send_json({'error': 'Email and password are required.'}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE lower(email) = ?", (email,))
            row = cursor.fetchone()
            conn.close()

            if not row:
                return self.send_json({'error': 'Invalid email or password.'}, 401)

            if row['password'] != password:
                return self.send_json({'error': 'Invalid email or password.'}, 401)

            try:
                activities = json.loads(row['activities'])
            except:
                activities = []
            try:
                history = json.loads(row['history'])
            except:
                history = []

            return self.send_json({
                'success': True,
                'user': {
                    'id': row['id'],
                    'email': row['email'],
                    'name': row['name'],
                    'activities': activities,
                    'history': history,
                    'updatedAt': row['updated_at']
                }
            })

        elif parsed.path == '/api/sync':
            email = req.get('email', '').strip().lower()
            password = req.get('password', '')
            user_id = req.get('id', '')
            name = req.get('name', '').strip() or email.split('@')[0]
            activities = req.get('activities', [])
            history = req.get('history', [])

            if not email:
                return self.send_json({'error': 'Email is required.'}, 400)

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE lower(email) = ?", (email,))
            row = cursor.fetchone()

            now_iso = datetime.utcnow().isoformat() + "Z"
            act_json = json.dumps(activities)
            hist_json = json.dumps(history)

            if row:
                cursor.execute("""
                    UPDATE users
                    SET activities = ?, history = ?, updated_at = ?
                    WHERE lower(email) = ?
                """, (act_json, hist_json, now_iso, email))
            else:
                new_id = user_id or f"usr-{int(time.time() * 1000)}"
                cursor.execute("""
                    INSERT INTO users (id, email, password, name, activities, history, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (new_id, email, password or 'pass123', name, act_json, hist_json, now_iso, now_iso))

            conn.commit()
            conn.close()

            return self.send_json({'success': True, 'syncedAt': now_iso})

        else:
            return self.send_json({'error': 'Endpoint not found'}, 404)

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == '__main__':
    with ThreadedHTTPServer(("", PORT), StarJarApiHandler) as httpd:
        print(f"Serving multithreaded API & Static files at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
