# Site de Henrico Campos

Um site de histórias onde **o conteúdo fica separado do código**. Cada capítulo é um arquivo de texto; o site se monta sozinho a cada alteração.

## Colocar no ar (uma vez só)

1. No repositório `henrico-site` no GitHub, **apague os arquivos antigos** (index.html, stories.html, generate-site.js etc.).
2. Envie **todo o conteúdo desta pasta** para o repositório (Add file → Upload files). Mantenha a pasta `.github`.
3. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
4. Abra a aba **Actions**: o fluxo "Publicar o site" roda sozinho (leva cerca de 1 minuto). Quando ficar verde, o site está em `https://writer-henrico.github.io/henrico-site/`.

A cada alteração nos arquivos, o site é refeito e publicado automaticamente.

## Como adicionar ou editar conteúdo

Tudo fica em `content/`.

- **Nova história:** crie uma pasta em `content/stories/nome-da-historia/` com um arquivo `index.md` (copie o de outra história e troque os campos).
- **Novo capítulo:** na pasta da história, crie um arquivo como `06-nome-do-capitulo.md`. O número no começo do nome define a ordem. Exemplo:

      ---
      title: Nome do capítulo
      number: 6
      date: 2026-11-20
      ---
      Texto do capítulo, um parágrafo por bloco, separados por uma linha em branco.

      — ❦ —

      Depois do separador de cena, a história continua.

- **Tradução:** crie o mesmo arquivo com `.en` antes de `.md` (`06-nome-do-capitulo.en.md`). Sem tradução, o leitor em inglês vê um aviso.
- **Itálico:** `*assim*`. **Negrito:** `**assim**`. **Separador de cena:** uma linha com `— ❦ —`, `---` ou `* * *`.
- **Data do capítulo:** é ela que decide qual história aparece como "Atualizada por último" e as "Atualizações recentes" da home.

## Campos da ficha de cada história (`index.md`)

`title`, `title_en` · `kind` (`livro` ou `oneshot`) · `status` (`andamento` ou `completo`) · `genre`, `genre_en` · `synopsis`, `synopsis_en` · `color` (cor da capa provisória) · `cover` (imagem da capa, opcional) · `start: true` (marca a história recomendada na home) · `warnings` (avisos de conteúdo, opcional).

**Visual da história** (bloco `theme`, tudo opcional): `font` (fonte dos títulos) e `body_font` (fonte do texto de leitura), escolhidas entre Fraunces, Cormorant Garamond, Spectral, Jost, Literata e Figtree, `caps: true` (título em maiúsculas), `stars: false` (sem estrelas), `ornament` (separador de cena) e as cores de `dark` e `light` (`bg`, `bg2`, `ink`, `muted`, `accent`). Veja `o-quarto` e `nao-beba-o-sangue-de-sua-mae` como exemplo.

## Configurações do site (`site.json`)

- `start`: as duas histórias da caixa "Por onde começar" na home (o nome da pasta da história e o texto de cada caixa).
- `socials`: cole o link de cada perfil. **Os que ficarem vazios não aparecem.**
- `photo`: caminho da sua foto (ex.: `img/autor.jpg`, colocando o arquivo em `static/img/`).
- `ogImage`: imagem de pré-visualização dos links (PNG 1200×630, em `static/img/`). Sem ela, links compartilhados saem sem imagem.
- `newsletter.action`: endereço do formulário do serviço de e-mail escolhido.
- Se um dia usar domínio próprio, troque `url` e coloque `"base": "/"`.

## Testar no computador (opcional)

Com o Node instalado: `node build.js`, e abra a pasta `public`. Não precisa instalar mais nada.

## Pastas

`content/` seus textos · `static/` estilo, script, imagens · `build.js` o gerador · `site.json` configurações · `.github/workflows/` a publicação automática.
