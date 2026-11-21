import XCTest

final class MoleculeFoundryUITests: XCTestCase {
    @MainActor
    func testOfflineGameRendersAndNotebookOpens() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launch()
        let web = app.webViews.firstMatch
        XCTAssertTrue(web.waitForExistence(timeout: 20), "The native game WebView must exist")
        let heading = web.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "A little relief.")).firstMatch
        XCTAssertTrue(heading.waitForExistence(timeout: 25), "The offline game heading must render")
        let firstAction = web.buttons["Choose aromatic core"]
        XCTAssertTrue(firstAction.waitForExistence(timeout: 10), "The first gameplay action must be available")

        let launch = XCTAttachment(screenshot: app.screenshot())
        launch.name = "offline-game-rendered"
        launch.lifetime = .keepAlways
        add(launch)

        let notebook = web.buttons["Notebook"]
        XCTAssertTrue(notebook.waitForExistence(timeout: 10))
        notebook.tap()
        XCTAssertTrue(web.staticTexts["Your lab notebook"].waitForExistence(timeout: 10), "Notebook navigation must work in the native app")

        let notebookShot = XCTAttachment(screenshot: app.screenshot())
        notebookShot.name = "offline-game-notebook"
        notebookShot.lifetime = .keepAlways
        add(notebookShot)
    }
}
