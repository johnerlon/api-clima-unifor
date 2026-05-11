import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from '../src/index.js';

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve) => server.close(resolve));
});

test('health check deve responder 200', async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'healthy');
});

test('cidades deve retornar lista do CE', async () => {
  const response = await fetch(`${baseUrl}/api/v1/cidades/CE?limite=5`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.uf, 'CE');
  assert.ok(Array.isArray(body.cidades));
  assert.ok(body.cidades.length > 0);
});

test('clima deve retornar dados de Fortaleza', async () => {
  const response = await fetch(`${baseUrl}/api/v1/clima/Fortaleza`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.nome, 'Fortaleza');
  assert.equal(body.estado, 'CE');
  assert.ok(body.clima);
  assert.ok(typeof body.clima.temperatura_min === 'number');
  assert.ok(typeof body.clima.temperatura_max === 'number');
});

test('clima deve retornar 404 para cidade inexistente', async () => {
  const response = await fetch(`${baseUrl}/api/v1/clima/CidadeQueNaoExiste123`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.codigo, 'CIDADE_NAO_ENCONTRADA');
});

test('clima deve retornar 400 para nome curto', async () => {
  const response = await fetch(`${baseUrl}/api/v1/clima/X`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.codigo, 'NOME_INVALIDO');
});
