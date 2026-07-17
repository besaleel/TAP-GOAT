import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { environment } from '../environments/environment';

export interface NativeAdData {
  headline: string;
  body: string;
  callToAction: string;
  advertiser: string;
  iconUri?: string;
}

interface TapGoatAdMobPlugin {
  initialize(): Promise<void>;
  loadNativeAd(options: { adUnitId: string }): Promise<NativeAdData>;
  showAdOverlay(options: { x: number; y: number; width: number; height: number }): Promise<void>;
  hideAdOverlay(): Promise<void>;
}

const TapGoatAdMob = registerPlugin<TapGoatAdMobPlugin>('TapGoatAdMob');

/**
 * Bridge para o plugin nativo Android (TapGoatAdMobPlugin.kt) que carrega o Native
 * Ad real do Google AdMob. Fora de uma plataforma nativa (ex. `ng serve` no navegador
 * durante desenvolvimento), o plugin não existe — os métodos abaixo então resolvem
 * como no-op/null, e o HomePage mantém o card com o mockup estático de fallback.
 */
@Injectable({ providedIn: 'root' })
export class AdMobService {
  private initialized = false;

  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async initialize(): Promise<void> {
    if (!this.isNative || this.initialized) return;
    await TapGoatAdMob.initialize();
    this.initialized = true;
  }

  async loadNativeAd(): Promise<NativeAdData | null> {
    if (!this.isNative) return null;
    await this.initialize();
    return TapGoatAdMob.loadNativeAd({ adUnitId: environment.admob.nativeAdUnitId });
  }

  /** rect em pixels de tela (CSS px * devicePixelRatio), calculado a partir do card HTML. */
  async showAdOverlay(rect: { x: number; y: number; width: number; height: number }): Promise<void> {
    if (!this.isNative) return;
    const dpr = window.devicePixelRatio || 1;
    await TapGoatAdMob.showAdOverlay({
      x: Math.round(rect.x * dpr),
      y: Math.round(rect.y * dpr),
      width: Math.round(rect.width * dpr),
      height: Math.round(rect.height * dpr),
    });
  }

  async hideAdOverlay(): Promise<void> {
    if (!this.isNative) return;
    await TapGoatAdMob.hideAdOverlay();
  }
}
