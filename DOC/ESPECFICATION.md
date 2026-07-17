# Tap Goat - new name

### Project Claude Designer
    Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
    https://claude.ai/design/p/b637a9a5-2be2-4d87-8bfd-bfddbb3bbaf7?file=GOAT.dc.html

Versão escolhida para implementação: GOAT.dc.html

## Descrição do Jogo
É um jogo para celular ou tablets onde uma Cabra Maratimba fica andando em um pasto e o jogador ao clicar sobre a Cabra, ela emite um som engraçado, faz uma careta e volta a andar. O objetivo do jogo é entreter o jogador com a interação com a Cabra Maratimba.

## Tecnologias Utilizadas
- HTML5
- CSS3
- JavaScript
- SVG para animações
- Angular (Ionic Framework, TypeScript) para o desenvolvimento do aplicativo webview — o Ionic CLI não possui mais starter para AngularJS 1.x (legado, sem suporte desde 2022); decidido usar o Angular moderno suportado oficialmente pelo Ionic
- IONIC para o desenvolvimento do aplicativo webview
- Capacitor para o desenvolvimento do aplicativo webview

## Estrutura do Projeto

|Pasta | Tipos de arquivo | Descrição |
|-------|----------|------------|
|DOC| .md | Documentação do projeto |
|APK| .apk | Arquivos fonte do aplicativo antes da compilação, o aplicativo é um webview |
|PROJECT|.html, .css, .js, .svg | Arquivos fonte do aplicativo em HTML, CSS, JavaScript e SVG |
|PROJECT/assets|.png, .ico, .mp3 | Assets do jogo: logos/ícones e sons de balido da cabra (ver detalhamento na seção [Assets do jogo](#assets-do-jogo)) |
|DEPLOY|.apk, .aab | Arquivos compilados do aplicativo para instalação em dispositivos Android |

O nome do app para loja do google play é "Tap Goat" e o pacote do app é ***"com.tapgoat.app"***.

### Assets do jogo
Os assets visuais do jogo (logo, ícones) ficam em `PROJECT/assets` e devem ser reutilizados no projeto (splash screen, ícone do app, header/branding), em vez de recriados:

|Arquivo | Descrição |
|-------|------------|
|`logo.png`| Logo do jogo (símbolo) |
|`logo-com-texto.png`| Logo do jogo com o nome do app por extenso |
|`logo.ico`| Logo em formato `.ico`, para uso como ícone do app/favicon |
|`prova-conceito-icons.png`| Prova de conceito de ícones do app |
|`cabra-01.mp3` a `cabra-06.mp3`| Sons de balido da cabra (6 variações), para reprodução aleatória a cada toque no animal |

## Anúncio (Native Ad) do Google AdMob
O anúncio é exibido na parte inferior da tela do aplicativo como um **card nativo (Native Ad)**: ícone, título, descrição curta e botão de call-to-action (CTA), com o rótulo "ANÚNCIO" — é o formato visto no card do protótipo em [GOAT.dc.html:103-111](PROJECT/GOAT.dc.html#L103-L111).

Diferente do formato **Banner** (que tem tamanhos fixos padronizados pelo Google, ex. 320x50px), o **Native Ad não tem tamanho fixo em pixels**: o AdMob entrega apenas os *assets* (ícone, título, corpo, imagem, CTA, avaliação) e cada app é responsável por estilizá-los seguindo o próprio layout — exatamente como já foi feito no protótipo. Isso dá mais controle visual, mas exige seguir as [políticas de Native Ads do Google](https://support.google.com/admob/answer/6240814) (o rótulo "Ad"/"Anúncio" e o CTA precisam ficar visíveis e não podem induzir o usuário a clicar por engano).

O ID atualmente referenciado na especificação anterior (`ca-app-pub-3940256099942544/6300978111`) é o **ID de teste padrão do Google para o formato Banner**, e não se aplica a Native Ads. O ID de teste correto para Native Advanced (Android) é `ca-app-pub-3940256099942544/2247696110`. Esse valor é usado apenas em desenvolvimento local sem a conta AdMob configurada.

A conta AdMob do projeto já foi criada, com o app cadastrado como **"Tap Goat"** (nome de exibição, igual ao nome definitivo do app — não confundir com `GOAT-MARATIMBA`, que é apenas o nome do repositório/projeto interno). Os IDs reais (App ID e Ad Unit ID nativo) ficam registrados em `DOC/GOOGLE-ADMOB.md`, um arquivo **não versionado** (listado no `.gitignore`, mantido apenas localmente) por conter identificadores de conta. Esses são os valores usados na build de produção; os IDs de teste do parágrafo acima seguem valendo apenas para desenvolvimento local antes de plugar a conta real.

> No HTML do protótipo (`PROJECT/GOAT.dc.html`) o anúncio ainda é apenas um mockup visual (dados estáticos simulando o card do anúncio: "FazendaFácil", ícone 🚜, CTA "Abrir"), sem integração real com o SDK do AdMob. A integração técnica real deverá ser feita via plugin Capacitor, conforme descrito no manual.

Caso o usuário deseje remover o anúncio, irá clicar no texto remover anuncios, que irá abrir uma tela de pagamento para o usuário pagar e remover os anuncios do aplicativo. O ID do produto para remover os anuncios é ***"remove_ads"***. O Pagamento deverá ser processado pelo Google Play Billing, e o usuário deverá ter uma conta do Google para realizar o pagamento.


## Manual de Criação de Conta do Google AdMob e Anúncio Nativo (Native Ad)

### 1. Criar a conta AdMob
1. Acesse https://admob.google.com e clique em **Começar**.
2. Faça login com a mesma Conta Google que será usada (idealmente) para o Google Play Console — facilita a vinculação de pagamentos e relatórios depois.
3. Preencha os dados de cobrança (país, endereço, moeda) — necessários para receber pagamentos de anúncios.
4. Aceite os termos do AdMob e finalize a criação da conta.

### 2. Cadastrar o aplicativo no AdMob
1. No painel do AdMob, vá em **Apps → Adicionar app**.
2. Informe se o app já está publicado na Google Play Store:
   - Se **ainda não publicado**: escolha "Não" e preencha manualmente o nome do app (`Tap Goat`) e a plataforma (Android).
   - Se já publicado: selecione o app diretamente pela busca da Play Store usando o pacote `com.tapgoat.app`.
3. Ao concluir, o AdMob gera um **App ID** único, no formato `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`. Esse ID é diferente do ID do bloco de anúncio (ad unit) e deve ser configurado no `AndroidManifest.xml` do projeto (ver seção técnica abaixo).
4. ✅ **Concluído** — app "Tap Goat" já cadastrado; App ID registrado em `DOC/GOOGLE-ADMOB.md` (não versionado).

### 3. Criar o bloco de anúncio (Ad Unit) do tipo Nativo Avançado
1. Dentro do app cadastrado, vá em **Blocos de anúncios → Adicionar bloco de anúncios**.
2. Escolha o formato **Nativo avançado** (Native Advanced) — não "Banner", pois o layout do card (ícone + título + descrição + CTA) exige esse formato.
3. Dê um nome descritivo, ex.: `TAP_GOAT_NATIVE_RODAPE`.
4. Salve. O AdMob gera um **ID de bloco de anúncio**, no formato `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY` — este é o ID que substitui o ID de teste (`ca-app-pub-3940256099942544/2247696110`) usado durante o desenvolvimento.
5. Guarde os dois IDs (App ID e Ad Unit ID) em local seguro (ex.: variável de ambiente ou arquivo de configuração não versionado), pois serão usados na integração técnica.
6. ✅ **Concluído** — bloco `TAP_GOAT_NATIVE_RODAPE` já criado; Ad Unit ID registrado em `DOC/GOOGLE-ADMOB.md` (não versionado).

> **Importante:** um app novo no AdMob passa por um período de "aprendizado"/revisão e pode levar até 24-48h exibindo poucos ou nenhum anúncio real. Use sempre os IDs de teste oficiais do Google durante o desenvolvimento para não violar a política de cliques/impressões inválidas.

### 4. Integração técnica com Capacitor (implementada)
O projeto usa Capacitor como camada nativa sobre o webview (Ionic + Angular). Anúncios web (`<iframe>`/JS puro) não são permitidos pelas políticas do AdMob para apps — é obrigatório usar o SDK nativo via plugin.

Confirmado durante a implementação: o plugin `@capacitor-community/admob` cobre bem Banner/Interstitial/Rewarded, mas **não tem suporte a Native Ads customizados** — não existe alternativa de terceiros madura para esse caso. Foi implementada a **Opção A**: um plugin Capacitor customizado em Kotlin.

**Arquivos da implementação:**
- `APK/android/app/src/main/java/com/tapgoat/app/TapGoatAdMobPlugin.kt` — plugin Kotlin que carrega o `NativeAd` via `AdLoader` do Google Mobile Ads SDK (`com.google.android.gms:play-services-ads:23.6.0`, adicionado em `APK/android/app/build.gradle`).
- `APK/android/app/src/main/java/com/tapgoat/app/MainActivity.kt` — registra o plugin (`registerPlugin(TapGoatAdMobPlugin::class.java)`); convertido de Java para Kotlin (suporte a Kotlin habilitado em `APK/android/build.gradle` e `app/build.gradle` via `apply plugin: 'kotlin-android'`).
- `APK/src/app/admob.service.ts` — serviço Angular que faz o bridge com o plugin nativo via `registerPlugin` do `@capacitor/core`. Fora de plataforma nativa (`Capacitor.isNativePlatform()` falso, ex. `ng serve` no navegador), os métodos resolvem como no-op, e o card mantém o mockup estático "FazendaFácil" como fallback visual.
- `APK/src/app/home/home.page.ts`/`.html` — o card do anúncio (`.native-ad-card`) é preenchido com os dados reais (`headline`, `body`, `icon`, `callToAction`) quando `nativeAd` está carregado.

**Detalhe crítico de política do Google:** mesmo com o layout 100% desenhado em HTML/CSS, o SDK exige que as views nativas (`headlineView`, `bodyView`, `callToActionView`) estejam registradas em um `NativeAdView` real para que cliques e impressões sejam contabilizados como válidos — não é possível apenas extrair as strings do `NativeAd` e desenhar tudo em HTML sem essa camada nativa por trás. Por isso o plugin mantém um `NativeAdView` transparente, sobreposto exatamente sobre as coordenadas do card HTML (`showAdOverlay`, recalculado via `getBoundingClientRect()` a cada carregamento do anúncio e a cada resize da tela), garantindo que o toque do usuário no card visual chegue ao SDK do Google como um clique válido.

O App ID já está configurado em `AndroidManifest.xml` (`com.google.android.gms.ads.APPLICATION_ID`), e o Ad Unit ID real em `APK/src/environments/environment.prod.ts` (`environment.admob.nativeAdUnitId`). Em desenvolvimento (`environment.ts`), seguem os IDs de teste oficiais do Google (App ID: `ca-app-pub-3940256099942544~3347511713`, Native Ad Unit ID: `ca-app-pub-3940256099942544/2247696110`).

Ocultar o anúncio quando o usuário compra "remover anúncios": `buy()` em `home.page.ts` chama `adMob.hideAdOverlay()` além do `*ngIf="!purchased"` já existente no card.

**Pendente:** validar em dispositivo/emulador Android real que o clique no `NativeAdView` sobreposto de fato abre o anúncio e que a posição do overlay acompanha corretamente resize/scroll da tela.

## Manual de Criação de Conta do Google Play Console e Google Play Billing

### 1. Criar a conta de desenvolvedor Google Play
1. Acesse https://play.google.com/console/signup.
2. Faça login com a Conta Google que será a dona do app.
3. Pague a taxa única de registro de desenvolvedor (atualmente USD 25, cobrança única e vitalícia).
4. Preencha os dados da conta: se é conta pessoal ou de organização, endereço, contato.
5. Aceite o Contrato de Distribuidor Google Play e aguarde a verificação de identidade (pode levar de algumas horas a poucos dias).

### 2. Criar o app no Google Play Console
1. No console, clique em **Criar app**.
2. Nome do app: `GOAT-MARATIMBA`.
3. Idioma padrão, tipo (Jogo) e se é gratuito ou pago (gratuito, com compra opcional dentro do app).
4. Defina o **nome do pacote** exatamente como já usado no projeto: `com.tapgoat.app` — esse valor não pode ser alterado depois do primeiro upload, então deve bater com o `applicationId` configurado no Capacitor/Android.
5. Complete o restante do onboarding obrigatório antes de poder publicar: ficha da loja, classificação de conteúdo, público-alvo, política de privacidade, categoria do app (Jogos → Casual), ícone e capturas de tela.

### 3. Configurar contas de pagamento (para receber pelo produto "remove_ads")
1. No console, vá em **Configuração → Perfil de pagamentos** (ou acesse diretamente https://payments.google.com).
2. Crie/vincule um perfil de comerciante (dados fiscais, conta bancária) — obrigatório para vender produtos in-app.
3. Sem esse perfil configurado, não é possível publicar produtos pagos, incluindo o `remove_ads`.

### 4. Criar o produto in-app "remove_ads"
1. No Play Console, abra o app → **Monetizar → Produtos → Produtos no app**.
2. Clique em **Criar produto**.
3. Preencha:
   - **ID do produto**: `remove_ads` (deve ser exatamente esse valor, pois é o mesmo usado no código do app).
   - **Nome**: ex. "Remover Anúncios".
   - **Descrição**: ex. "Remove todos os anúncios do jogo permanentemente."
   - **Preço**: definir valor (ex. USD 1.99, conforme sugerido no protótipo `payTitle:'GOAT Premium'`).
4. Ative (**Ativar**) o produto — produtos inativos não aparecem para compra mesmo em builds de teste.
5. Esse é um produto **não consumível** (compra única, permanente) — não configurar como assinatura nem como consumível.

### 5. Integração técnica com Capacitor (Google Play Billing)
1. Instalar o plugin de compras in-app:
   ```bash
   npm install @capacitor-community/in-app-purchases
   npx cap sync
   ```
   *(Alternativa: `cordova-plugin-purchase`, também compatível com Capacitor, com suporte mais maduro a non-consumables.)*
2. Inicializar o produto e consultar o catálogo:
   ```js
   import { InAppPurchase2 as store } from 'cordova-plugin-purchase';

   store.register({
     id: 'remove_ads',
     type: store.NON_CONSUMABLE
   });

   store.when('remove_ads').approved(product => {
     product.finish();
     // marcar localmente: purchased = true, esconder banner (AdMob.hideBanner())
   });

   store.refresh();
   ```
3. Ao clicar em "Remover anúncios" na UI, chamar `store.order('remove_ads')`, que abre o fluxo nativo de pagamento do Google Play.
4. Persistir o estado de compra localmente (ex. `localStorage`/Capacitor Preferences) e também restaurar via `store.refresh()` ao abrir o app, para o caso de reinstalação — o Google Play já guarda a titularidade da compra por conta Google.

### 6. Testar pagamentos antes de publicar
1. No Play Console, em **Configuração → Testadores de licença**, adicione os e-mails Gmail da equipe que vai testar.
2. Publique uma versão em faixa de teste **interno** (não precisa estar em produção para testar compras).
3. Contas de teste podem comprar produtos reais sem cobrança efetiva (ou usando cartões de teste, dependendo da configuração).
4. Só depois de validar o fluxo completo (compra → remoção do banner → persistência) promover a build para produção.

## O controle e andamento do projeto desenvolvimento
O controle poderá ser acompanhado através do arquivo do backlog do projeto, que será atualizado com as tarefas a serem realizadas, e o andamento do projeto será acompanhado através de reuniões semanais com a equipe de desenvolvimento.
@BACKLOG.md

## Tela de Abertura (Setup Inicial)
A tela de abertura **não é uma tela separada**: é a própria tela do jogo (cena 3D com a cabra já andando no pasto) com um card de **setup** sobreposto, exibido toda vez que o app é aberto (não apenas na primeira instalação).

- **Loading**: enquanto a engine 3D (Three.js), texturas e sons carregam, é exibido um splash simples com o logo/ícone da cabra e um indicador de carregamento, até a cena estar pronta.
- **Card de setup**: assim que a cena carrega, sobre ela aparece um único card (sem wizard em passos) contendo:
  - Título de boas-vindas com o nome do jogo ("Tap Goat"), traduzido conforme o idioma selecionado no próprio card.
  - Seletor de **idioma** (PT/EN/ES), pré-selecionado com base no idioma do sistema operacional (locale do Android), podendo ser alterado antes de confirmar.
  - Toggle para **habilitar/desabilitar o som**.
  - Campo de texto **opcional** para o usuário nomear a cabra; se deixado em branco, é usado um nome padrão. O nome digitado é **persistido localmente** (via Capacitor Preferences, `PlayerPrefsService`) e pré-preenchido automaticamente da próxima vez que o app for aberto — o usuário não precisa redigitar o nome a cada sessão, apenas alterá-lo se quiser.
  - Botão para confirmar e iniciar a interação com o jogo (também é possível fechar o card tocando no "X" ou no botão de seta ao lado do campo de nome, além do toque direto na cabra).
- **Fechamento**: o card de setup permanece visível até o usuário confirmar (toque na cabra, no botão de seta, ou no "X") — nesse momento ele desaparece com uma transição (fade), a careta e o som são disparados normalmente (quando fechado via toque na cabra), e o setup escolhido (idioma, som, nome da cabra) passa a valer para a sessão.
- Esse fluxo (a exibição do card em si) se repete a cada abertura do app (não há gravação de "já visto" — diferente de um onboarding único); apenas o **nome da cabra** é lembrado entre sessões, os demais campos (idioma, som) voltam ao padrão detectado do sistema a cada abertura.
- **Termos de Uso e Política de Privacidade**: o card de setup também exibe dois links, "Termos de Uso" e "Política de Privacidade", que abrem as respectivas páginas no navegador do dispositivo (fora do app). Esses links são de acesso remoto (exigem conexão à internet) e não afetam a premissa de funcionamento offline do jogo em si, pois o conteúdo do jogo não depende deles para funcionar.

## Termos de Uso e Política de Privacidade
O aplicativo deve disponibilizar dois documentos legais em HTML, hospedados externamente (fora do pacote do app) e acessados via link a partir da tela de setup:

| Documento | URL |
|-----------|-----|
| Termos de Uso | https://contaasbencaos.com.br/tapgoat/termos.html |
| Política de Privacidade | https://contaasbencaos.com.br/tapgoat/privacidade.html |

- Ambos os arquivos (`termos.html` e `privacidade.html`) devem ser criados e publicados no domínio acima (fora do repositório/pacote do app).
- Na tela de setup inicial (idioma, som, nome da cabra), devem constar dois links visíveis que abrem essas URLs no navegador do dispositivo.
- A Política de Privacidade também é exigida pelo processo de publicação na Google Play Console (ver [Manual de Criação de Conta do Google Play Console](#manual-de-criação-de-conta-do-google-play-console-e-google-play-billing)), que já solicitava esse documento durante o onboarding do app na loja.

## Premisas do Projeto
- O jogo será desenvolvido para dispositivos Android, com suporte para diferentes tamanhos de tela.
- O jogo será desenvolvido em HTML5, CSS3, JavaScript e SVG.
- O jogo será desenvolvido para trabalhar offline, sem necessidade de conexão com a internet. Por conta disso fontes externas não serão utilizadas, e todas as imagens, sons e fontes serão incorporadas ao aplicativo.
