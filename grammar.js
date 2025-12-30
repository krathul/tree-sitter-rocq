/**
 * @file Rocq parser
 * @author Athul Raj Kollareth <krathul3152@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "tree_sitter_rocq",

  word: ($) => $.identifier,

  conflicts: ($) => [],

  rules: {
    // TODO: add the actual grammar rules
    module: ($) => repeat(seq($._command, ".")),

    // basic tokens
    identifier: ($) => /[a-zA-Z]+/,

    number: ($) => /[0-9]+/,

    // qualified names
    // FIXME: I suppose qualid shouldn't really be treated as a token
    qualid: ($) => token(/[a-zA-Z]+([.][a-zA-Z]+)+/),

    // Every file is a sequence of vernacular commands
    _command: ($) => choice($.include, $.declaration),

    include: ($) =>
      seq(
        "Require",
        optional(choice("Import", "Export")),
        choice($.qualid, $.identifier),
      ),

    // type
    type: ($) => $.term,

    // binders
    // TODO: Add support for plain name binders
    implicit_binder: ($) =>
      seq(
        "{",
        repeat1(field("name", $.identifier)),
        optional(seq(":", field("type", $.type))),
        "}",
      ),

    explicit_binder: ($) =>
      seq(
        "(",
        repeat1(field("name", $.identifier)),
        ":",
        field("type", $.type),
        ")",
      ),

    open_binder: ($) =>
      seq(repeat1(field("name", $.identifier)), ":", field("type", $.type)),

    binder: ($) => choice($.open_binder, $.implicit_binder, $.explicit_binder),

    pattern: ($) => choice($.identifier, $.number),

    // terms
    term: ($) =>
      choice(
        $.term_let,
        $.term_forall,
        $.term_fun,
        $.term_if,
        $.term_expr,
        $.term_application,
        $.one_term,
      ),

    term_generalizing: ($) =>
      choice(
        seq("`{", $.term, "}"),
        seq(token.immediate("`("), $.term, token.immediate(")")),
      ),

    // TODO: Add term_scope
    one_term: ($) =>
      choice(
        $.qualid,
        $.identifier,
        $.term_match,
        $.term_generalizing,
        $.number,
        // qualid annotated
        seq("@", $.qualid),
      ),

    term_expr: ($) => choice(),
    // $.unary_expr,
    // $.binary_expr,

    term_application: ($) => seq($.one_term, repeat1($.one_term)),

    term_let: ($) =>
      seq(
        "let",
        choice(
          seq(
            field("name", $.identifier),
            optional(seq(":", field("type", $.type))),
          ),
          seq(field("name", $.identifier), field("binder", repeat1($.binder))),
        ),
        ":=",
        field("body", seq($.term, "in", $.term)),
      ),

    term_forall: ($) =>
      seq(
        "forall",
        field("binder", repeat1($.binder)),
        ",",
        field("body", $.term),
      ),

    term_fun: ($) =>
      seq(
        "fun",
        field("binder", repeat1($.binder)),
        "=>",
        field("body", $.term),
      ),

    term_match: ($) =>
      seq(
        "match",
        $.term,
        "with",
        field("match_case", repeat1(seq("|", $.pattern, "=>", $.term))),
        "end",
      ),

    term_if: ($) => seq("if", $.term, "then", $.term, "else", $.term),

    // declarations
    declaration: ($) =>
      choice($.definition_kind, $.theorem_kind, $.assumption_kind),

    definition_kind: ($) =>
      seq(
        choice("Definition", "Example", "Let"),
        field("name", $.identifier),
        optional(field("binder", repeat($.binder))),
        ":=",
        field("body", $.term),
      ),

    theorem_kind: ($) =>
      seq(
        choice("Theorem", "Lemma", "Fact", "Remark", "Corollary"),
        field("name", $.identifier),
        field("binder", repeat($.binder)),
        field("body", $.term),
      ),

    assumption_kind: ($) =>
      seq(
        choice("Hypothesis", "Variable", "Variables"),
        field("name", $.identifier),
        field("body", $.term),
      ),
  },
});
