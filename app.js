import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
};

function getRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => body += chunk.toString());
        request.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); } 
            catch (error) { reject(error); }
        });
        request.on('error', reject);
    });
}

function sendJson(response, statusCode, data) {
    response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(data));
}

function serveStaticFile(response, file) {
    fs.readFile(file, (err, data) => {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return response.end('404 - Página não encontrada');
        }
        const ext = path.extname(file).toLowerCase();
        response.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        response.end(data);
    });
}

function validarContato(data) {
    if (!data.nome || !data.email || !data.telefone || !data.data_nascimento || 
        !data.cep || !data.logradouro || !data.numero || !data.bairro || !data.cidade || !data.estado) {
        return 'Preencha todos os campos obrigatórios do formulário.';
    }
    if (!/^\d{5}-\d{3}\(/.test(data.cep) && !/^\d{8}\)/.test(data.cep)) {
        return 'Formato de CEP inválido.';
    }
    return null;
}

async function callback(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    const method = request.method;

    try {
        // ============================================================
        // ENDPOINTS DA API DE CONTATOS
        // ============================================================
        if (pathname.startsWith('/api/contatos')) {
            const id = url.searchParams.get('id');
            const q = url.searchParams.get('q');

            // POST - Criar Contato
            if (method === 'POST') {
                const data = await getRequestBody(request);
                const erro = validarContato(data);
                if (erro) return sendJson(response, 400, { error: erro });

                const sql = `INSERT INTO contatos (nome, email, telefone, data_nascimento, cep, logradouro, numero, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                db.run(sql, [
                    data.nome.trim(), data.email.trim().toLowerCase(), data.telefone.trim(), data.data_nascimento,
                    data.cep.trim(), data.logradouro.trim(), data.numero.trim(), data.bairro.trim(), data.cidade.trim(), data.estado.trim()
                ], function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE')) return sendJson(response, 409, { error: 'E-mail já cadastrado.' });
                        return sendJson(response, 500, { error: err.message });
                    }
                    sendJson(response, 201, { id: this.lastID, message: 'Contato salvo com sucesso!' });
                });
                return;
            }

            // GET - Ler Contatos
            if (method === 'GET') {
                if (id) {
                    db.get(`SELECT * FROM contatos WHERE id = ?`, [id], (err, row) => {
                        if (err) return sendJson(response, 500, { error: err.message });
                        if (!row) return sendJson(response, 404, { error: 'Contato não encontrado.' });
                        sendJson(response, 200, row);
                    });
                    return;
                }

                let sql = `SELECT * FROM contatos WHERE 1=1`;
                const params = [];
                if (q) {
                    sql += ` AND (id = ? OR nome LIKE ? OR email LIKE ? OR cidade LIKE ?)`;
                    const termo = `%${q}%`;
                    params.push(q, termo, termo, termo);
                }
                sql += ` ORDER BY nome ASC`;

                db.all(sql, params, (err, rows) => {
                    if (err) return sendJson(response, 500, { error: err.message });
                    sendJson(response, 200, rows);
                });
                return;
            }

            // PUT - Editar Contato
            if (method === 'PUT' && id) {
                const data = await getRequestBody(request);
                const erro = validarContato(data);
                if (erro) return sendJson(response, 400, { error: erro });

                const sql = `UPDATE contatos SET nome=?, email=?, telefone=?, data_nascimento=?, cep=?, logradouro=?, numero=?, bairro=?, cidade=?, estado=? WHERE id=?`;
                db.run(sql, [
                    data.nome.trim(), data.email.trim().toLowerCase(), data.telefone.trim(), data.data_nascimento,
                    data.cep.trim(), data.logradouro.trim(), data.numero.trim(), data.bairro.trim(), data.cidade.trim(), data.estado.trim(), id
                ], function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE')) return sendJson(response, 409, { error: 'E-mail já está em uso.' });
                        return sendJson(response, 500, { error: err.message });
                    }
                    if (this.changes === 0) return sendJson(response, 404, { error: 'Contato não localizado.' });
                    sendJson(response, 200, { message: 'Contato atualizado com sucesso!' });
                });
                return;
            }

            // DELETE - Remover Contato
            if (method === 'DELETE' && id) {
                db.run(`DELETE FROM contatos WHERE id = ?`, [id], function(err) {
                    if (err) return sendJson(response, 500, { error: err.message });
                    if (this.changes === 0) return sendJson(response, 404, { error: 'Contato não localizado.' });
                    sendJson(response, 200, { message: 'Contato removido com sucesso!' });
                });
                return;
            }
            return sendJson(response, 405, { error: 'Método não permitido.' });
        }

        // ============================================================
        // ROTEAMENTO DE ARQUIVOS ESTÁTICOS DO FRONTEND
        // ============================================================
        const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
        const file = path.resolve(publicDir, relativePath);

        if (!file.startsWith(path.resolve(publicDir))) {
            response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            return response.end('Proibido');
        }

        serveStaticFile(response, file);
    } catch (error) {
        sendJson(response, 500, { error: 'Erro interno no servidor.', details: error.message });
    }
}

const server = http.createServer(callback);
const PORT = 5000;
server.listen(PORT, () => console.log(`Agenda rodando em http://localhost:${PORT}/`));
