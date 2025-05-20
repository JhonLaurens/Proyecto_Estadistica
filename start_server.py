import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

print(f"Servidor iniciado en http://localhost:{PORT}")
httpd.serve_forever()
