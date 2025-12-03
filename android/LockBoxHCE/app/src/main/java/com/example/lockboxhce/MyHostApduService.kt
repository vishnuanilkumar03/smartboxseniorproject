package com.example.lockboxhce   // <= IMPORTANT: same as MainActivity

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log

class MyHostApduService : HostApduService() {

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        // For now, ignore commandApdu content and just return the latest token JSON
        val tokenJson = HCEStorage.pendingTokenJson
        Log.d("HCE", "Sending token from HCE: $tokenJson")

        // If nothing set yet, send a simple message so you know it’s working
        val response = if (tokenJson.isNotEmpty()) tokenJson else "NO_TOKEN"

        return response.toByteArray(Charsets.UTF_8)
    }

    override fun onDeactivated(reason: Int) {
        Log.d("HCE", "Deactivated: $reason")
    }
}
