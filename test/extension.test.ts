//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';



import * as luacheck from '../src/luacheck';
const LuaVM = require('../src/lua.vm');
let L = new LuaVM.Lua.State();
let checker = new luacheck.luacheck(L)

// Defines a Mocha test suite to group tests of similar kind together
suite("luacheck Tests", () => {

    const PROJECT_ROOT = path.join(__dirname, '../../');
    const TEST_DATA_ROOT = path.join(PROJECT_ROOT, 'third_party/luacheck/spec/');

    // Defines a Mocha unit test
    test("bad_code.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'bad_code.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "211", "column": 16, "end_column": 21, "line": 3, "name": "helper", "message": "unused function 'helper'", "func": true }, { "code": "212", "column": 23, "end_column": 25, "line": 3, "name": "...", "message": "unused variable length argument" }, { "code": "111", "column": 10, "end_column": 16, "line": 7, "name": "embrace", "message": "setting non-standard global variable 'embrace'" }, { "code": "412", "column": 10, "end_column": 12, "line": 8, "name": "opt", "message": "variable 'opt' was previously defined as an argument on line 7", "prev_line": 7 }, { "code": "113", "column": 11, "end_column": 16, "line": 9, "name": "hepler", "message": "accessing undefined variable 'hepler'" }];
        assert.deepEqual(expect, reports)

    });
    test("bad_flow.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'bad_flow.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "542", "column": 28, "end_column": 31, "line": 1, "message": "empty if branch" }, { "code": "541", "column": 4, "end_column": 5, "line": 6, "message": "empty do..end block" }, { "code": "532", "column": 15, "end_column": 15, "line": 12, "message": "left-hand side of assignment is too long" }, { "code": "531", "column": 15, "end_column": 15, "line": 16, "message": "left-hand side of assignment is too short" }, { "code": "511", "column": 7, "end_column": 11, "line": 21, "message": "unreachable code" }, { "code": "512", "column": 1, "end_column": 5, "line": 25, "message": "loop is executed at most once" }]

        assert.deepEqual(expect, reports)
    });
    test("bad_whitespace.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'bad_whitespace.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "612", "column": 26, "end_column": 26, "line": 4, "message": "line contains trailing whitespace" }, { "code": "612", "column": 25, "end_column": 25, "line": 8, "message": "line contains trailing whitespace" }, { "code": "612", "column": 40, "end_column": 40, "line": 13, "message": "line contains trailing whitespace" }, { "code": "611", "column": 1, "end_column": 1, "line": 17, "message": "line contains only whitespace" }, { "code": "611", "column": 1, "end_column": 1, "line": 18, "message": "line contains only whitespace" }, { "code": "611", "column": 1, "end_column": 2, "line": 19, "message": "line contains only whitespace" }, { "code": "611", "column": 1, "end_column": 3, "line": 20, "message": "line contains only whitespace" }, { "code": "621", "column": 1, "end_column": 2, "line": 25, "message": "inconsistent indentation (SPACE followed by TAB)" }]
        assert.deepEqual(expect, reports)
    });
    test("compat.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'compat.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "113", "column": 2, "end_column": 8, "line": 1, "name": "setfenv", "message": "accessing undefined variable 'setfenv'" }, { "code": "113", "column": 22, "end_column": 28, "line": 1, "name": "setfenv", "message": "accessing undefined variable 'setfenv'" }]

        assert.deepEqual(expect, reports)
    });
    test("defined.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'defined.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "111", "column": 1, "end_column": 3, "line": 1, "name": "foo", "message": "setting non-standard global variable 'foo'" }, { "code": "112", "column": 10, "end_column": 12, "line": 3, "name": "foo", "message": "mutating non-standard global variable 'foo'" }, { "code": "113", "column": 4, "end_column": 6, "line": 4, "name": "baz", "message": "accessing undefined variable 'baz'" }]
        assert.deepEqual(expect, reports)
    });
    test("defined2.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'defined2.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "113", "column": 1, "end_column": 3, "line": 1, "name": "foo", "message": "accessing undefined variable 'foo'" }]
        assert.deepEqual(expect, reports)
    });
    test("defined3.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'defined3.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "111", "column": 1, "end_column": 3, "line": 1, "name": "foo", "message": "setting non-standard global variable 'foo'" }, { "code": "111", "column": 1, "end_column": 3, "line": 2, "name": "foo", "message": "setting non-standard global variable 'foo'" }, { "code": "111", "column": 1, "end_column": 3, "line": 3, "name": "bar", "message": "setting non-standard global variable 'bar'" }]
        assert.deepEqual(expect, reports)
    });
    test("defined4.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'defined4.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "111", "column": 10, "end_column": 12, "line": 1, "name": "foo", "message": "setting non-standard global variable 'foo'" }, { "code": "111", "column": 4, "end_column": 6, "line": 2, "name": "foo", "message": "setting non-standard global variable 'foo'" }, { "code": "111", "column": 4, "end_column": 6, "line": 3, "name": "bar", "message": "setting non-standard global variable 'bar'" }]
        assert.deepEqual(expect, reports)
    });
    test("empty.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'empty.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = []
        assert.deepEqual(expect, reports)
    });
    test("global_inline_options.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'global_inline_options.lua');
        let reports = checker.check(CHECK_DATA);
        let expect: luacheck.report[] = [{ "code": "131", "column": 10, "end_column": 10, "line": 6, "name": "f", "message": "unused global variable 'f'" }, { "code": "111", "column": 4, "end_column": 6, "line": 7, "name": "baz", "message": "setting non-standard global variable 'baz'" }, { "code": "111", "column": 4, "end_column": 11, "line": 18, "name": "external", "message": "setting non-module global variable 'external'", "module": true }]
        assert.deepEqual(expect, reports)
    });
    test("globals.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'globals.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "113", "column": 7, "end_column": 13, "line": 1, "name": "setfenv", "message": "accessing undefined variable 'setfenv'" }]
        assert.deepEqual(expect, reports)
    });
    test("good_code.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'good_code.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = []
        assert.deepEqual(expect, reports)
    });
    test("indirect_globals.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'indirect_globals.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "113", "column": 11, "end_column": 16, "line": 2, "name": "global", "message": "accessing undefined variable 'global'" }, { "code": "122", "column": 1, "end_column": 8, "line": 5, "name": "table", "message": "indirectly mutating read-only global variable 'table'", "indirect": true }, { "code": "113", "column": 32, "end_column": 37, "line": 5, "name": "global", "message": "accessing undefined variable 'global'" }]
        assert.deepEqual(expect, reports)
    });
    test("inline_options.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'inline_options.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "211", "column": 16, "end_column": 16, "line": 6, "name": "f", "message": "unused function 'f'", "func": true }, { "code": "113", "column": 4, "end_column": 5, "line": 12, "name": "qu", "message": "accessing undefined variable 'qu'" }, { "code": "113", "column": 1, "end_column": 3, "line": 15, "name": "baz", "message": "accessing undefined variable 'baz'" }, { "code": "211", "column": 10, "end_column": 10, "line": 22, "name": "g", "message": "unused variable 'g'" }, { "code": "211", "column": 7, "end_column": 7, "line": 24, "name": "f", "message": "unused variable 'f'" }, { "code": "211", "column": 10, "end_column": 10, "line": 24, "name": "g", "message": "unused variable 'g'" }, { "code": "022", "column": 1, "end_column": 17, "line": 26, "message": "unpaired push directive" }, { "code": "023", "column": 4, "end_column": 19, "line": 28, "message": "unpaired pop directive" }, { "code": "541", "column": 1, "end_column": 2, "line": 34, "message": "empty do..end block" }, { "code": "542", "column": 10, "end_column": 13, "line": 35, "message": "empty if branch" }]
        assert.deepEqual(expect, reports)
    });
    test("python_code.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'python_code.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "011", "column": 6, "end_column": 15, "line": 1, "msg": "expected '=' near '__future__'", "message": "expected '=' near '__future__'" }]
        assert.deepEqual(expect, reports)
    });
    test("read_globals.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'read_globals.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "121", "column": 1, "end_column": 6, "line": 1, "name": "string", "message": "setting read-only global variable 'string'" }, { "code": "122", "column": 1, "end_column": 5, "line": 2, "name": "table", "message": "mutating read-only global variable 'table'" }, { "code": "111", "column": 1, "end_column": 3, "line": 4, "name": "foo", "message": "setting non-standard global variable 'foo'" }, { "code": "113", "column": 18, "end_column": 20, "line": 4, "name": "foo", "message": "accessing undefined variable 'foo'" }, { "code": "111", "column": 1, "end_column": 3, "line": 5, "name": "bar", "message": "setting non-standard global variable 'bar'" }, { "code": "113", "column": 18, "end_column": 20, "line": 5, "name": "bar", "message": "accessing undefined variable 'bar'" }, { "code": "112", "column": 1, "end_column": 3, "line": 6, "name": "baz", "message": "mutating non-standard global variable 'baz'" }, { "code": "113", "column": 21, "end_column": 23, "line": 6, "name": "baz", "message": "accessing undefined variable 'baz'" }]
        assert.deepEqual(expect, reports)
    });
    test("read_globals_inline_options.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'read_globals_inline_options.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "113", "column": 10, "end_column": 12, "line": 2, "name": "baz", "message": "accessing undefined variable 'baz'" }, { "code": "121", "column": 1, "end_column": 3, "line": 3, "name": "foo", "message": "setting read-only global variable 'foo'" }, { "code": "111", "column": 11, "end_column": 13, "line": 3, "name": "baz", "message": "setting non-standard global variable 'baz'" }, { "code": "112", "column": 16, "end_column": 18, "line": 3, "name": "baz", "message": "mutating non-standard global variable 'baz'" }, { "code": "121", "column": 1, "end_column": 3, "line": 5, "name": "foo", "message": "setting read-only global variable 'foo'" }]
        assert.deepEqual(expect, reports)
    });
    test("redefined.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'redefined.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "212", "column": 11, "end_column": 11, "line": 3, "name": "self", "message": "unused argument 'self'" }, { "code": "431", "column": 10, "end_column": 10, "line": 4, "name": "a", "message": "shadowing upvalue 'a' on line 1", "prev_line": 1 }, { "code": "221", "column": 13, "end_column": 16, "line": 4, "name": "self", "message": "variable 'self' is never set" }, { "code": "412", "column": 13, "end_column": 16, "line": 4, "name": "self", "message": "variable 'self' was previously defined as an argument on line 3", "prev_line": 3 }, { "code": "421", "column": 13, "end_column": 13, "line": 7, "name": "a", "message": "shadowing definition of variable 'a' on line 4", "prev_line": 4 }, { "code": "113", "column": 7, "end_column": 10, "line": 8, "name": "each", "message": "accessing undefined variable 'each'" }, { "code": "431", "column": 32, "end_column": 35, "line": 8, "name": "self", "message": "shadowing upvalue 'self' on line 4", "prev_line": 4 }]
        assert.deepEqual(expect, reports)
    });
    test("unused_code.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'unused_code.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "212", "column": 18, "end_column": 20, "line": 3, "name": "baz", "message": "unused argument 'baz'" }, { "code": "213", "column": 8, "end_column": 8, "line": 4, "name": "i", "message": "unused loop variable 'i'" }, { "code": "211", "column": 13, "end_column": 13, "line": 5, "name": "q", "message": "unused variable 'q'" }, { "code": "213", "column": 11, "end_column": 11, "line": 7, "name": "a", "message": "unused loop variable 'a'" }, { "code": "213", "column": 14, "end_column": 14, "line": 7, "name": "b", "message": "unused loop variable 'b'" }, { "code": "213", "column": 17, "end_column": 17, "line": 7, "name": "c", "message": "unused loop variable 'c'" }, { "code": "311", "column": 7, "end_column": 7, "line": 13, "name": "x", "message": "value assigned to variable 'x' is unused" }, { "code": "311", "column": 1, "end_column": 1, "line": 14, "name": "x", "message": "value assigned to variable 'x' is unused" }, { "code": "231", "column": 7, "end_column": 7, "line": 21, "name": "z", "message": "variable 'z' is never accessed" }]
        assert.deepEqual(expect, reports)
    });
    test("unused_secondaries.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'unused_secondaries.lua');
        let reports = checker.check(CHECK_DATA);
        
        let expect: luacheck.report[] = [{ "code": "211", "column": 7, "end_column": 7, "line": 3, "name": "a", "message": "unused variable 'a'" }, { "code": "211", "column": 7, "end_column": 7, "line": 6, "name": "x", "message": "unused variable 'x'" }, { "code": "211", "column": 13, "end_column": 13, "line": 6, "name": "z", "message": "unused variable 'z'" }, { "code": "311", "column": 1, "end_column": 1, "line": 12, "name": "o", "message": "value assigned to variable 'o' is unused" }]
        assert.deepEqual(expect, reports)
    });
});