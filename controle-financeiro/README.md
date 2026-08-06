# Caixa DentBot

Front-end estático para lançar **despesas** e **recebimentos** direto na planilha-espelho do DentBot, sem abrir o Google Sheets. Feito para uso no celular, com uma mão.

```
Página no GitHub Pages  →  fetch  →  Apps Script Web App  →  Google Sheets
```

Sem backend próprio, sem servidor, sem custo, sem OAuth no front. O Apps Script é **vinculado à planilha**, então ele já tem acesso a ela pelo `SpreadsheetApp.getActiveSpreadsheet()`.

---

## O que ele mexe na planilha

| Aba | O app faz | Cabeçalho | Dados |
|---|---|---|---|
| **Despesas** | lê e escreve | linha 3 | a partir da linha 4 |
| **Recebimentos** | lê e escreve | linha 3 | a partir da linha 4 |
| Resumo, Rateio, Config | **nunca toca** | — | — |

O script escreve **por nome de coluna**, nunca por posição. Ele lê a linha de cabeçalho, monta um mapa `nome → coluna` e grava por ali. Você pode adicionar ou reordenar colunas que nada quebra.

**Colunas com fórmula nunca são sobrescritas.** Nas Despesas isso é `Competência`; nos Recebimentos, `Taxa Cakto`, `Valor líquido` e `Competência`. Ao inserir uma linha nova, o script **copia a fórmula** da linha de cima (ajustando as referências) em vez de escrever um valor por cima.

**Três colunas são criadas automaticamente** no fim de cada aba, na primeira vez que o script roda: `Observação`, `ID` e `criado_em`. O `ID` é o que permite excluir um lançamento com segurança — sem ele o app teria que adivinhar a linha pela data e valor.

As opções dos dropdowns (Categoria, Tipo, Meio, Status) **não estão escritas no código**. O app lê a validação de dados da própria planilha e monta os selects a partir dela. Mudou a validação no Sheets, o app acompanha no próximo carregamento.

A linha 4 de exemplo (`Templates utility (exemplo)`, R$ 45,00) é **substituída pelo seu primeiro lançamento real**.

---

## Passo 1 — Colar o Code.gs na planilha

1. Abra a planilha-espelho.
2. **Extensões → Apps Script**.
3. Apague o conteúdo do arquivo `Código.gs` que vem em branco.
4. Cole o conteúdo inteiro de [`Code.gs`](Code.gs).
5. No topo do arquivo, no bloco `CONFIG`, troque:
   ```js
   TOKEN: 'TROQUE-ESTE-TOKEN',
   ```
   por qualquer string sua (ex.: `'dentbot-7f3a91'`). **Anote** — ela vai ter que ser idêntica no `app.js`.
6. Salve (💾 ou `Ctrl+S`).

### Definir a senha

Ainda no editor:

1. Na função `definirPin()`, preencha a senha que você quer usar:
   ```js
   var SENHA = 'sua-senha-aqui';
   ```
   Depois escolha **definirPin** no seletor de função do topo e clique **Executar**.
2. Vai aparecer a tela de autorização — é aqui que você passa pelo "app não verificado" (detalhado no passo 2).
3. Depois de rodar com sucesso, **volte e apague o valor**, deixando:
   ```js
   var SENHA = '';
   ```
   A senha já está gravada como hash SHA-256 no `PropertiesService` da planilha; o arquivo não precisa mais dela em texto puro.
4. Salve de novo.

> ⚠️ **Apague antes de commitar.** O `Code.gs` vai para o repositório, que é público. Se a senha ficar no arquivo, ela vira pública junto.

Para conferir se deu certo: rode `verStatus()` e veja o log (`Ctrl+Enter`). Deve mostrar `PIN configurado: true` e as colunas de cada aba.

Para **trocar a senha depois**: preencha `SENHA` de novo, rode `definirPin()`, apague o valor. Não precisa reimplantar — o hash fica nas propriedades do script, não no código.

---

## Passo 2 — Publicar o Web App

1. No editor do Apps Script: **Implantar → Nova implantação**.
2. Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha **App da Web**.
3. Preencha:
   - **Descrição:** `v1`
   - **Executar como:** **Eu** (`seu@email.com`) — é isso que dá acesso à planilha sem login do visitante.
   - **Quem pode acessar:** **Qualquer pessoa** — sem isso o `fetch` do navegador recebe a página de login do Google em vez do JSON.

   > "Qualquer pessoa" e "Qualquer pessoa com Conta do Google" são coisas diferentes. Precisa ser a **primeira**, senão o front quebra.

4. **Implantar**.

### A tela de "app não verificado"

Na primeira execução o Google pede autorização:

1. **Autorizar acesso** → escolha sua conta Google.
2. Aparece **"O Google não verificou este app"**.
3. Clique em **Avançado** (canto inferior esquerdo).
4. Clique em **Acessar Caixa DentBot (não seguro)**.
5. **Permitir**.

Isso é normal: o "app" é o seu próprio script, rodando na sua conta, na sua planilha. A verificação do Google só existe para apps distribuídos publicamente.

6. Copie a **URL do app da Web**. Ela termina em `/exec`:
   ```
   https://script.google.com/macros/s/AKfycb..................../exec
   ```

---

## Passo 3 — Configurar o front-end

Abra [`app.js`](app.js) e edite **só** o bloco `CONFIG` do topo:

```js
var CONFIG = {
  URL: 'https://script.google.com/macros/s/AKfycb...../exec',  // ← a URL do passo 2
  TOKEN: 'dentbot-7f3a91',                                     // ← igual ao Code.gs
  ...
};
```

`URL` e `TOKEN` são os dois únicos campos obrigatórios. Se o `TOKEN` não bater exatamente com o do `Code.gs`, toda requisição volta com "Token inválido".

Dá para testar já: abra o `index.html` com dois cliques, digite o PIN e lance algo. Funciona direto do arquivo local.

---

## Passo 4 — Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Caixa DentBot"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

No GitHub:

1. **Settings → Pages**
2. **Source:** `Deploy from a branch`
3. **Branch:** `main` · **Folder:** `/ (root)`
4. **Save**

A URL sai em 1–2 minutos:

```
https://SEU-USUARIO.github.io/SEU-REPO/
```

Se os arquivos estiverem numa subpasta do repositório (ex.: `controle-financeiro/`), a URL vira `https://SEU-USUARIO.github.io/SEU-REPO/controle-financeiro/`.

### Adicionar à tela de início

- **Android/Chrome:** menu ⋮ → *Adicionar à tela inicial*
- **iPhone/Safari:** botão compartilhar → *Adicionar à Tela de Início*

O `manifest.json` faz o app abrir em tela cheia, sem barra de endereço.

---

## Passo 5 — Testar ponta a ponta

1. Abra a URL do Pages no celular. Digite o PIN. Deve entrar e mostrar o resumo do mês.
2. **Despesa:** valor `45,00`, descrição, categoria, enviar.
3. Abra a planilha na aba **Despesas**: a linha tem que estar lá, com **Valor como número** (alinhado à direita, formatado em R$) e **Data como data**, e a **Competência preenchida pela fórmula**.
4. No app, toque **Desfazer** no toast (8 segundos). A linha some da planilha.
5. **Receita:** lance um recebimento com Status `Pago` e confira na aba **Recebimentos** — `Taxa Cakto` e `Valor líquido` devem calcular sozinhos.
6. Confira que o **Rateio** e o **Resumo do ano** reagiram.
7. Console do navegador (F12): **nenhum erro de CORS**.

### Teste rápido pelo navegador (debug)

O `doGet` aceita as ações de leitura por querystring:

```
https://script.google.com/macros/s/..../exec?action=summary&token=SEU-TOKEN&pin=SEU-PIN
https://script.google.com/macros/s/..../exec?action=meta&token=SEU-TOKEN&pin=SEU-PIN
https://script.google.com/macros/s/..../exec?action=ping
```

O `meta` é o mais útil: mostra exatamente quais opções de dropdown o script está enxergando na sua planilha.

---

## Passo 6 — ⚠️ Atualizar depois de editar o Code.gs

> ## Editar o `Code.gs` e salvar **não** atualiza o site.
>
> O Web App serve a versão **implantada**, não a versão salva no editor. Se você editar, salvar, e o comportamento não mudar — é isso. Todo mundo cai nessa.

O jeito certo:

1. **Implantar → Gerenciar implantações**
2. Clique no **lápis ✏️** da implantação existente (não crie uma nova).
3. **Versão → Nova versão**
4. **Implantar**

Editando a implantação existente, **a URL não muda** e você não precisa mexer no `app.js`.

Se você clicar em "Nova implantação" em vez de editar, ganha uma **URL nova** e a antiga fica congelada na versão velha — aí tem que atualizar a `URL` no `app.js` também.

---

## Sobre segurança — leia isto

**O token no `app.js` não é segurança.** Ele fica em texto puro no JavaScript, visível para qualquer pessoa que abra o DevTools ou leia o repositório. Ele serve para uma coisa só: descartar bots e varreduras que tropecem na URL do Web App. Não trate como senha.

**A senha é diferente e é ela que protege a planilha:**

- A senha **nunca aparece no código** do front. Só o hash SHA-256 existe, guardado no `PropertiesService` da planilha.
- A validação é **server-side**, no Apps Script. Toda requisição (`create`, `delete`, `list`, `summary`) exige senha correta.
- Depois de **10 tentativas erradas**, o script bloqueia tudo por **15 minutos**. Configurável em `CONFIG.MAX_FALHAS_PIN` e `CONFIG.JANELA_BLOQUEIO_MIN`.
- A senha validada fica no `localStorage` do seu aparelho — você digita uma vez e o app lembra. O botão **Sair** apaga.

Com isso, **o repositório pode ser público** sem expor a planilha: quem clonar o código vê a URL e o token, mas não passa da tela de senha.

Limitações que valem saber:

- O Apps Script **não expõe o IP** do chamador, então o rate limit é global (por script), não por IP. Consequência prática: um atacante insistente consegue te deixar bloqueado por 15 minutos. É um incômodo, não um vazamento.
- **Nunca commite a senha em texto puro.** Depois de rodar `definirPin()`, apague o valor de `SENHA`. O `Code.gs` está no repositório público — se a senha ficar lá, está publicada.
- Se um dia quiser fechar mais, a alternativa é repositório **privado** com GitHub Pages (exige plano Pro/Team).

---

## Como o CORS foi resolvido

O Apps Script não responde a requisições `OPTIONS` de preflight. A saída é fazer uma **requisição simples**, que o navegador manda sem preflight:

```js
fetch(CONFIG.URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },  // ← e não application/json
  body: JSON.stringify(corpo)                                // ← JSON serializado no corpo
});
```

E o servidor responde:

```js
ContentService.createTextOutput(JSON.stringify(obj))
  .setMimeType(ContentService.MimeType.JSON);
```

Duas armadilhas a evitar:

- `Content-Type: application/json` dispara preflight → erro de CORS.
- `mode: 'no-cors'` "resolve" o erro no console mas devolve uma resposta opaca — você não consegue ler o resultado, e nunca saberia se o lançamento deu certo.

---

## API do Web App

Todas as requisições levam `token` e `pin` no corpo.

| Ação | Corpo | Resposta |
|---|---|---|
| `ping` | — (não exige auth) | `{ ok, pong, versao }` |
| `auth` | — | `{ ok, autenticado }` |
| `meta` | — | opções de dropdown lidas da planilha |
| `create` | `tipo`, `dados{}` | `{ ok, id, linha, aba, resumo }` |
| `delete` | `id`, `tipo?` | `{ ok, id, resumo }` |
| `list` | `limite` | `{ ok, itens[] }` |
| `summary` | `competencia?` (`yyyy-MM`) | totais do mês + quebra por categoria |

Erro sempre volta como `{ ok: false, error: "mensagem legível" }` — nunca uma exception crua.

**Campos de `dados` no `create`:**

| Despesa | Recebimento |
|---|---|
| `data` (yyyy-MM-dd) | `data` (yyyy-MM-dd) |
| `descricao` → coluna Descrição | `descricao` → coluna **Cliente** |
| `categoria` → Categoria | `categoria` → **Tipo** |
| `fornecedor` | `meio`, `status` |
| `valor` (número) | `valor` → **Valor bruto** |
| `observacao` | `observacao` |

O `summary` segue a mesma regra do Rateio: **só entra receita com `Status = Pago`**. O que está pendente aparece separado, no badge "a receber".

---

## Se der problema

| Sintoma | Causa provável |
|---|---|
| "Resposta inesperada do servidor" | Implantação não está com acesso **Qualquer pessoa**, ou a URL não termina em `/exec` |
| "Token inválido" | `TOKEN` do `app.js` diferente do `Code.gs` |
| "Senha ainda não configurada" | Faltou rodar `definirPin()` no editor |
| Editei o `Code.gs` e nada mudou | Faltou reimplantar — **Passo 6** |
| Erro de CORS no console | Alguém trocou o `Content-Type` para `application/json` |
| Aba não encontrada | Nome da aba mudou — ajuste `CONFIG.TIPOS.*.aba` no `Code.gs` |
| Dropdown vazio no app | A coluna não tem validação de dados na planilha; teste com `?action=meta` |
| Coluna calculada veio vazia | Não havia linha acima com a fórmula para copiar; preencha uma linha manualmente uma vez |

---

## Arquivos

```
index.html      estrutura da página
style.css       tema claro/escuro, tudo em CSS custom properties
app.js          lógica do front — CONFIG no topo
Code.gs         backend, cola no Apps Script da planilha
manifest.json   PWA / adicionar à tela de início
icon-192.png    ícones do app
icon-512.png
```
