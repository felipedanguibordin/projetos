/* ==========================================================================
   Caixa DentBot — front-end
   HTML/CSS/JS puro, sem build. Conversa com o Apps Script Web App.
   ========================================================================== */

"use strict";

// ---------------------------------------------------------------------------
// CONFIG — o único bloco que você precisa editar
// ---------------------------------------------------------------------------

var CONFIG = {
  // Cole aqui a URL da implantação do Web App (termina em /exec).
  URL: "https://script.google.com/macros/s/AKfycbw5KCjinsjboX9G8e0TZoT9DXI4JwU121PFY0cmOG77OYu7gTPt7EnDigALPH3m14dw/exec",

  // Precisa ser exatamente igual ao CONFIG.TOKEN do Code.gs.
  // Isto NÃO é segurança — é só um filtro contra bots. Ver README.
  TOKEN: "dentbot-7f3a91",

  // Quantos lançamentos aparecem na lista.
  LIMITE_LISTA: 10,

  // Segundos que o botão "Desfazer" fica disponível.
  SEGUNDOS_DESFAZER: 8,

  // Quantas categorias viram chip de lançamento rápido.
  MAX_CHIPS: 5,

  // Usadas só até o servidor responder com as opções reais da planilha.
  FALLBACK_SELECTS: {
    despesa: { categoria: [] },
    receita: { categoria: [], meio: [], status: [] },
  },

  CHAVES_STORAGE: {
    pin: "dentbot.pin",
    fila: "dentbot.fila",
  },
};

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

var estado = {
  tipo: "despesa",
  pin: "",
  meta: null,
  resumo: null,
  itens: [],
  enviando: false,
};

var $ = function (sel) {
  return document.querySelector(sel);
};
var $$ = function (sel) {
  return Array.prototype.slice.call(document.querySelectorAll(sel));
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

var moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

function formatarMoeda(n) {
  return moeda.format(Number(n) || 0);
}

/** "1234,5" / "R$ 1.234,50" -> 1234.5 */
function paraNumero(texto) {
  var s = String(texto == null ? "" : texto)
    .replace(/[^\d,-]/g, "")
    .replace(",", ".");
  var n = parseFloat(s);
  return isFinite(n) ? n : NaN;
}

/** Máscara BRL "de trás para frente": os dígitos entram pelos centavos. */
function mascararValor(bruto) {
  var digitos = String(bruto || "")
    .replace(/\D/g, "")
    .slice(0, 12);
  if (!digitos) return "";
  var n = Number(digitos) / 100;
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function hojeISO() {
  var d = new Date();
  var off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

function dataCurta(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  return m ? m[3] + "/" + m[2] : String(iso || "");
}

function nomeMes(competencia) {
  var m = /^(\d{4})-(\d{2})$/.exec(String(competencia || ""));
  if (!m) return competencia || "—";
  var meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return meses[Number(m[2]) - 1];
}

function ler(chave, padrao) {
  try {
    var v = localStorage.getItem(chave);
    return v == null ? padrao : JSON.parse(v);
  } catch (e) {
    return padrao;
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (e) {
    /* modo privado */
  }
}

// ---------------------------------------------------------------------------
// Comunicação com o Apps Script
//
// Requisição SIMPLES de propósito: Content-Type text/plain evita o preflight
// OPTIONS, que o Apps Script não responde. Nada de application/json, nada de
// mode: 'no-cors' (que impediria a leitura da resposta).
// ---------------------------------------------------------------------------

function chamar(acao, extras) {
  var corpo = Object.assign(
    {
      action: acao,
      token: CONFIG.TOKEN,
      pin: estado.pin,
    },
    extras || {},
  );

  if (!CONFIG.URL || CONFIG.URL.indexOf("COLE-AQUI") === 0) {
    return Promise.reject(
      new Error("URL do Web App não configurada em app.js."),
    );
  }

  return fetch(CONFIG.URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(corpo),
    redirect: "follow",
  })
    .then(function (r) {
      return r.text();
    })
    .then(function (texto) {
      var dados;
      try {
        dados = JSON.parse(texto);
      } catch (e) {
        // Normalmente é a página de login/autorização do Google devolvida como HTML.
        throw new Error(
          'Resposta inesperada do servidor. Confira se a implantação está com acesso "qualquer pessoa".',
        );
      }
      if (!dados.ok) {
        var erro = new Error(dados.error || "Falha desconhecida.");
        erro.codigo = dados.codigo;
        throw erro;
      }
      return dados;
    });
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

var toastTimer = null;

function toast(texto, opcoes) {
  opcoes = opcoes || {};
  var el = $("#toast");
  var elTexto = $("#toast-texto");
  var elAcao = $("#toast-acao");
  var elProgresso = $("#toast-progresso");

  clearTimeout(toastTimer);
  el.classList.remove("saindo");
  el.classList.toggle("erro", !!opcoes.erro);
  elTexto.textContent = texto;

  var segundos = opcoes.segundos || 4;

  if (opcoes.acao) {
    elAcao.hidden = false;
    elAcao.textContent = opcoes.acao;
    elAcao.onclick = function () {
      fecharToast();
      opcoes.aoClicar();
    };
  } else {
    elAcao.hidden = true;
    elAcao.onclick = null;
  }

  el.hidden = false;

  elProgresso.classList.remove("correndo");
  void elProgresso.offsetWidth; // força reinício da animação
  elProgresso.style.animationDuration = segundos + "s";
  elProgresso.classList.add("correndo");

  toastTimer = setTimeout(fecharToast, segundos * 1000);
}

function fecharToast() {
  var el = $("#toast");
  if (el.hidden) return;
  clearTimeout(toastTimer);
  el.classList.add("saindo");
  setTimeout(function () {
    el.hidden = true;
    el.classList.remove("saindo");
  }, 220);
}

// ---------------------------------------------------------------------------
// Fila offline — nenhum lançamento digitado se perde
// ---------------------------------------------------------------------------

function filaLer() {
  var f = ler(CONFIG.CHAVES_STORAGE.fila, []);
  return Array.isArray(f) ? f : [];
}

function filaGravar(fila) {
  gravar(CONFIG.CHAVES_STORAGE.fila, fila);
  renderFila();
}

function filaAdicionar(item) {
  var fila = filaLer();
  fila.push(item);
  filaGravar(fila);
}

function renderFila() {
  var fila = filaLer();
  var el = $("#fila");
  el.hidden = fila.length === 0;
  $("#fila-contagem").textContent =
    fila.length + (fila.length === 1 ? " lançamento" : " lançamentos");
}

function reenviarFila() {
  var fila = filaLer();
  if (!fila.length) return Promise.resolve();

  var btn = $("#btn-reenviar");
  btn.disabled = true;
  btn.textContent = "Enviando…";

  var restantes = [];
  var enviados = 0;

  var cadeia = fila.reduce(function (p, item) {
    return p.then(function () {
      return chamar("create", { tipo: item.tipo, dados: item.dados })
        .then(function () {
          enviados++;
        })
        .catch(function () {
          restantes.push(item);
        });
    });
  }, Promise.resolve());

  return cadeia.then(function () {
    filaGravar(restantes);
    btn.disabled = false;
    btn.textContent = "Reenviar";
    if (enviados) {
      toast(
        enviados +
          (enviados === 1 ? " lançamento enviado." : " lançamentos enviados."),
      );
      atualizarDados();
    }
    if (restantes.length) {
      toast(
        "Ainda não deu para enviar " +
          restantes.length +
          ". Guardados no aparelho.",
        { erro: true },
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Tipo (despesa / receita)
// ---------------------------------------------------------------------------

var ROTULOS = {
  despesa: {
    descricao: "Descrição",
    categoria: "Categoria",
    botao: "Lançar despesa",
  },
  receita: {
    descricao: "Cliente",
    categoria: "Tipo",
    botao: "Lançar recebimento",
  },
};

function definirTipo(tipo) {
  estado.tipo = tipo;
  var app = $("#app");
  app.dataset.tipo = tipo;

  // A cor de destaque acompanha o tipo.
  var raiz = document.documentElement;
  raiz.style.setProperty("--tinta", "var(--tinta-" + tipo + ")");
  raiz.style.setProperty("--tinta-suave", "var(--tinta-" + tipo + "-suave)");

  $$(".alternador-opcao").forEach(function (b) {
    b.setAttribute("aria-selected", String(b.dataset.tipo === tipo));
  });

  $$("[data-so]").forEach(function (el) {
    el.hidden = el.dataset.so !== tipo;
  });

  $$("[data-rotulo]").forEach(function (el) {
    el.textContent = ROTULOS[tipo][el.dataset.rotulo];
  });

  $("#f-descricao").placeholder =
    tipo === "despesa" ? "Do que se trata" : "Nome do cliente";
  $(".btn-enviar .btn-texto").textContent = ROTULOS[tipo].botao;

  preencherSelects();
  renderChips();
}

// ---------------------------------------------------------------------------
// Selects — opções vêm da validação de dados da própria planilha
// ---------------------------------------------------------------------------

function opcoesDe(campo) {
  var meta = estado.meta && estado.meta.tipos && estado.meta.tipos[estado.tipo];
  var lista =
    (meta && meta.selects && meta.selects[campo]) ||
    (CONFIG.FALLBACK_SELECTS[estado.tipo] || {})[campo] ||
    [];
  return lista.slice();
}

function preencherSelect(el, opcoes, selecionado) {
  var anterior = selecionado || el.value;
  el.innerHTML = "";

  if (!opcoes.length) {
    var vazio = document.createElement("option");
    vazio.value = "";
    vazio.textContent = "—";
    el.appendChild(vazio);
    return;
  }

  opcoes.forEach(function (opcao) {
    var o = document.createElement("option");
    o.value = opcao;
    o.textContent = opcao;
    el.appendChild(o);
  });

  if (anterior && opcoes.indexOf(anterior) !== -1) el.value = anterior;
}

function preencherSelects() {
  preencherSelect($("#f-categoria"), opcoesDe("categoria"));

  if (estado.tipo === "receita") {
    preencherSelect($("#f-meio"), opcoesDe("meio"));

    var status = opcoesDe("status");
    var meta = estado.meta && estado.meta.tipos && estado.meta.tipos.receita;
    var pago = (meta && meta.statusPago) || "Pago";
    preencherSelect(
      $("#f-status"),
      status,
      status.indexOf(pago) !== -1 ? pago : "",
    );
  }
}

// ---------------------------------------------------------------------------
// Chips de lançamento rápido
// ---------------------------------------------------------------------------

function categoriasMaisUsadas() {
  // Prioriza o que você mais gastou no mês; completa com as opções da planilha.
  var doResumo = ((estado.resumo && estado.resumo.categorias) || []).map(
    function (c) {
      return c.categoria;
    },
  );
  var todas = opcoesDe("categoria");
  var fonte = estado.tipo === "despesa" ? doResumo.concat(todas) : todas;

  var vistas = {};
  return fonte
    .filter(function (c) {
      if (!c || vistas[c] || todas.indexOf(c) === -1) return false;
      vistas[c] = true;
      return true;
    })
    .slice(0, CONFIG.MAX_CHIPS);
}

function renderChips() {
  var cont = $("#chips");
  cont.innerHTML = "";

  categoriasMaisUsadas().forEach(function (categoria) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = categoria;
    b.addEventListener("click", function () {
      $("#f-categoria").value = categoria;
      marcarChipAtivo();
      $("#f-valor").focus();
    });
    cont.appendChild(b);
  });

  marcarChipAtivo();
}

function marcarChipAtivo() {
  var atual = $("#f-categoria").value;
  $$("#chips .chip").forEach(function (c) {
    c.classList.toggle("ativo", c.textContent === atual);
  });
}

// ---------------------------------------------------------------------------
// Resumo e lista
// ---------------------------------------------------------------------------

function renderResumo(resumo) {
  estado.resumo = resumo;
  if (!resumo) return;

  $("#resumo-mes").textContent = nomeMes(resumo.competencia);

  var saldo = $("#resumo-saldo");
  saldo.textContent = formatarMoeda(resumo.saldo);
  saldo.classList.toggle("positivo", resumo.saldo >= 0);
  saldo.classList.toggle("negativo", resumo.saldo < 0);

  $("#resumo-receitas").textContent = formatarMoeda(resumo.receitas);
  $("#resumo-despesas").textContent = formatarMoeda(resumo.despesas);

  var badge = $("#resumo-pendente");
  if (resumo.pendentes > 0) {
    badge.hidden = false;
    badge.textContent = formatarMoeda(resumo.pendentes) + " a receber";
  } else {
    badge.hidden = true;
  }

  renderChips();
}

function renderLista(itens) {
  estado.itens = itens || [];
  var ul = $("#lancamentos");
  ul.innerHTML = "";
  $("#lista-vazio").hidden = estado.itens.length > 0;

  estado.itens.forEach(function (item, i) {
    var li = document.createElement("li");
    li.className = "lancamento";
    li.dataset.tipo = item.tipo;
    li.style.animationDelay = Math.min(i * 25, 200) + "ms";

    var marca = document.createElement("span");
    marca.className = "lancamento-marca";

    var corpo = document.createElement("div");
    corpo.className = "lancamento-corpo";

    var titulo = document.createElement("div");
    titulo.className = "lancamento-titulo";
    titulo.textContent = item.descricao || "(sem descrição)";

    var meta = document.createElement("div");
    meta.className = "lancamento-meta";
    meta.textContent = [dataCurta(item.data), item.categoria, item.status]
      .filter(Boolean)
      .join(" · ");

    corpo.appendChild(titulo);
    corpo.appendChild(meta);

    var valor = document.createElement("span");
    valor.className =
      "lancamento-valor " + (item.tipo === "receita" ? "positivo" : "negativo");
    valor.textContent =
      (item.tipo === "receita" ? "+" : "−") + " " + formatarMoeda(item.valor);

    li.appendChild(marca);
    li.appendChild(corpo);
    li.appendChild(valor);

    if (item.id) {
      var excluir = document.createElement("button");
      excluir.type = "button";
      excluir.className = "lancamento-excluir";
      excluir.setAttribute(
        "aria-label",
        "Excluir " + (item.descricao || "lançamento"),
      );
      excluir.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>';
      excluir.addEventListener("click", function () {
        var ok = confirm(
          'Excluir "' +
            (item.descricao || "este lançamento") +
            '" de ' +
            formatarMoeda(item.valor) +
            "?\n\nA linha some da planilha.",
        );
        if (ok) excluirLancamento(item.id, item.tipo);
      });
      li.appendChild(excluir);
    }

    ul.appendChild(li);
  });
}

function atualizarDados(silencioso) {
  var btn = $("#btn-recarregar");
  if (!silencioso) btn.classList.add("girando");

  return Promise.all([
    chamar("summary", {}),
    chamar("list", { limite: CONFIG.LIMITE_LISTA }),
  ])
    .then(function (r) {
      renderResumo(r[0]);
      renderLista(r[1].itens);
    })
    .catch(function (err) {
      if (err.codigo === "PIN" || err.codigo === "BLOQUEADO")
        return sair(err.message);
      if (!silencioso) toast(err.message, { erro: true });
    })
    .then(function () {
      btn.classList.remove("girando");
    });
}

function carregarMeta() {
  return chamar("meta", {})
    .then(function (r) {
      estado.meta = r;
      preencherSelects();
      renderChips();
    })
    .catch(function () {
      // Sem meta o app continua funcionando: os selects ficam com o fallback.
    });
}

// ---------------------------------------------------------------------------
// Enviar / excluir
// ---------------------------------------------------------------------------

function lerFormulario() {
  var dados = {
    data: $("#f-data").value,
    descricao: $("#f-descricao").value.trim(),
    categoria: $("#f-categoria").value,
    valor: paraNumero($("#f-valor").value),
    observacao: $("#f-observacao").value.trim(),
  };

  if (estado.tipo === "despesa") {
    dados.fornecedor = $("#f-fornecedor").value.trim();
  } else {
    dados.meio = $("#f-meio").value;
    dados.status = $("#f-status").value;
  }
  return dados;
}

function validar(dados) {
  if (!isFinite(dados.valor) || dados.valor <= 0)
    return "Informe um valor maior que zero.";
  if (!dados.descricao) {
    return estado.tipo === "despesa"
      ? "Informe a descrição."
      : "Informe o cliente.";
  }
  if (!dados.data) return "Informe a data.";
  return null;
}

function mostrarErroForm(mensagem) {
  var el = $("#form-erro");
  el.hidden = !mensagem;
  el.textContent = mensagem || "";
}

function limparFormulario() {
  $("#f-valor").value = "";
  $("#f-descricao").value = "";
  $("#f-observacao").value = "";
  if ($("#f-fornecedor")) $("#f-fornecedor").value = "";
  $("#f-data").value = hojeISO();
  mostrarErroForm(null);
  marcarChipAtivo();
}

function enviar(evento) {
  evento.preventDefault();
  if (estado.enviando) return;

  var dados = lerFormulario();
  var erro = validar(dados);
  if (erro) {
    mostrarErroForm(erro);
    return;
  }
  mostrarErroForm(null);

  var tipo = estado.tipo;
  var btn = $("#btn-enviar");
  estado.enviando = true;
  btn.classList.add("ocupado");
  btn.disabled = true;

  chamar("create", { tipo: tipo, dados: dados })
    .then(function (r) {
      limparFormulario();
      if (r.resumo) renderResumo(r.resumo);
      atualizarDados(true);

      toast(
        (tipo === "despesa" ? "Despesa" : "Recebimento") +
          " de " +
          formatarMoeda(dados.valor) +
          " lançado.",
        {
          acao: "Desfazer",
          segundos: CONFIG.SEGUNDOS_DESFAZER,
          aoClicar: function () {
            excluirLancamento(r.id, tipo, true);
          },
        },
      );
    })
    .catch(function (err) {
      if (err.codigo === "PIN" || err.codigo === "BLOQUEADO")
        return sair(err.message);

      if (
        err.codigo === "TOKEN" ||
        /não é uma opção|obrigatóri|Valor precisa|Data inválida/i.test(
          err.message,
        )
      ) {
        // Erro de dados: reenviar não resolveria, então não vai para a fila.
        mostrarErroForm(err.message);
        toast(err.message, { erro: true });
        return;
      }

      // Falha de rede ou servidor: guarda e oferece reenvio.
      filaAdicionar({ tipo: tipo, dados: dados, em: Date.now() });
      limparFormulario();
      toast("Sem conexão com a planilha. Lançamento guardado no aparelho.", {
        erro: true,
        acao: "Tentar agora",
        segundos: 8,
        aoClicar: reenviarFila,
      });
    })
    .then(function () {
      estado.enviando = false;
      btn.classList.remove("ocupado");
      btn.disabled = false;
    });
}

function excluirLancamento(id, tipo, ehDesfazer) {
  chamar("delete", { id: id, tipo: tipo })
    .then(function (r) {
      if (r.resumo) renderResumo(r.resumo);
      atualizarDados(true);
      toast(ehDesfazer ? "Lançamento desfeito." : "Lançamento excluído.");
    })
    .catch(function (err) {
      if (err.codigo === "PIN" || err.codigo === "BLOQUEADO")
        return sair(err.message);
      toast("Não deu para excluir: " + err.message, { erro: true });
    });
}

// ---------------------------------------------------------------------------
// PIN
// ---------------------------------------------------------------------------

function mostrarTelaPin(mensagem) {
  $("#app").hidden = true;
  $("#tela-pin").hidden = false;
  var erro = $("#pin-erro");
  erro.hidden = !mensagem;
  erro.textContent = mensagem || "";
  setTimeout(function () {
    $("#campo-pin").focus();
  }, 60);
}

function entrar(pin) {
  var btn = $("#btn-pin");
  btn.classList.add("ocupado");
  btn.disabled = true;

  estado.pin = pin;

  return chamar("auth", {})
    .then(function () {
      gravar(CONFIG.CHAVES_STORAGE.pin, pin);
      $("#tela-pin").hidden = true;
      $("#app").hidden = false;
      iniciarApp();
    })
    .catch(function (err) {
      estado.pin = "";
      $("#campo-pin").value = "";
      mostrarTelaPin(err.message);
    })
    .then(function () {
      btn.classList.remove("ocupado");
      btn.disabled = false;
    });
}

function sair(mensagem) {
  estado.pin = "";
  try {
    localStorage.removeItem(CONFIG.CHAVES_STORAGE.pin);
  } catch (e) {
    /* noop */
  }
  $("#campo-pin").value = "";
  mostrarTelaPin(mensagem || null);
}

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------

function iniciarApp() {
  $("#f-data").value = hojeISO();
  definirTipo(estado.tipo);
  renderFila();

  carregarMeta().then(function () {
    preencherSelects();
    return atualizarDados(true);
  });

  if (filaLer().length && navigator.onLine) reenviarFila();
}

function ligarEventos() {
  $("#form-pin").addEventListener("submit", function (e) {
    e.preventDefault();
    var pin = $("#campo-pin").value.trim();
    if (!pin) return;
    entrar(pin);
  });

  $$(".alternador-opcao").forEach(function (b) {
    b.addEventListener("click", function () {
      definirTipo(b.dataset.tipo);
    });
  });

  // Máscara de moeda: mantém o cursor no fim, que é onde os dígitos entram.
  var campoValor = $("#f-valor");
  campoValor.addEventListener("input", function () {
    campoValor.value = mascararValor(campoValor.value);
  });

  $("#f-categoria").addEventListener("change", marcarChipAtivo);
  $("#formulario").addEventListener("submit", enviar);
  $("#btn-recarregar").addEventListener("click", function () {
    atualizarDados();
  });
  $("#btn-reenviar").addEventListener("click", reenviarFila);
  $("#btn-sair").addEventListener("click", function () {
    sair();
  });

  window.addEventListener("online", function () {
    if (filaLer().length) reenviarFila();
  });

  // Voltar para o app depois de um tempo fora: os números podem estar velhos.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !$("#app").hidden && estado.pin)
      atualizarDados(true);
  });
}

(function iniciar() {
  ligarEventos();
  renderFila();

  var pinSalvo = ler(CONFIG.CHAVES_STORAGE.pin, "");
  if (pinSalvo) {
    estado.pin = pinSalvo;
    $("#app").hidden = false;
    iniciarApp();
  } else {
    mostrarTelaPin();
  }
})();
