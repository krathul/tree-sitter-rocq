import XCTest
import SwiftTreeSitter
import TreeSitterTreeSitterRocq

final class TreeSitterTreeSitterRocqTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_tree_sitter_rocq())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading TreeSitterRocq grammar")
    }
}
