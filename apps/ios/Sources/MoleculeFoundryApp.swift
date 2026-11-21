import SwiftUI

@main
struct MoleculeFoundryApp: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .background(Color(red: 0.025, green: 0.055, blue: 0.09))
                .preferredColorScheme(.dark)
        }
    }
}
