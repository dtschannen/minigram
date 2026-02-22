import SwiftUI
import WebKit

struct InstagramWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        ContentBlocker.configureUserScripts(on: config.userContentController)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"

        ContentBlocker.compileBlockingRules { ruleList in
            if let ruleList {
                webView.configuration.userContentController.add(ruleList)
            }
        }

        let request = URLRequest(url: URL(string: "https://www.instagram.com/")!)
        webView.load(request)

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // WKWebView configuration is immutable after creation.
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url?.absoluteString else {
                decisionHandler(.allow)
                return
            }

            if url.contains("/reels/") || url.contains("/reel/") {
                decisionHandler(.cancel)
                webView.load(URLRequest(url: URL(string: "https://www.instagram.com/")!))
                return
            }

            decisionHandler(.allow)
        }
    }
}
