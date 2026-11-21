import SwiftUI
import WebKit
import UniformTypeIdentifiers

struct GameView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.setURLSchemeHandler(GameAssets(), forURLScheme: "foundry")
        configuration.userContentController.add(context.coordinator, name: "foundry")
        configuration.websiteDataStore = .default()
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = context.coordinator
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 0.025, green: 0.055, blue: 0.09, alpha: 1)
        view.scrollView.backgroundColor = view.backgroundColor
        view.scrollView.isScrollEnabled = false
        view.allowsBackForwardNavigationGestures = false
        view.load(URLRequest(url: URL(string: "foundry://localhost/native.html")!))
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.frameInfo.isMainFrame,
                  message.frameInfo.request.url?.scheme == "foundry",
                  let event = message.body as? String else { return }
            DispatchQueue.main.async {
                switch event {
                case "success": UINotificationFeedbackGenerator().notificationOccurred(.success)
                case "warning": UINotificationFeedbackGenerator().notificationOccurred(.warning)
                case "selection": UISelectionFeedbackGenerator().selectionChanged()
                default: break
                }
            }
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
            if url.scheme == "foundry", url.host == "localhost" {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
                if navigationAction.navigationType == .linkActivated, url.scheme == "https" {
                    UIApplication.shared.open(url)
                }
            }
        }
    }
}

final class GameAssets: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url,
              let base = Bundle.main.resourceURL?.appendingPathComponent("Game", isDirectory: true) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist)); return
        }
        let path = url.path.isEmpty || url.path == "/" ? "native.html" : String(url.path.dropFirst())
        let target = base.appendingPathComponent(path).standardizedFileURL
        guard target.path.hasPrefix(base.standardizedFileURL.path + "/"),
              let data = try? Data(contentsOf: target) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist)); return
        }
        let ext = target.pathExtension.lowercased()
        let type = ext == "js" ? "application/javascript" : (UTType(filenameExtension: ext)?.preferredMIMEType ?? "application/octet-stream")
        let response = URLResponse(url: url, mimeType: type, expectedContentLength: data.count, textEncodingName: ["js", "css", "html", "json"].contains(ext) ? "utf-8" : nil)
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}
