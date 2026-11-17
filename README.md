# Site de Henrico Campos

Um site de histórias onde **o conteúdo fica separado do código**. A cada alteração, o GitHub refaz e publica o site sozinho (cerca de 1 minuto).

## Editar pelo painel (o jeito normal)

1. Acesse **app.pagescms.org** e entre com o GitHub.
2. Instale o app do Pages CMS no repositório `henrico-site` quando ele pedir, e abra o repositório.
3. No menu da esquerda:
   - **Histórias → Capítulos (português):** escolha a história, o número, o título e cole o texto. A data decide o que aparece em "Atualizações recentes".
   - **Histórias → Capítulos (inglês):** a tradução de um capítulo. Use a mesma história e o **mesmo número** do capítulo em português.
   - **Histórias → Fichas das histórias:** título, sinopse, capa, situação, avisos de conteúdo e o visual de cada história (fontes e cores).
   - **Página Sobre e ajustes:** o texto do Sobre, sua foto, redes sociais, newsletter, a imagem de pré-visualização dos links e as duas caixas de "Por onde começar".

Ao salvar, o painel grava no GitHub e o site é atualizado sozinho.

**História nova:** crie a ficha em "Fichas das histórias" e acrescente uma linha na lista `components > historia > values` do arquivo `.pages.yml` (ele tem um comentário no topo explicando). Só assim ela aparece nos campos "História".

## Se preferir editar pelo GitHub (sem o painel)

Tudo fica em `content/`:

- `content/stories/nome.md`: a ficha de cada história.
- `content/chapters/nome-da-historia-6-titulo.md`: capítulos em português. Cabeçalho obrigatório:

      ---
      story: nome-da-historia
      number: 6
      title: Título do capítulo
      date: 2026-11-20
      ---
      Texto do capítulo, um parágrafo por bloco, separados por uma linha em branco.

- `content/chapters-en/...`: a tradução de um capítulo, com o mesmo `story` e o mesmo `number`.
- `*itálico*`, `**negrito**`, e uma linha com `— ❦ —` (ou `---`) para a quebra de cena.

## Visual de cada história (campo `theme` da ficha)

`font` (fonte dos títulos) e `body_font` (fonte do texto): Fraunces, Cormorant Garamond, Spectral, Jost, Literata ou Figtree. `caps` (títulos em maiúsculas), `stars` (estrelas no fundo), `ornament` (separador de cena) e as cores de `dark` e `light` (`bg`, `bg2`, `ink`, `muted`, `accent`). Campos vazios usam o padrão do site.

## Tempo de leitura e barra de progresso

O tempo de cada capítulo e da história inteira é calculado sozinho, pelo número de palavras (ritmo de 230 palavras por minuto; para mudar, altere `WPM` no começo do `build.js`). Aparece na página da história, na lista de capítulos, nas listas de Livros e One-shots e no topo de cada capítulo. Na leitura há uma barra fina no topo e um aviso de tempo restante no canto, que se atualizam conforme o leitor rola a página.

## Ajustes do site (`site.json`)

Nome, frases, `socials` (as sem endereço não aparecem), `photo`, `ogImage` (PNG 1200×630), `newsletter.action` e `start` (as caixas "Por onde começar"). Se um dia usar domínio próprio, troque `url` e coloque `"base": "/"`.

## Testar no computador (opcional)

Com o Node instalado: `node build.js`, e abra a pasta `public`.

## Pastas

`content/` seus textos · `static/` estilo, script, imagens · `build.js` o gerador · `site.json` ajustes · `.pages.yml` configuração do painel · `.github/workflows/` publicação automática.
