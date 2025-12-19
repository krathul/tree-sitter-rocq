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
    module: ($) => repeat($._command),

    // basic tokens
    identifier: ($) => /[A-Za-z_]+/,

    number: ($) => /[0-9]+/,

    // Every file is sequence of vernacular commands
    _command: ($) => seq(choice($.declaration), "."),

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
        $.term_match,
        $.term_if,
        $.term_expr,
      ),

    term_expr: ($) =>
      choice(
        // $.unary_expr,
        // $.binary_expr,
        $.number,
        $.identifier,
      ),

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
        field("body", $.type),
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
        choice("Definition", "Example"),
        field("name", $.identifier),
        field("binder", repeat($.binder)),
        ":=",
        field("body", $.term),
      ),

    theorem_kind: ($) =>
      seq(
        choice("Theorem", "Lemma", "Fact", "Remark", "Corollary"),
        field("name", $.identifier),
        field("binder", repeat($.binder)),
        field("body", $.type),
      ),

    assumption_kind: ($) =>
      seq(
        choice("Hypothesis", "Variable", "Variables"),
        field("name", $.identifier),
        field("body", $.term),
      ),
  },
});
