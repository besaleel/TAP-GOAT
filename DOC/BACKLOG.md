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

## Fase 1 — Setup do Projeto Real (Ionic + AngularJS + Capacitor)
- [ ] Criar projeto Ionic com AngularJS (`ionic start` ou scaffold manual compatível)
- [x] Definir `applicationId`/pacote: `com.tapgoat.app` (confirmado — especificação corrigida para remover divergência com `com.goatmaratimba.app`)
- [ ] Configurar Capacitor com o `applicationId` `com.tapgoat.app`
- [ ] Estrutura de pastas conforme especificação (`PROJECT`, `APK`, `DEPLOY`, `DOC`)
- [ ] Configurar build para funcionamento 100% offline (sem fontes/CDNs externas — remover `three.js` via CDN e Google Fonts via link, embutir localmente)
- [ ] Definir ícone do app e splash screen
- [ ] Configurar suporte a múltiplos tamanhos de tela (responsividade mobile/tablet)

## Fase 2 — Port da Cena 3D e Interação da Cabra
- [ ] Portar a cena Three.js do protótipo (`GOAT.dc.html`) para componente AngularJS nativo
- [ ] Embutir a biblioteca Three.js localmente (remover import via `cdn.jsdelivr.net`, exigido pela premissa offline)
- [ ] Portar lógica de wandering/pastoreio da cabra (`updateGoat`)
- [ ] Portar detecção de toque/clique com intensidade (mouse e touch) e disparo da careta
- [ ] Substituir a síntese de som do balido (Web Audio API) por reprodução dos arquivos de áudio reais em `PROJECT/assets` (`cabra-01.mp3` a `cabra-06.mp3`)
- [ ] Pré-carregar os 6 arquivos de som da cabra no início da sessão (junto ao setup/loading da cena)
- [ ] A cada toque na cabra, tocar um som diferente do anterior escolhido aleatoriamente entre os 6 disponíveis (evitar repetir o mesmo som duas vezes seguidas)
- [ ] Portar efeito de balão de fala e ripple visual
- [ ] Portar seletor de pelagens (5 variações)
- [ ] Decidir e implementar o estilo final único da cabra (unificar `GOAT Fofa`/`GOAT Selvagem`/`GOAT.dc.html`)
- [ ] Testar performance em dispositivos Android reais de baixo/médio custo (FPS da cena 3D via WebView)

## Fase 3 — Internacionalização e UI
- [ ] Portar sistema de i18n (PT/EN/ES) para AngularJS (ex. `ngx-translate`/`angular-translate` ou equivalente)
- [ ] Portar seletor de idioma (dropdown com bandeiras)
- [ ] Portar header (logo, tagline, relógio/status bar mock deve ser removido — é status bar real do dispositivo)
- [ ] Portar tela/sheet de compartilhamento (share sheet nativo via Capacitor `Share` API, substituindo os botões mock de WhatsApp/X/Instagram)
- [ ] Portar toast de feedback ("Anúncios removidos!", "Copiado!")

### Tela de Abertura / Setup Inicial
(ver detalhamento em [ESPECFICATION.md](ESPECFICATION.md#tela-de-abertura-setup-inicial))
- [ ] Splash de carregamento (logo + indicador) exibido enquanto a engine 3D/texturas/sons carregam
- [ ] Card único de setup sobreposto à cena do jogo (sem wizard em passos), com:
  - [ ] Título de boas-vindas com o nome "Tap Goat" traduzido conforme idioma selecionado
  - [ ] Seletor de idioma pré-selecionado a partir do idioma do sistema (locale do Android), editável
  - [ ] Toggle para habilitar/desabilitar o som
  - [ ] Campo de texto opcional para nomear a cabra, com nome padrão se deixado em branco
  - [ ] Botão de confirmar/começar
- [ ] Lógica de fechamento do card no primeiro toque na cabra (fade-out), disparando a careta/som normalmente nesse mesmo toque
- [ ] Aplicar idioma, estado do som e nome da cabra escolhidos à sessão de jogo corrente
- [ ] Repetir esse fluxo em toda abertura do app (sem flag de "setup já visto")

## Fase 4 — Anúncios (Google AdMob Native Ad)
- [ ] Criar conta AdMob (ver manual em [ESPECFICATION.md](ESPECFICATION.md#manual-de-criação-de-conta-do-google-admob-e-anúncio-nativo-native-ad))
- [ ] Cadastrar app no AdMob e obter App ID
- [ ] Criar Ad Unit do tipo Nativo Avançado
- [ ] Decidir abordagem técnica: (A) plugin Capacitor customizado em Kotlin para `NativeAdView` com layout próprio, ou (B) plugin pronto de terceiros
- [ ] Implementar integração do SDK do Google Mobile Ads (modo teste primeiro, ID `ca-app-pub-3940256099942544/2247696110`)
- [ ] Configurar `APPLICATION_ID` no `AndroidManifest.xml`
- [ ] Renderizar o card nativo real (ícone, título, descrição, CTA, rótulo "ANÚNCIO") reaproveitando o layout do protótipo
- [ ] Lógica de ocultar o anúncio quando `purchased = true` (produto `remove_ads` comprado)
- [ ] Trocar IDs de teste pelos IDs reais de produção antes do release

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
- [ ] Definir classificação de conteúdo e público-alvo
- [ ] Redigir e publicar política de privacidade
- [ ] Gerar build assinada `.aab` para produção (pasta `DEPLOY`)
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
