/**
 * DentBot / Morph — backend de lançamentos da planilha-espelho.
 *
 * Script VINCULADO à planilha (Extensões → Apps Script). Usa
 * SpreadsheetApp.getActiveSpreadsheet(), portanto não precisa de OAuth,
 * API key nem service account no front-end.
 *
 * Tudo que é configurável está no bloco CONFIG abaixo.
 * A escrita é ORIENTADA A CABEÇALHO: as colunas são localizadas pelo nome
 * lido da linha de cabeçalho, nunca por índice fixo. Adicionar ou reordenar
 * colunas na planilha não quebra nada.
 */

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

var CONFIG = {
  // Filtro simples contra bots que achem a URL. NÃO é segurança — ver README.
  // Troque por qualquer string e repita a MESMA em app.js.
  TOKEN: "dentbot-7f3a91",

  // O PIN de verdade fica em PropertiesService (hash). Rode definirPin() uma vez.
  PIN_OBRIGATORIO: true,
  MAX_FALHAS_PIN: 10, // tentativas erradas antes de bloquear
  JANELA_BLOQUEIO_MIN: 15, // minutos de bloqueio

  TIMEZONE: "America/Sao_Paulo",

  // Layout comum às abas de lançamento: cabeçalho na linha 3, dados a partir da 4.
  HEADER_ROW: 3,
  FIRST_DATA_ROW: 4,

  // Colunas que o script cria ao final da aba se ainda não existirem.
  COLUNAS_EXTRAS: ["Observação", "ID", "criado_em"],

  // Texto que identifica a linha de demonstração a ser substituída no 1º uso.
  MARCA_LINHA_EXEMPLO: "(exemplo)",

  TIPOS: {
    despesa: {
      aba: "Despesas",
      colData: "Data",
      colValor: "Valor",
      colDescricao: "Descrição",
      colCategoria: "Categoria",
      // Colunas com fórmula: o script NUNCA escreve valor nelas, apenas
      // replica a fórmula da linha modelo.
      calculadas: ["Competência"],
      // Campo do formulário -> coluna da planilha.
      campos: {
        data: "Data",
        categoria: "Categoria",
        descricao: "Descrição",
        fornecedor: "Fornecedor",
        valor: "Valor",
        observacao: "Observação",
      },
      obrigatorios: ["data", "descricao", "valor"],
      // Colunas cujas opções vêm da validação de dados da própria planilha.
      selects: { categoria: "Categoria" },
    },
    receita: {
      aba: "Recebimentos",
      colData: "Data",
      colValor: "Valor bruto",
      colValorLiquido: "Valor líquido",
      colDescricao: "Cliente",
      colCategoria: "Tipo",
      colStatus: "Status",
      statusPago: "Pago",
      calculadas: ["Taxa Cakto", "Valor líquido", "Competência"],
      campos: {
        data: "Data",
        descricao: "Cliente",
        categoria: "Tipo",
        meio: "Meio",
        valor: "Valor bruto",
        status: "Status",
        observacao: "Observação",
      },
      obrigatorios: ["data", "descricao", "valor"],
      selects: { categoria: "Tipo", meio: "Meio", status: "Status" },
    },
  },
};

// ---------------------------------------------------------------------------
// Roteamento HTTP
// ---------------------------------------------------------------------------

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return json({ ok: false, error: "JSON inválido no corpo da requisição." });
  }
  return rotear(body);
}

function doGet(e) {
  // Útil para debug pelo navegador: ?action=summary&token=...&pin=...
  var params = (e && e.parameter) || {};
  return rotear(params);
}

function rotear(req) {
  try {
    var acao = String(req.action || "").toLowerCase();

    if (acao === "ping") {
      return json({ ok: true, pong: true, versao: "1.0.0" });
    }

    var auth = autenticar(req, acao);
    if (!auth.ok) return json(auth);

    switch (acao) {
      case "meta":
        return json(acaoMeta());
      case "create":
        return json(acaoCreate(req));
      case "delete":
        return json(acaoDelete(req));
      case "list":
        return json(acaoList(req));
      case "summary":
        return json(acaoSummary(req));
      case "auth":
        return json({ ok: true, autenticado: true });
      default:
        return json({ ok: false, error: 'Ação desconhecida: "' + acao + '".' });
    }
  } catch (err) {
    // Nunca devolve exception crua para o front.
    return json({
      ok: false,
      error: "Erro no servidor: " + (err && err.message ? err.message : err),
    });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ---------------------------------------------------------------------------
// Autenticação: token (filtro) + PIN (validado no servidor)
// ---------------------------------------------------------------------------

function autenticar(req, acao) {
  if (String(req.token || "") !== CONFIG.TOKEN) {
    return { ok: false, error: "Token inválido.", codigo: "TOKEN" };
  }
  if (!CONFIG.PIN_OBRIGATORIO) return { ok: true };

  var props = PropertiesService.getScriptProperties();
  var hashSalvo = props.getProperty("PIN_HASH");
  if (!hashSalvo) {
    return {
      ok: false,
      error:
        "Senha ainda não configurada. Rode definirPin() no editor do Apps Script.",
      codigo: "SEM_PIN",
    };
  }

  var bloqueadoAte = Number(props.getProperty("PIN_BLOQUEADO_ATE") || 0);
  var agora = Date.now();
  if (bloqueadoAte > agora) {
    var faltam = Math.ceil((bloqueadoAte - agora) / 60000);
    return {
      ok: false,
      error: "Muitas tentativas erradas. Tente de novo em " + faltam + " min.",
      codigo: "BLOQUEADO",
    };
  }

  var pin = String(req.pin || "").trim();
  if (!pin) {
    return { ok: false, error: "Senha obrigatória.", codigo: "PIN" };
  }

  if (hashPin(pin) !== hashSalvo) {
    var falhas = Number(props.getProperty("PIN_FALHAS") || 0) + 1;
    props.setProperty("PIN_FALHAS", String(falhas));
    if (falhas >= CONFIG.MAX_FALHAS_PIN) {
      props.setProperty(
        "PIN_BLOQUEADO_ATE",
        String(agora + CONFIG.JANELA_BLOQUEIO_MIN * 60000),
      );
      props.setProperty("PIN_FALHAS", "0");
    }
    return { ok: false, error: "Senha incorreta.", codigo: "PIN" };
  }

  props.deleteProperty("PIN_FALHAS");
  return { ok: true };
}

function hashPin(pin) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    "dentbot::" + pin,
    Utilities.Charset.UTF_8,
  );
  return bytes
    .map(function (b) {
      return ("0" + (b & 0xff).toString(16)).slice(-2);
    })
    .join("");
}

/**
 * Rode UMA VEZ no editor do Apps Script para gravar a senha.
 *
 * Depois de rodar, APAGUE o valor abaixo (deixe var SENHA = '';) antes de
 * commitar. O que fica guardado na planilha é só o hash SHA-256 — o arquivo
 * não precisa mais da senha em texto puro.
 */
function definirPin() {
  var SENHA = ""; // <<< RODE UMA VEZ E APAGUE ESTE VALOR

  var PIN = String(SENHA || "").trim();
  if (PIN.length < 4)
    throw new Error("Use uma senha de pelo menos 4 caracteres.");
  var props = PropertiesService.getScriptProperties();
  props.setProperty("PIN_HASH", hashPin(PIN));
  props.deleteProperty("PIN_FALHAS");
  props.deleteProperty("PIN_BLOQUEADO_ATE");
  Logger.log(
    "Senha gravada (%s caracteres). Apague o valor da variável SENHA neste arquivo.",
    PIN.length,
  );
}

/** Diagnóstico rápido pelo editor. */
function verStatus() {
  var props = PropertiesService.getScriptProperties();
  Logger.log("PIN configurado: %s", !!props.getProperty("PIN_HASH"));
  Logger.log("Falhas: %s", props.getProperty("PIN_FALHAS") || 0);
  Object.keys(CONFIG.TIPOS).forEach(function (t) {
    var ctx = abrir(t);
    Logger.log(
      '%s -> aba "%s", colunas: %s',
      t,
      ctx.cfg.aba,
      JSON.stringify(Object.keys(ctx.mapa)),
    );
  });
}

// ---------------------------------------------------------------------------
// Acesso à planilha, orientado a cabeçalho
// ---------------------------------------------------------------------------

/** Normaliza um cabeçalho para comparação tolerante (acento, caixa, espaço). */
function chaveCol(texto) {
  return String(texto == null ? "" : texto)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ");
}

/**
 * Abre a aba de um tipo e devolve o contexto: sheet, config e o mapa
 * cabeçalho -> índice de coluna (1-based). Cria as colunas extras se faltarem.
 */
function abrir(tipo) {
  var cfg = CONFIG.TIPOS[tipo];
  if (!cfg)
    throw new Error(
      'Tipo inválido: "' + tipo + '". Use "despesa" ou "receita".',
    );

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(cfg.aba);
  if (!sheet)
    throw new Error('Aba "' + cfg.aba + '" não encontrada na planilha.');

  garantirColunasExtras(sheet);

  return { sheet: sheet, cfg: cfg, mapa: lerMapaCabecalho(sheet) };
}

function lerMapaCabecalho(sheet) {
  var largura = Math.max(sheet.getLastColumn(), 1);
  var cabecalhos = sheet
    .getRange(CONFIG.HEADER_ROW, 1, 1, largura)
    .getValues()[0];
  var mapa = {};
  cabecalhos.forEach(function (h, i) {
    var k = chaveCol(h);
    if (k && !mapa[k]) mapa[k] = i + 1;
  });
  return mapa;
}

function col(ctx, nome) {
  var c = ctx.mapa[chaveCol(nome)];
  if (!c)
    throw new Error(
      'Coluna "' + nome + '" não existe na aba "' + ctx.cfg.aba + '".',
    );
  return c;
}

function colOpcional(ctx, nome) {
  return ctx.mapa[chaveCol(nome)] || 0;
}

/** Acrescenta Observação / ID / criado_em ao final do cabeçalho, se faltarem. */
function garantirColunasExtras(sheet) {
  var mapa = lerMapaCabecalho(sheet);
  var proxima = sheet.getLastColumn() + 1;
  var criou = false;

  CONFIG.COLUNAS_EXTRAS.forEach(function (nome) {
    if (mapa[chaveCol(nome)]) return;
    if (proxima > sheet.getMaxColumns())
      sheet.insertColumnsAfter(sheet.getMaxColumns(), 1);
    var celula = sheet.getRange(CONFIG.HEADER_ROW, proxima);
    celula.setValue(nome);
    // Copia o visual do cabeçalho vizinho para não destoar.
    if (proxima > 1) {
      sheet
        .getRange(CONFIG.HEADER_ROW, proxima - 1)
        .copyTo(celula, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      celula.setValue(nome);
    }
    mapa[chaveCol(nome)] = proxima;
    proxima++;
    criou = true;
  });

  if (criou) SpreadsheetApp.flush();
}

/** Limite superior de leitura. Pode incluir linhas só com fórmula. */
function ultimaLinha(sheet) {
  return Math.max(sheet.getLastRow(), CONFIG.FIRST_DATA_ROW - 1);
}

/**
 * Última linha com LANÇAMENTO de verdade.
 *
 * Não dá para usar getLastRow(): as abas costumam ter as colunas calculadas
 * pré-preenchidas em dezenas de linhas vazias (fórmulas que devolvem ""), e o
 * getLastRow conta isso como conteúdo. Aqui olhamos só as colunas que o usuário
 * preenche — data, descrição e valor.
 */
function ultimaLinhaComDados(ctx) {
  var fim = ultimaLinha(ctx.sheet);
  if (fim < CONFIG.FIRST_DATA_ROW) return CONFIG.FIRST_DATA_ROW - 1;

  var colunas = [ctx.cfg.colData, ctx.cfg.colDescricao, ctx.cfg.colValor]
    .map(function (nome) {
      return colOpcional(ctx, nome);
    })
    .filter(Boolean);

  var altura = fim - CONFIG.FIRST_DATA_ROW + 1;
  var ultima = CONFIG.FIRST_DATA_ROW - 1;

  colunas.forEach(function (c) {
    var valores = ctx.sheet
      .getRange(CONFIG.FIRST_DATA_ROW, c, altura, 1)
      .getValues();
    for (var i = valores.length - 1; i >= 0; i--) {
      if (String(valores[i][0]).trim() !== "") {
        ultima = Math.max(ultima, CONFIG.FIRST_DATA_ROW + i);
        break;
      }
    }
  });

  return ultima;
}

/**
 * Linha de destino do próximo lançamento. Se a linha de exemplo ainda estiver
 * lá (descrição contendo "(exemplo)"), ela é reaproveitada — o lançamento real
 * substitui a demonstração.
 */
function linhaDestino(ctx) {
  var fim = ultimaLinhaComDados(ctx);

  if (fim >= CONFIG.FIRST_DATA_ROW) {
    var cDesc = col(ctx, ctx.cfg.colDescricao);
    var descricoes = ctx.sheet
      .getRange(
        CONFIG.FIRST_DATA_ROW,
        cDesc,
        fim - CONFIG.FIRST_DATA_ROW + 1,
        1,
      )
      .getValues();
    for (var i = 0; i < descricoes.length; i++) {
      var v = String(descricoes[i][0] || "").toLowerCase();
      if (v.indexOf(CONFIG.MARCA_LINHA_EXEMPLO) !== -1) {
        var linha = CONFIG.FIRST_DATA_ROW + i;
        limparLinhaExemplo(ctx, linha);
        return linha;
      }
    }
  }
  return fim + 1;
}

/** Zera os campos editáveis da linha de exemplo, preservando as fórmulas. */
function limparLinhaExemplo(ctx, linha) {
  var calculadas = {};
  (ctx.cfg.calculadas || []).forEach(function (n) {
    calculadas[chaveCol(n)] = true;
  });

  Object.keys(ctx.cfg.campos).forEach(function (campo) {
    var nome = ctx.cfg.campos[campo];
    if (calculadas[chaveCol(nome)]) return;
    var c = colOpcional(ctx, nome);
    if (c) {
      var celula = ctx.sheet.getRange(linha, c);
      celula.clearContent();
      celula.setFontStyle("normal"); // a linha de exemplo vinha em itálico
    }
  });
}

/**
 * Replica as fórmulas das colunas calculadas na linha nova, copiando de uma
 * linha modelo (a última acima que tenha fórmula naquela coluna). Se a planilha
 * usar ARRAYFORMULA, não há o que copiar e a célula já se preenche sozinha.
 */
function replicarFormulas(ctx, linha) {
  var sheet = ctx.sheet;
  (ctx.cfg.calculadas || []).forEach(function (nome) {
    var c = colOpcional(ctx, nome);
    if (!c) return;
    if (sheet.getRange(linha, c).getFormula()) return; // já preenchida

    for (var r = linha - 1; r >= CONFIG.FIRST_DATA_ROW; r--) {
      var modelo = sheet.getRange(r, c);
      if (modelo.getFormula()) {
        modelo.copyTo(sheet.getRange(linha, c)); // ajusta referências relativas
        return;
      }
    }
  });
}

/**
 * Copia formatação (moeda, data, bordas) e as listas de validação da linha
 * anterior para a nova, para que a linha inserida fique igual às de cima.
 */
function herdarFormato(ctx, linha) {
  if (linha <= CONFIG.FIRST_DATA_ROW) return;

  var largura = ctx.sheet.getLastColumn();
  var origem = ctx.sheet.getRange(linha - 1, 1, 1, largura);
  var destino = ctx.sheet.getRange(linha, 1, 1, largura);

  origem.copyTo(destino, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  origem.copyTo(
    destino,
    SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,
    false,
  );
  destino.setFontStyle("normal"); // a linha de exemplo é itálica; não herdar isso
}

// ---------------------------------------------------------------------------
// Validação de entrada
// ---------------------------------------------------------------------------

function parseValor(bruto) {
  if (typeof bruto === "number") return bruto;
  var s = String(bruto == null ? "" : bruto).trim();
  if (!s) return NaN;
  // Aceita "1.234,56", "1234.56" e "1234,56".
  s = s.replace(/[R$\s ]/gi, "");
  if (s.indexOf(",") !== -1) s = s.replace(/\./g, "").replace(",", ".");
  return Number(s);
}

function parseData(bruto) {
  if (bruto instanceof Date) return isNaN(bruto.getTime()) ? null : bruto;
  var s = String(bruto == null ? "" : bruto).trim();

  var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  var br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));

  var d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function gerarId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------

/**
 * Devolve ao front as opções de cada select, lidas da VALIDAÇÃO DE DADOS da
 * própria planilha. Nada de lista duplicada no código.
 */
function acaoMeta() {
  var out = { ok: true, tipos: {} };

  Object.keys(CONFIG.TIPOS).forEach(function (tipo) {
    var ctx = abrir(tipo);
    var selects = {};
    var cfgSelects = ctx.cfg.selects || {};
    Object.keys(cfgSelects).forEach(function (campo) {
      selects[campo] = lerOpcoesValidacao(ctx, cfgSelects[campo]);
    });
    out.tipos[tipo] = {
      aba: ctx.cfg.aba,
      selects: selects,
      colunas: Object.keys(ctx.cfg.campos).filter(function (campo) {
        return !!colOpcional(ctx, ctx.cfg.campos[campo]);
      }),
      statusPago: ctx.cfg.statusPago || null,
    };
  });

  return out;
}

function lerOpcoesValidacao(ctx, nomeColuna) {
  var c = colOpcional(ctx, nomeColuna);
  if (!c) return [];

  var fim = Math.min(ultimaLinha(ctx.sheet) + 5, ctx.sheet.getMaxRows());
  for (var r = CONFIG.FIRST_DATA_ROW; r <= fim; r++) {
    var regra = ctx.sheet.getRange(r, c).getDataValidation();
    if (!regra) continue;

    var tipoRegra = regra.getCriteriaType();
    var valores = regra.getCriteriaValues();

    if (tipoRegra === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
      return (valores[0] || []).map(String).filter(String);
    }
    if (tipoRegra === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE) {
      return valores[0]
        .getValues()
        .map(function (linha) {
          return String(linha[0] || "").trim();
        })
        .filter(String);
    }
  }
  return [];
}

function acaoCreate(req) {
  var tipo = String(req.tipo || "").toLowerCase();
  var ctx = abrir(tipo);
  var dados = req.dados || {};

  // --- validação server-side ---
  var faltando = (ctx.cfg.obrigatorios || []).filter(function (campo) {
    var v = dados[campo];
    return v == null || String(v).trim() === "";
  });
  if (faltando.length) {
    return {
      ok: false,
      error:
        "Campos obrigatórios não preenchidos: " + faltando.join(", ") + ".",
    };
  }

  var valor = parseValor(dados.valor);
  if (!isFinite(valor) || valor <= 0) {
    return { ok: false, error: "Valor precisa ser um número maior que zero." };
  }

  var data = parseData(dados.data);
  if (!data) return { ok: false, error: "Data inválida." };
  var ano = data.getFullYear();
  if (ano < 2000 || ano > 2100)
    return { ok: false, error: "Data fora de um intervalo plausível." };

  var descricao = String(dados.descricao || "").trim();
  if (!descricao)
    return { ok: false, error: "A descrição não pode ficar vazia." };

  // Selects: se a planilha tem lista de validação, o valor precisa estar nela.
  var erroSelect = null;
  Object.keys(ctx.cfg.selects || {}).forEach(function (campo) {
    if (erroSelect) return;
    var v = String(dados[campo] || "").trim();
    if (!v) return;
    var opcoes = lerOpcoesValidacao(ctx, ctx.cfg.selects[campo]);
    if (opcoes.length && opcoes.indexOf(v) === -1) {
      erroSelect =
        'Valor "' + v + '" não é uma opção válida para ' + campo + ".";
    }
  });
  if (erroSelect) return { ok: false, error: erroSelect };

  // --- escrita, sob lock ---
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return {
      ok: false,
      error: "A planilha está ocupada. Tente de novo em alguns segundos.",
    };
  }

  try {
    // Reabre depois do lock: outra requisição pode ter mudado o estado.
    ctx = abrir(tipo);
    var linha = linhaDestino(ctx);
    var id = gerarId();

    herdarFormato(ctx, linha);

    var calculadas = {};
    (ctx.cfg.calculadas || []).forEach(function (n) {
      calculadas[chaveCol(n)] = true;
    });

    Object.keys(ctx.cfg.campos).forEach(function (campo) {
      var nomeColuna = ctx.cfg.campos[campo];
      if (calculadas[chaveCol(nomeColuna)]) return; // nunca escreve por cima de fórmula

      var c = colOpcional(ctx, nomeColuna);
      if (!c) return;

      var valorCelula;
      if (campo === "data") valorCelula = data;
      else if (campo === "valor") valorCelula = valor;
      else
        valorCelula = String(dados[campo] == null ? "" : dados[campo]).trim();

      if (valorCelula === "") return;
      ctx.sheet.getRange(linha, c).setValue(valorCelula);
    });

    ctx.sheet.getRange(linha, col(ctx, "ID")).setValue(id);
    ctx.sheet.getRange(linha, col(ctx, "criado_em")).setValue(new Date());

    replicarFormulas(ctx, linha);
    SpreadsheetApp.flush();

    return {
      ok: true,
      id: id,
      tipo: tipo,
      linha: linha,
      aba: ctx.cfg.aba,
      resumo: acaoSummary({}),
    };
  } finally {
    lock.releaseLock();
  }
}

function acaoDelete(req) {
  var id = String(req.id || "").trim();
  if (!id) return { ok: false, error: "ID não informado." };

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return {
      ok: false,
      error: "A planilha está ocupada. Tente de novo em alguns segundos.",
    };
  }

  try {
    var tipos = req.tipo
      ? [String(req.tipo).toLowerCase()]
      : Object.keys(CONFIG.TIPOS);

    for (var i = 0; i < tipos.length; i++) {
      var ctx = abrir(tipos[i]);
      var fim = ultimaLinha(ctx.sheet);
      if (fim < CONFIG.FIRST_DATA_ROW) continue;

      var cId = col(ctx, "ID");
      var ids = ctx.sheet
        .getRange(
          CONFIG.FIRST_DATA_ROW,
          cId,
          fim - CONFIG.FIRST_DATA_ROW + 1,
          1,
        )
        .getValues();

      for (var j = 0; j < ids.length; j++) {
        if (String(ids[j][0]).trim() === id) {
          ctx.sheet.deleteRow(CONFIG.FIRST_DATA_ROW + j);
          SpreadsheetApp.flush();
          return { ok: true, id: id, tipo: tipos[i], resumo: acaoSummary({}) };
        }
      }
    }
    return {
      ok: false,
      error: "Lançamento não encontrado (talvez já tenha sido excluído).",
    };
  } finally {
    lock.releaseLock();
  }
}

function acaoList(req) {
  var limite = Math.min(Math.max(Number(req.limite || 10), 1), 100);
  var itens = [];

  Object.keys(CONFIG.TIPOS).forEach(function (tipo) {
    var ctx = abrir(tipo);
    var fim = ultimaLinha(ctx.sheet);
    if (fim < CONFIG.FIRST_DATA_ROW) return;

    var largura = ctx.sheet.getLastColumn();
    var valores = ctx.sheet
      .getRange(
        CONFIG.FIRST_DATA_ROW,
        1,
        fim - CONFIG.FIRST_DATA_ROW + 1,
        largura,
      )
      .getValues();

    var idx = {
      data: col(ctx, ctx.cfg.colData) - 1,
      valor: col(ctx, ctx.cfg.colValor) - 1,
      descricao: col(ctx, ctx.cfg.colDescricao) - 1,
      categoria: colOpcional(ctx, ctx.cfg.colCategoria) - 1,
      status: ctx.cfg.colStatus ? colOpcional(ctx, ctx.cfg.colStatus) - 1 : -1,
      id: col(ctx, "ID") - 1,
      criado: col(ctx, "criado_em") - 1,
    };

    valores.forEach(function (linha, i) {
      var data = linha[idx.data];
      var valor = linha[idx.valor];
      var descricao = String(linha[idx.descricao] || "").trim();
      if (!descricao && !(data instanceof Date) && !valor) return; // linha vazia
      if (descricao.toLowerCase().indexOf(CONFIG.MARCA_LINHA_EXEMPLO) !== -1)
        return;

      var criado = linha[idx.criado];
      itens.push({
        tipo: tipo,
        id: String(linha[idx.id] || ""),
        linha: CONFIG.FIRST_DATA_ROW + i,
        data:
          data instanceof Date
            ? Utilities.formatDate(data, CONFIG.TIMEZONE, "yyyy-MM-dd")
            : String(data || ""),
        descricao: descricao,
        categoria: idx.categoria >= 0 ? String(linha[idx.categoria] || "") : "",
        status: idx.status >= 0 ? String(linha[idx.status] || "") : "",
        valor: Number(valor) || 0,
        ordem:
          criado instanceof Date
            ? criado.getTime()
            : data instanceof Date
              ? data.getTime()
              : 0,
      });
    });
  });

  itens.sort(function (a, b) {
    return b.ordem - a.ordem;
  });
  return { ok: true, itens: itens.slice(0, limite) };
}

function acaoSummary(req) {
  var hoje = new Date();
  var ref =
    String((req && req.competencia) || "") ||
    Utilities.formatDate(hoje, CONFIG.TIMEZONE, "yyyy-MM");

  var totalDespesas = 0;
  var totalReceitasBruto = 0;
  var totalReceitasLiquido = 0;
  var porCategoria = {};
  var pendentes = 0;

  // --- despesas ---
  var d = abrir("despesa");
  percorrer(d, function (linha, ctx) {
    var data = linha[col(ctx, ctx.cfg.colData) - 1];
    if (!(data instanceof Date) || competencia(data) !== ref) return;

    var valor = Number(linha[col(ctx, ctx.cfg.colValor) - 1]) || 0;
    totalDespesas += valor;

    var cat =
      String(
        linha[colOpcional(ctx, ctx.cfg.colCategoria) - 1] || "Sem categoria",
      ).trim() || "Sem categoria";
    porCategoria[cat] = (porCategoria[cat] || 0) + valor;
  });

  // --- receitas ---
  var r = abrir("receita");
  percorrer(r, function (linha, ctx) {
    var data = linha[col(ctx, ctx.cfg.colData) - 1];
    if (!(data instanceof Date) || competencia(data) !== ref) return;

    var bruto = Number(linha[col(ctx, ctx.cfg.colValor) - 1]) || 0;
    var cLiquido = colOpcional(ctx, ctx.cfg.colValorLiquido);
    var liquido = cLiquido ? Number(linha[cLiquido - 1]) || 0 : bruto;
    var status = String(
      linha[colOpcional(ctx, ctx.cfg.colStatus) - 1] || "",
    ).trim();

    // O Rateio só considera Status = Pago; o resumo segue a mesma regra.
    if (status === ctx.cfg.statusPago) {
      totalReceitasBruto += bruto;
      totalReceitasLiquido += liquido;
    } else {
      pendentes += bruto;
    }
  });

  var categorias = Object.keys(porCategoria)
    .map(function (nome) {
      return { categoria: nome, total: porCategoria[nome] };
    })
    .sort(function (a, b) {
      return b.total - a.total;
    });

  return {
    ok: true,
    competencia: ref,
    despesas: arredondar(totalDespesas),
    receitasBruto: arredondar(totalReceitasBruto),
    receitas: arredondar(totalReceitasLiquido),
    pendentes: arredondar(pendentes),
    saldo: arredondar(totalReceitasLiquido - totalDespesas),
    categorias: categorias.map(function (c) {
      return { categoria: c.categoria, total: arredondar(c.total) };
    }),
  };
}

function percorrer(ctx, fn) {
  var fim = ultimaLinha(ctx.sheet);
  if (fim < CONFIG.FIRST_DATA_ROW) return;
  var largura = ctx.sheet.getLastColumn();
  ctx.sheet
    .getRange(
      CONFIG.FIRST_DATA_ROW,
      1,
      fim - CONFIG.FIRST_DATA_ROW + 1,
      largura,
    )
    .getValues()
    .forEach(function (linha) {
      fn(linha, ctx);
    });
}

function competencia(data) {
  return Utilities.formatDate(data, CONFIG.TIMEZONE, "yyyy-MM");
}

function arredondar(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}
