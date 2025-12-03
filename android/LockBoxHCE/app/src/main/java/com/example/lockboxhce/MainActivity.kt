package com.example.lockboxhce

import android.os.Bundle
import android.util.Log
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import android.net.http.SslError
import android.webkit.SslErrorHandler


object HCEStorage {
    @Volatile
    var pendingTokenJson: String = ""
}

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.loadsImagesAutomatically = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.allowUniversalAccessFromFileURLs = true

        webView.addJavascriptInterface(WebAppInterface(), "AndroidHCE")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                return false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                Log.e("WEBVIEW", "Error: ${error?.description}")
            }
            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: android.net.http.SslError?
            ) {
                Log.e("WEBVIEW", "SSL Error: ${error?.primaryError}")
                handler?.proceed()
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                Log.d("WEBVIEW", "Page loaded: $url")
            }

        }

        webView.loadUrl("https://smartboxseniorproject.vercel.app/")
    }

    class WebAppInterface {
        @JavascriptInterface
        fun sendToken(tokenJson: String) {
            HCEStorage.pendingTokenJson = tokenJson
            Log.d("HCE", "Token received from PWA: $tokenJson")
        }
    }
}
