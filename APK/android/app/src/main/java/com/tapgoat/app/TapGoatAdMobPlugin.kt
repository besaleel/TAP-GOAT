package com.tapgoat.app

import android.graphics.Color
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.TextView
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdOptions
import com.google.android.gms.ads.nativead.NativeAdView

/**
 * Ponte para o Google Mobile Ads SDK (Native Advanced Ad).
 *
 * O layout do card de anúncio é 100% desenhado em HTML/CSS (ver home.page.html)
 * para preservar o design do protótipo. Este plugin apenas:
 *  1) carrega o NativeAd real e devolve os textos/ícone ao JS para renderizar o card;
 *  2) mantém um NativeAdView nativo transparente, sobreposto exatamente na área do
 *     card HTML, com as views obrigatórias (headline/body/CTA) registradas nele —
 *     mesmo invisíveis, essas views são exigidas pelo SDK do Google para que cliques
 *     e impressões sejam contabilizados como válidos (ver política de Native Ads).
 *
 * Sem esse overlay nativo, o clique feito no HTML nunca chegaria ao SDK do Google,
 * e violaria a política de "cliques inválidos" do AdMob.
 */
@CapacitorPlugin(name = "TapGoatAdMob")
class TapGoatAdMobPlugin : Plugin() {

    private var nativeAd: NativeAd? = null
    private var adView: NativeAdView? = null
    private var initialized = false

    @PluginMethod
    fun initialize(call: PluginCall) {
        if (initialized) {
            call.resolve()
            return
        }
        MobileAds.initialize(context) {
            initialized = true
            call.resolve()
        }
    }

    @PluginMethod
    fun loadNativeAd(call: PluginCall) {
        val adUnitId = call.getString("adUnitId")
        if (adUnitId.isNullOrBlank()) {
            call.reject("adUnitId é obrigatório")
            return
        }

        val adLoader = com.google.android.gms.ads.AdLoader.Builder(context, adUnitId)
            .forNativeAd { ad ->
                nativeAd?.destroy()
                nativeAd = ad
                val result = JSObject()
                result.put("headline", ad.headline ?: "")
                result.put("body", ad.body ?: "")
                result.put("callToAction", ad.callToAction ?: "")
                result.put("advertiser", ad.advertiser ?: "")
                val iconUri = ad.icon?.uri?.toString()
                if (iconUri != null) result.put("iconUri", iconUri)
                call.resolve(result)
            }
            .withAdListener(object : com.google.android.gms.ads.AdListener() {
                override fun onAdFailedToLoad(adError: com.google.android.gms.ads.LoadAdError) {
                    call.reject("Falha ao carregar anúncio: ${adError.message}")
                }
            })
            .withNativeAdOptions(NativeAdOptions.Builder().build())
            .build()

        adLoader.loadAd(AdRequest.Builder().build())
    }

    /**
     * Posiciona (ou reposiciona) o overlay nativo transparente exatamente sobre as
     * coordenadas do card HTML, em pixels de tela (o JS calcula via
     * getBoundingClientRect() * devicePixelRatio antes de chamar este método).
     */
    @PluginMethod
    fun showAdOverlay(call: PluginCall) {
        val ad = nativeAd
        if (ad == null) {
            call.reject("Nenhum anúncio carregado — chame loadNativeAd primeiro")
            return
        }
        val x = call.getInt("x", 0) ?: 0
        val y = call.getInt("y", 0) ?: 0
        val width = call.getInt("width", 0) ?: 0
        val height = call.getInt("height", 0) ?: 0

        activity.runOnUiThread {
            removeOverlayInternal()

            val nativeAdView = NativeAdView(activity)
            nativeAdView.setBackgroundColor(Color.TRANSPARENT)

            // Views obrigatórias para o SDK validar cliques/impressões — mantidas
            // invisíveis (o visual real é o card HTML por baixo do overlay).
            val headlineView = TextView(activity).apply { visibility = View.INVISIBLE; text = ad.headline }
            val bodyView = TextView(activity).apply { visibility = View.INVISIBLE; text = ad.body }
            val ctaView = Button(activity).apply {
                visibility = View.VISIBLE
                alpha = 0f
                text = ad.callToAction
            }

            nativeAdView.addView(headlineView, ViewGroup.LayoutParams(0, 0))
            nativeAdView.addView(bodyView, ViewGroup.LayoutParams(0, 0))
            nativeAdView.addView(ctaView, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))

            nativeAdView.headlineView = headlineView
            nativeAdView.bodyView = bodyView
            nativeAdView.callToActionView = ctaView
            nativeAdView.setNativeAd(ad)

            val params = FrameLayout.LayoutParams(width, height)
            params.leftMargin = x
            params.topMargin = y
            activity.addContentView(nativeAdView, params)

            adView = nativeAdView
            call.resolve()
        }
    }

    @PluginMethod
    fun hideAdOverlay(call: PluginCall) {
        activity.runOnUiThread {
            removeOverlayInternal()
            call.resolve()
        }
    }

    private fun removeOverlayInternal() {
        adView?.let { view ->
            (view.parent as? ViewGroup)?.removeView(view)
        }
        adView = null
    }

    override fun handleOnDestroy() {
        removeOverlayInternal()
        nativeAd?.destroy()
        nativeAd = null
        super.handleOnDestroy()
    }
}
