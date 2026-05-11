import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { pathToFileURL } from 'node:url';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    versao: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/clima/:nome_cidade', async (req, res) => {
  const { nome_cidade } = req.params;

  if (nome_cidade.length < 2) {
    return res.status(400).json({
      erro: true,
      codigo: 'NOME_INVALIDO',
      mensagem: 'O nome da cidade deve conter pelo menos 2 caracteres',
      nome_informado: nome_cidade
    });
  }

  try {
    let buscaCidade;
    try {
      buscaCidade = await axios.get(
        `https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(nome_cidade)}`
      );
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({
          erro: true,
          codigo: 'CIDADE_NAO_ENCONTRADA',
          mensagem: 'Nenhuma cidade encontrada com o nome informado',
          nome_informado: nome_cidade
        });
      }

      throw error;
    }

    if (!buscaCidade.data || buscaCidade.data.length === 0) {
      return res.status(404).json({
        erro: true,
        codigo: 'CIDADE_NAO_ENCONTRADA',
        mensagem: 'Nenhuma cidade encontrada com o nome informado',
        nome_informado: nome_cidade
      });
    }

    const cidade = Array.isArray(buscaCidade.data) ? buscaCidade.data[0] : buscaCidade.data;
    const climaRes = await axios.get(
      `https://brasilapi.com.br/api/cptec/v1/clima/previsao/${cidade.id}`
    );
    const dados = climaRes.data;
    const previsao = dados.clima?.[0];

    res.status(200).json({
      nome: cidade.nome || dados.cidade,
      estado: cidade.estado || dados.estado,
      clima: {
        temperatura_min: previsao?.min,
        temperatura_max: previsao?.max,
        condicao: previsao?.condicao_desc,
        unidades: {
          temperatura: '°C'
        }
      },
      consultado_em: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      erro: true,
      codigo: 'SERVICO_EXTERNO_INDISPONIVEL',
      mensagem: 'Não foi possível obter dados do serviço externo.',
      servico: 'CPTEC'
    });
  }
});

app.get('/api/v1/cidades/:sigla_uf', async (req, res) => {
  const { sigla_uf } = req.params;
  const limiteSolicitado = Number.parseInt(req.query.limite ?? '10', 10);
  const limite = Number.isNaN(limiteSolicitado) ? 10 : limiteSolicitado;

  if (sigla_uf.length !== 2) {
    return res.status(400).json({
      erro: true,
      codigo: 'SIGLA_UF_INVALIDA',
      mensagem: 'A sigla do estado deve conter exatamente 2 letras',
      sigla_uf_informada: sigla_uf
    });
  }

  if (limite < 1 || limite > 100) {
    return res.status(400).json({
      erro: true,
      codigo: 'LIMITE_INVALIDO',
      mensagem: 'O limite deve estar entre 1 e 100',
      limite_informado: req.query.limite
    });
  }

  try {
    const response = await axios.get(
      `https://brasilapi.com.br/api/ibge/municipios/v1/${sigla_uf}`
    );
    const cidades = response.data.slice(0, limite).map((cidade) => ({ nome: cidade.nome }));

    res.status(200).json({
      uf: sigla_uf.toUpperCase(),
      quantidade_retornada: cidades.length,
      cidades,
      consultado_em: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      erro: true,
      codigo: 'UF_NAO_ENCONTRADA',
      mensagem: 'Estado com a sigla informada não foi encontrado',
      sigla_uf_informada: sigla_uf
    });
  }
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

export { app, PORT };
