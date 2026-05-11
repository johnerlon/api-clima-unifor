# API de Agregação de Dados Climáticos (N703)

API em Node.js/Express que consulta a BrasilAPI para combinar dados geográficos e climáticos de cidades brasileiras.

## Como executar

1. Instale as dependências com `npm install`.
2. Inicie a API com `npm start`.
3. Acesse em `http://localhost:3000`.

## Testes

Execute a suíte com:

```bash
npm test
```

## Endpoints

### `GET /api/v1/health`
Retorna o status da aplicação.

Resposta:

```json
{
  "status": "healthy",
  "versao": "1.0.0",
  "timestamp": "2026-05-06T22:00:00.000Z"
}
```

### `GET /api/v1/clima/:nome_cidade`
Busca cidade e previsão climática.

Exemplo:

```bash
GET /api/v1/clima/Fortaleza
```

Resposta de sucesso:

```json
{
  "nome": "Fortaleza",
  "estado": "CE",
  "clima": {
    "temperatura_min": 23,
    "temperatura_max": 32,
    "condicao": "Chuva",
    "unidades": {
      "temperatura": "°C"
    }
  },
  "consultado_em": "2026-05-06T22:00:00.000Z"
}
```

Erros esperados:

```json
{
  "erro": true,
  "codigo": "NOME_INVALIDO",
  "mensagem": "O nome da cidade deve conter pelo menos 2 caracteres"
}
```

```json
{
  "erro": true,
  "codigo": "CIDADE_NAO_ENCONTRADA",
  "mensagem": "Nenhuma cidade encontrada com o nome informado"
}
```

### `GET /api/v1/cidades/:sigla_uf`
Lista cidades de um estado.

Exemplo:

```bash
GET /api/v1/cidades/CE?limite=5
```

Regras:

* `sigla_uf` deve ter exatamente 2 letras.
* `limite` deve ficar entre `1` e `100`.

Resposta de sucesso:

```json
{
  "uf": "CE",
  "quantidade_retornada": 5,
  "cidades": [
    { "nome": "ABAIARA" }
  ],
  "consultado_em": "2026-05-06T22:00:00.000Z"
}
```

## Estrutura

* `src/` contém a API.
* `tests/` contém testes automatizados.
* `docs/postman_collection.json` contém a coleção Postman.
* `INTEGRANTES.md` contém os dados da equipe.

## Observações

* A API depende de serviços públicos externos.
* Se a BrasilAPI estiver indisponível, o endpoint de clima pode retornar `503`.
