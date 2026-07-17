import { Injectable } from '@angular/core';

export type Lang = 'PT' | 'EN' | 'ES';

export interface I18nStrings {
  tagline: string; welcomeTitle: string; welcomeSub: string;
  removeAds: string; adLabel: string; adCopy: string; adCta: string;
  shareTitle: string; shareSub: string; copyLabel: string; copied: string; more: string;
  payTitle: string; payDesc: string; price: string; oneTime: string;
  buyLabel: string; payFine: string; bought: string; perks: string[];
  coatTitle: string; coats: Record<'cream' | 'spotted' | 'black' | 'brown' | 'white', string>;
  termsLabel: string; privacyLabel: string;
}

const I18N: Record<Lang, I18nStrings> = {
  PT: {
    tagline: 'A CABRA MAIS FOFA', welcomeTitle: 'Bem-vindo ao GOAT!', welcomeSub: 'Toque na cabra para ouvir o "bééé" 🐐',
    removeAds: 'Remover anúncios', adLabel: 'ANÚNCIO', adCopy: 'Gerencie sua fazenda no celular', adCta: 'Abrir',
    shareTitle: 'Compartilhar o GOAT', shareSub: 'Envie o link da loja para os amigos', copyLabel: 'Copiar', copied: 'Copiado!', more: 'Mais',
    payTitle: 'GOAT Premium', payDesc: 'Sem anúncios, para sempre', price: 'R$ 9,90', oneTime: 'pagamento único',
    buyLabel: 'Comprar agora', payFine: 'Compra vitalícia • sem assinatura', bought: 'Anúncios removidos!',
    perks: ['Zero anúncios para sempre', 'Careta e "bééé" turbinados', 'Apoie o pastoreio ✨'],
    coatTitle: 'Estampa', coats: { cream: 'Creme', spotted: 'Malhada', black: 'Preta', brown: 'Marrom', white: 'Branca' },
    termsLabel: 'Termos de Uso', privacyLabel: 'Política de Privacidade',
  },
  EN: {
    tagline: 'THE CUTEST GOAT', welcomeTitle: 'Welcome to GOAT!', welcomeSub: 'Tap the goat to hear it go "baaa" 🐐',
    removeAds: 'Remove ads', adLabel: 'AD', adCopy: 'Manage your farm on the go', adCta: 'Open',
    shareTitle: 'Share GOAT', shareSub: 'Send the store link to your friends', copyLabel: 'Copy', copied: 'Copied!', more: 'More',
    payTitle: 'GOAT Premium', payDesc: 'No ads, forever', price: '$1.99', oneTime: 'one-time',
    buyLabel: 'Buy now', payFine: 'Lifetime purchase • no subscription', bought: 'Ads removed!',
    perks: ['Zero ads forever', 'Extra silly faces & bleats', 'Support the herd ✨'],
    coatTitle: 'Coat', coats: { cream: 'Cream', spotted: 'Spotted', black: 'Black', brown: 'Brown', white: 'White' },
    termsLabel: 'Terms of Use', privacyLabel: 'Privacy Policy',
  },
  ES: {
    tagline: 'LA CABRA MÁS LINDA', welcomeTitle: '¡Bienvenido a GOAT!', welcomeSub: 'Toca la cabra para oír el "bééé" 🐐',
    removeAds: 'Quitar anuncios', adLabel: 'ANUNCIO', adCopy: 'Gestiona tu granja desde el móvil', adCta: 'Abrir',
    shareTitle: 'Compartir GOAT', shareSub: 'Envía el enlace de la tienda a tus amigos', copyLabel: 'Copiar', copied: '¡Copiado!', more: 'Más',
    payTitle: 'GOAT Premium', payDesc: 'Sin anuncios, para siempre', price: '€1,99', oneTime: 'pago único',
    buyLabel: 'Comprar ahora', payFine: 'Compra vitalicia • sin suscripción', bought: '¡Anuncios eliminados!',
    perks: ['Cero anuncios para siempre', 'Muecas y "bééé" turbo', 'Apoya al rebaño ✨'],
    coatTitle: 'Pelaje', coats: { cream: 'Crema', spotted: 'Manchada', black: 'Negra', brown: 'Marrón', white: 'Blanca' },
    termsLabel: 'Términos de Uso', privacyLabel: 'Política de Privacidad',
  },
};

/** i18n simples PT/EN/ES para o app (sem lib externa: 3 idiomas com textos estáticos não justificam a dependência). */
@Injectable({ providedIn: 'root' })
export class I18nService {
  /** Deriva PT/EN/ES a partir do locale do dispositivo; padrão EN se não reconhecido. */
  static detectSystemLang(): Lang {
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.startsWith('pt')) return 'PT';
    if (nav.startsWith('es')) return 'ES';
    return 'EN';
  }

  get(lang: Lang): I18nStrings {
    return I18N[lang];
  }
}
