import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const GOAT_NAME_KEY = 'goatName';

/** Persistência local simples do jogador (Capacitor Preferences) — sobrevive a reaberturas do app. */
@Injectable({ providedIn: 'root' })
export class PlayerPrefsService {
  async getGoatName(): Promise<string> {
    const { value } = await Preferences.get({ key: GOAT_NAME_KEY });
    return value ?? '';
  }

  async setGoatName(name: string): Promise<void> {
    await Preferences.set({ key: GOAT_NAME_KEY, value: name });
  }
}
