# Backlog - GOAT-MARATIMBA (Tap Goat)

Legenda de status: `[ ]` a fazer · `[~]` em andamento · `[x]` concluído

> Este backlog é a fonte de verdade sobre o andamento do projeto (ver referência em [ESPECFICATION.md](ESPECFICATION.md)). Atualizar o status de cada item conforme o trabalho avança.

---

## Fase 0 — Protótipo de Design (Claude Designer)
- [x] Protótipo visual/interativo da tela principal do jogo (`PROJECT/GOAT.dc.html`)
- [x] Cabra 3D (Three.js) com animação de andar/pastar aleatória dentro do cercado
- [x] Interação de toque: careta + "bééé" com intensidade variável (força do toque)
- [x] Efeito visual de balão de fala ("Béééé!") e ripple no ponto do toque
- [x] Som de balido sintetizado via Web Audio API (sem arquivo de áudio externo)
- [x] Seletor de pelagem da cabra (creme, malhada, preta, marrom, branca)
- [x] Seletor de idioma (PT/EN/ES) com textos localizados
- [x] Mockup do card de Anúncio Nativo (dados estáticos, sem SDK real)
- [x] Mockup da tela de pagamento "Remover anúncios" (sem billing real)
- [x] Mockup da tela de compartilhamento (WhatsApp/X/Instagram/copiar link)
- [x] Variações de estilo da cabra exploradas (`GOAT Fofa.dc.html`, `GOAT Selvagem.dc.html`, comparação em `Comparar Versões.dc.html`)
- [ ] Validar com o usuário/stakeholder qual estilo final da cabra será usado (fofa vs. realista vs. selvagem) — hoje fixado em `STYLE='realista'` no protótipo

## Fase 1 — Setup do Projeto Real (Ionic + Angular + Capacitor)
- [x] Criar projeto Ionic com Angular moderno (`ionic start`); AngularJS 1.x descartado por não ter mais suporte/starter no Ionic CLI desde 2022 (ver [ESPECFICATION.md](ESPECFICATION.md))
- [x] Definir `applicationId`/pacote: `com.tapgoat.app` (confirmado — especificação corrigida para remover divergência com `com.goatmaratimba.app`)
- [x] Configurar Capacitor com o `applicationId` `com.tapgoat.app`
- [x] Estrutura de pastas conforme especificação (`PROJECT`, `APK`, `DEPLOY`, `DOC`)
- [x] Configurar build para funcionamento 100% offline (sem fontes/CDNs externas — `three.js` via npm local e Google Fonts (Fredoka/Nunito) embutidas como woff2 locais)
- [x] Definir ícone do app e splash screen (gerados via `@capacitor/assets` a partir de `PROJECT/assets/logo.png`, todas as densidades Android + modo escuro; favicon web também corrigido — estava com o ícone genérico padrão do Ionic); themed icon monochrome (Android 13+) não gerado — recurso opcional que exigiria um asset de silhueta dedicado, não crítico para publicação
- [ ] Configurar suporte a múltiplos tamanhos de tela (responsividade mobile/tablet) — layout fullscreen responsivo aplicado; validar em mais tamanhos/tablets

## Fase 2 — Port da Cena 3D e Interação da Cabra
- [x] Portar a cena Three.js do protótipo (`GOAT.dc.html`) para serviço Angular nativo (`goat-scene.service.ts`)
- [x] Embutir a biblioteca Three.js localmente (via npm, sem CDN)
- [x] Portar lógica de wandering/pastoreio da cabra (`updateGoat`)
- [x] Portar detecção de toque/clique com intensidade (mouse e touch) e disparo da careta
- [x] Substituir a síntese de som do balido (Web Audio API) por reprodução dos arquivos de áudio reais em `PROJECT/assets` (`cabra-01.mp3` a `cabra-06.mp3`)
- [x] Pré-carregar os 6 arquivos de som da cabra no início da sessão (junto ao setup/loading da cena)
- [x] A cada toque na cabra, tocar um som diferente do anterior escolhido aleatoriamente entre os 6 disponíveis (evitar repetir o mesmo som duas vezes seguidas)
- [x] Portar efeito de balão de fala e ripple visual
- [x] Portar seletor de pelagens (5 variações)
- [ ] Decidir e implementar o estilo final único da cabra (unificar `GOAT Fofa`/`GOAT Selvagem`/`GOAT.dc.html`) — hoje fixado em `'realista'` no serviço, mesmo default do protótipo
- [ ] Testar performance em dispositivos Android reais de baixo/médio custo (FPS da cena 3D via WebView) — build debug gerado e validado (`DEPLOY/tap-goat-debug.apk`), falta teste em dispositivo físico real

## Fase 3 — Internacionalização e UI
- [x] Portar sistema de i18n (PT/EN/ES) — implementado como serviço Angular simples (`i18n.service.ts`) com textos estáticos; lib externa (ngx-translate) descartada por não se justificar para apenas 3 idiomas fixos
- [x] Portar seletor de idioma (dropdown com bandeiras)
- [x] Portar header (logo, tagline); relógio/status bar mock removido (status bar real do dispositivo via Capacitor)
- [ ] Portar tela/sheet de compartilhamento (share sheet nativo via Capacitor `Share` API, substituindo os botões mock de WhatsApp/X/Instagram) — UI da sheet portada, integração nativa real pendente
- [x] Portar toast de feedback ("Anúncios removidos!", "Copiado!")

### Tela de Abertura / Setup Inicial
(ver detalhamento em [ESPECFICATION.md](ESPECFICATION.md#tela-de-abertura-setup-inicial))
- [ ] Splash de carregamento (logo + indicador) exibido enquanto a engine 3D/texturas/sons carregam — splash nativo Android gerado; indicador de progresso explícito sobre a cena ainda não implementado
- [x] Card único de setup sobreposto à cena do jogo (sem wizard em passos), com:
  - [x] Título de boas-vindas com o nome "Tap Goat" traduzido conforme idioma selecionado
  - [x] Seletor de idioma pré-selecionado a partir do idioma do sistema (locale do Android), editável
  - [x] Toggle para habilitar/desabilitar o som
  - [x] Campo de texto opcional para nomear a cabra, com nome padrão se deixado em branco
  - [x] Botão de confirmar/começar (fechamento ocorre no toque na cabra, conforme especificação)
- [x] Lógica de fechamento do card no primeiro toque na cabra (fade-out), disparando a careta/som normalmente nesse mesmo toque
- [x] Aplicar idioma, estado do som e nome da cabra escolhidos à sessão de jogo corrente
- [x] Repetir esse fluxo em toda abertura do app (sem flag de "setup já visto")
- [x] Adicionar links de "Termos de Uso" e "Política de Privacidade" no card de setup, abrindo as URLs externas no navegador do dispositivo (ver [ESPECFICATION.md](ESPECFICATION.md#termos-de-uso-e-política-de-privacidade))

### Termos de Uso e Política de Privacidade
(ver detalhamento em [ESPECFICATION.md](ESPECFICATION.md#termos-de-uso-e-política-de-privacidade))
- [ ] Redigir o conteúdo dos Termos de Uso do app
- [ ] Redigir o conteúdo da Política de Privacidade do app
- [ ] Criar o arquivo `termos.html` com os Termos de Uso
- [ ] Criar o arquivo `privacidade.html` com a Política de Privacidade
- [ ] Publicar `termos.html` em `https://contaasbencaos.com.br/tapgoat/termos.html`
- [ ] Publicar `privacidade.html` em `https://contaasbencaos.com.br/tapgoat/privacidade.html`
- [ ] Validar que ambos os links abrem corretamente a partir do card de setup no app

## Fase 4 — Anúncios (Google AdMob Native Ad)
- [x] Criar conta AdMob (ver manual em [ESPECFICATION.md](ESPECFICATION.md#manual-de-criação-de-conta-do-google-admob-e-anúncio-nativo-native-ad))
- [x] Cadastrar app no AdMob e obter App ID — app "Tap Goat" cadastrado; App ID real registrado em `DOC/GOOGLE-ADMOB.md` (não versionado) e em `APK/src/environments/environment.prod.ts`
- [x] Criar Ad Unit do tipo Nativo Avançado — bloco `TAP_GOAT_NATIVE_RODAPE` criado; Ad Unit ID real também em `environment.prod.ts`
- [x] Decidir abordagem técnica: Opção A escolhida (plugin Capacitor customizado em Kotlin) — não existe plugin de terceiros maduro para Native Ads customizados (`@capacitor-community/admob` só cobre Banner/Interstitial/Rewarded)
- [x] Implementar integração do SDK do Google Mobile Ads — plugin `TapGoatAdMobPlugin.kt` (`APK/android/app/src/main/java/com/tapgoat/app/`) usando `com.google.android.gms:play-services-ads:23.6.0`; carrega o `NativeAd` real via `AdLoader` e devolve headline/body/icon/CTA ao Angular (`AdMobService`, `src/app/admob.service.ts`)
- [x] Configurar `APPLICATION_ID` no `AndroidManifest.xml` — App ID real aplicado (`ca-app-pub-3480885465464323~5776702715`)
- [x] Renderizar o card nativo real reaproveitando o layout do protótipo — o HTML/CSS do card segue 100% customizado (`home.page.html`), populado com os dados reais do `NativeAd`; um `NativeAdView` nativo transparente é sobreposto exatamente sobre o card (posição sincronizada via `getBoundingClientRect`) para que cliques/impressões sejam validados pelo SDK do Google, conforme exigido pela política de Native Ads
- [x] Lógica de ocultar o anúncio quando `purchased = true` (produto `remove_ads` comprado) — `buy()` chama `adMob.hideAdOverlay()`; card também some via `*ngIf="!purchased"` já existente
- [x] Trocar IDs de teste pelos IDs reais de produção antes do release — IDs reais já em uso (App ID no manifest, Ad Unit ID em `environment.prod.ts`)
- [ ] Testar em dispositivo/emulador Android real que o `NativeAdView` sobreposto captura cliques corretamente e que a posição acompanha scroll/resize sem desalinhar do card HTML
- [ ] Validar que o comportamento de fallback (card mockup "FazendaFácil" estático) funciona corretamente quando o anúncio real falha ao carregar (`onAdFailedToLoad`) — hoje `nativeAd` permanece `null` e o template mantém o texto padrão, mas sem teste em dispositivo real ainda

## Fase 5 — Monetização (Google Play Billing / IAP "remove_ads")
- [ ] Criar conta de desenvolvedor Google Play Console
- [ ] Criar app `GOAT-MARATIMBA` no Play Console com pacote `com.tapgoat.app`
- [ ] Configurar perfil de pagamentos (comerciante) para receber por vendas in-app
- [ ] Criar produto in-app não consumível `remove_ads` (nome, descrição, preço)
- [ ] Instalar/configurar plugin de compras in-app (`cordova-plugin-purchase` ou `@capacitor-community/in-app-purchases`)
- [ ] Implementar fluxo de compra (`store.order('remove_ads')`) a partir do botão "Remover anúncios"
- [ ] Persistir estado de compra localmente (Capacitor Preferences/localStorage)
- [ ] Implementar restauração de compra (`store.refresh()`) ao reabrir o app, para caso de reinstalação
- [ ] Adicionar testadores de licença no Play Console e testar fluxo de compra em faixa de teste interno
- [ ] Validar fluxo completo: compra → remoção do anúncio → persistência após reinstalação

## Fase 6 — Publicação
- [ ] Preencher ficha da loja (descrição, categoria "Jogos → Casual", ícone, capturas de tela)
- [x] Ícone de alta resolução (512×512) para a ficha da loja gerado em `DEPLOY/store-assets/icon-512.png`
- [ ] Definir classificação de conteúdo e público-alvo
- [ ] Vincular a Política de Privacidade (`https://contaasbencaos.com.br/tapgoat/privacidade.html`, ver Fase 3) na ficha da loja do Play Console
- [x] Documentar e validar o processo de geração do `.aab` assinado (ver [GERAR-AAB.md](GERAR-AAB.md)) — `signingConfig` de release configurado em `APK/android/app/build.gradle` lendo `keystore.properties` (não versionado); `bundleRelease` testado com sucesso
- [ ] Gerar o keystore de produção real e o primeiro `.aab` assinado com ele para a pasta `DEPLOY` (ver passo a passo em [GERAR-AAB.md](GERAR-AAB.md))
- [ ] Publicar em faixa de teste interno e validar com testadores reais
- [ ] Promover build para produção na Google Play Store

## Fase 7 — Pós-lançamento / Melhorias futuras (backlog aberto, não priorizado)
- [ ] Analytics de engajamento (toques, tempo de sessão) — avaliar impacto na premissa "offline"
- [ ] Novas skins/pelagens adicionais da cabra
- [ ] Novos sons/reações aleatórias para variar a interação
- [ ] Suporte a mais idiomas além de PT/EN/ES

---

## Notas de controle
- Reuniões semanais de acompanhamento com a equipe de desenvolvimento (ver [ESPECFICATION.md](ESPECFICATION.md#o-controle-e-andamento-do-projeto-desenvolvimento)).
- Este arquivo deve ser atualizado a cada entrega/marco concluído.

---

## Meta do Projeto
O sistema **deve funcionar 100% offline**, sem dependência de bibliotecas externas (CDNs, fontes remotas, APIs externas) — conforme premissa em [ESPECFICATION.md](ESPECFICATION.md#premisas-do-projeto). Todas as bibliotecas, fontes, imagens e sons devem estar embutidos no aplicativo.

Caso essa meta se mostre inviável tecnicamente (ex. limitações do Three.js, do WebView ou de algum plugin exigirem carregamento remoto), o escopo do projeto deverá ser revisto antes de prosseguir.
