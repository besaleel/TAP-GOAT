import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GoatCoat, GoatSceneService } from '../goat-scene.service';
import { I18nService, Lang } from '../i18n.service';
import { PlayerPrefsService } from '../player-prefs.service';
import { AdMobService, NativeAdData } from '../admob.service';

const STORE_URL = 'https://loja.goatapp.dev/br';
const TERMS_URL = 'https://contaasbencaos.com.br/tapgoat/termos.html';
const PRIVACY_URL = 'https://contaasbencaos.com.br/tapgoat/privacidade.html';
const DEFAULT_GOAT_NAME = 'GOAT';

interface CoatOption { code: GoatCoat; chip: string; dot: string; }

const COAT_OPTIONS: CoatOption[] = [
  { code: 'cream', chip: '#f3e9d4', dot: '' },
  { code: 'spotted', chip: '#efe6d4', dot: '#5b4327' },
  { code: 'black', chip: '#33302c', dot: '' },
  { code: 'brown', chip: '#8a5a34', dot: '' },
  { code: 'white', chip: '#f7f4ee', dot: '' },
];

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('goatCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayEl', { static: true }) overlayRef!: ElementRef<HTMLDivElement>;
  @ViewChild('nativeAdCard') nativeAdCardRef?: ElementRef<HTMLDivElement>;

  readonly coatOptions = COAT_OPTIONS;
  readonly langs: { code: Lang; flag: string; label: string }[] = [
    { code: 'PT', flag: '🇧🇷', label: 'Português' },
    { code: 'EN', flag: '🇺🇸', label: 'English' },
    { code: 'ES', flag: '🇪🇸', label: 'Español' },
  ];

  lang: Lang = 'EN';
  langOpen = false;
  coatOpen = false;
  coat: GoatCoat = 'cream';
  shareOpen = false;
  paymentOpen = false;
  purchased = false;
  toast = '';
  copied = false;
  storeUrl = STORE_URL;
  termsUrl = TERMS_URL;
  privacyUrl = PRIVACY_URL;

  // Setup inicial (exibido sobre a cena a cada abertura do app, até o primeiro toque na cabra)
  setupVisible = true;
  setupLang: Lang = 'EN';
  setupSoundOn = true;
  goatName = '';
  soundOn = true;

  // Native Ad real (AdMob) — null enquanto carrega ou fora de plataforma nativa,
  // caso em que o template mostra o mockup estático "FazendaFácil" como fallback.
  nativeAd: NativeAdData | null = null;

  private toastTimer?: ReturnType<typeof setTimeout>;
  private copyTimer?: ReturnType<typeof setTimeout>;
  private resizeListener = () => this.syncAdOverlay();

  constructor(
    private goatScene: GoatSceneService,
    public i18n: I18nService,
    private playerPrefs: PlayerPrefsService,
    private adMob: AdMobService
  ) {}

  get t() {
    return this.i18n.get(this.lang);
  }

  get displayGoatName(): string {
    return this.goatName.trim() || DEFAULT_GOAT_NAME;
  }

  ngOnInit(): void {
    const systemLang = I18nService.detectSystemLang();
    this.lang = systemLang;
    this.setupLang = systemLang;
    this.goatScene.preloadSounds();
    this.goatScene.init(
      this.canvasRef.nativeElement,
      this.overlayRef.nativeElement,
      'realista',
      () => this.onGoatTap()
    );
    this.playerPrefs.getGoatName().then((name) => (this.goatName = name));
    this.loadAd();
    window.addEventListener('resize', this.resizeListener);
  }

  ngAfterViewInit(): void {
    this.syncAdOverlay();
  }

  ngOnDestroy(): void {
    this.goatScene.destroy();
    clearTimeout(this.toastTimer);
    clearTimeout(this.copyTimer);
    window.removeEventListener('resize', this.resizeListener);
    this.adMob.hideAdOverlay();
  }

  private async loadAd(): Promise<void> {
    if (this.purchased) return;
    try {
      this.nativeAd = await this.adMob.loadNativeAd();
    } catch {
      this.nativeAd = null; // mantém o mockup estático como fallback visual
    }
    // Aguarda o próximo ciclo de render (o card real muda de tamanho conforme o
    // conteúdo do anúncio) antes de posicionar o overlay nativo sobre ele.
    setTimeout(() => this.syncAdOverlay(), 0);
  }

  private syncAdOverlay(): void {
    if (!this.nativeAd || this.purchased || !this.nativeAdCardRef) {
      this.adMob.hideAdOverlay();
      return;
    }
    const rect = this.nativeAdCardRef.nativeElement.getBoundingClientRect();
    this.adMob.showAdOverlay({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
  }

  private onGoatTap(): void {
    if (this.setupVisible) {
      this.startGame();
    }
  }

  startGame(): void {
    this.lang = this.setupLang;
    this.soundOn = this.setupSoundOn;
    this.goatScene.soundEnabled = this.setupSoundOn;
    this.setupVisible = false;
    this.playerPrefs.setGoatName(this.goatName.trim());
  }

  pickSetupLang(code: Lang): void {
    this.setupLang = code;
  }

  toggleSetupSound(): void {
    this.setupSoundOn = !this.setupSoundOn;
  }

  toggleSound(): void {
    this.soundOn = !this.soundOn;
    this.goatScene.soundEnabled = this.soundOn;
  }

  openTerms(): void {
    window.open(this.termsUrl, '_blank');
  }

  openPrivacy(): void {
    window.open(this.privacyUrl, '_blank');
  }

  pickLang(code: Lang): void {
    this.lang = code;
    this.langOpen = false;
  }

  toggleLang(): void {
    this.langOpen = !this.langOpen;
    this.coatOpen = false;
  }

  toggleCoat(): void {
    this.coatOpen = !this.coatOpen;
    this.langOpen = false;
  }

  pickCoat(code: GoatCoat): void {
    this.coat = code;
    this.coatOpen = false;
    this.goatScene.setCoat(code);
  }

  openShare(): void {
    this.shareOpen = true;
    this.langOpen = false;
    this.coatOpen = false;
    this.copied = false;
  }

  closeShare(): void {
    this.shareOpen = false;
  }

  openPayment(): void {
    this.paymentOpen = true;
    this.langOpen = false;
    this.coatOpen = false;
  }

  closePayment(): void {
    this.paymentOpen = false;
  }

  copyUrl(): void {
    try {
      navigator.clipboard?.writeText(this.storeUrl);
    } catch {
      /* clipboard indisponível (ex. contexto não seguro); ignora silenciosamente */
    }
    this.copied = true;
    clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => (this.copied = false), 1600);
  }

  buy(): void {
    this.purchased = true;
    this.paymentOpen = false;
    this.toast = this.t.bought;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = ''), 2600);
    this.adMob.hideAdOverlay();
  }
}
