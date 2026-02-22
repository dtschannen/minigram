import Foundation
import WebKit

struct ContentBlocker {
    static func configureUserScripts(on controller: WKUserContentController) {
        if let cssURL = Bundle.main.url(forResource: "InjectedCSS", withExtension: "css"),
           let css = try? String(contentsOf: cssURL, encoding: .utf8) {
            let escaped = css
                .replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "'", with: "\\'")
                .replacingOccurrences(of: "\n", with: "\\n")
            let js = """
            var style = document.createElement('style');
            style.textContent = '\(escaped)';
            document.head.appendChild(style);
            """
            let script = WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            controller.addUserScript(script)
        }

        if let jsURL = Bundle.main.url(forResource: "InjectedScript", withExtension: "js"),
           let jsCode = try? String(contentsOf: jsURL, encoding: .utf8) {
            let script = WKUserScript(source: jsCode, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
            controller.addUserScript(script)
        }
    }

    static func compileBlockingRules(completion: @escaping (WKContentRuleList?) -> Void) {
        guard let url = Bundle.main.url(forResource: "BlockingRules", withExtension: "json"),
              let json = try? String(contentsOf: url, encoding: .utf8) else {
            completion(nil)
            return
        }

        WKContentRuleListStore.default().compileContentRuleList(
            forIdentifier: "MinigamBlocker",
            encodedContentRuleList: json
        ) { ruleList, error in
            if let error {
                print("Content rule compile error: \(error.localizedDescription)")
            }
            completion(ruleList)
        }
    }
}
