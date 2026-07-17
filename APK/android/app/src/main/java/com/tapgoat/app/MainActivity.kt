package com.tapgoat.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(TapGoatAdMobPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
