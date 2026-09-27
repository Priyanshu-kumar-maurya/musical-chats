package com.secretbubble.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private MediaNotificationManager mediaNotificationManager;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);

                mediaNotificationManager = new MediaNotificationManager(this, webView);
                webView.addJavascriptInterface(mediaNotificationManager, "AndroidNativeMedia");
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onDestroy() {
        if (mediaNotificationManager != null) {
            mediaNotificationManager.destroy();
            mediaNotificationManager = null;
        }
        super.onDestroy();
    }
}
