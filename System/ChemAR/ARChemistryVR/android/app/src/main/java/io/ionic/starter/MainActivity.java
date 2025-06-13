package io.ionic.starter;  // <-- Make sure this matches your package name!

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable WebView debugging for WebXR
        WebView.setWebContentsDebuggingEnabled(true);

        // Optional: Force WebView to use Chrome (required for better WebXR support)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }
}
