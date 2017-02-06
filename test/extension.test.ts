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
    test("global_inline_options.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'global_inline_options.lua');
        let reports = checker.check(CHECK_DATA);
        let req = [{ "code": "131", "column": 10, "end_column": 10, "line": 6, "name": "f", "message": "unused global variable 'f'" }, { "code": "111", "column": 4, "end_column": 6, "line": 7, "name": "baz", "message": "setting non-standard global variable 'baz'" }, { "code": "111", "column": 4, "end_column": 11, "line": 18, "name": "external", "message": "setting non-module global variable 'external'", "module": true }]
        assert(JSON.stringify(req) == JSON.stringify(reports))
    });
    test("bad_code.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'bad_code.lua');
        let reports = checker.check(CHECK_DATA);
        let req = [{ "code": "211", "column": 16, "end_column": 21, "line": 3, "name": "helper", "message": "unused function 'helper'", "func": true }, { "code": "212", "column": 23, "end_column": 25, "line": 3, "name": "...", "message": "unused variable length argument" }, { "code": "111", "column": 10, "end_column": 16, "line": 7, "name": "embrace", "message": "setting non-standard global variable 'embrace'" }, { "code": "412", "column": 10, "end_column": 12, "line": 8, "name": "opt", "message": "variable 'opt' was previously defined as an argument on line 7", "prev_line": 7 }, { "code": "113", "column": 11, "end_column": 16, "line": 9, "name": "hepler", "message": "accessing undefined variable 'hepler'" }];
        assert(JSON.stringify(req) == JSON.stringify(reports))

    });
    test("bad_flow.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'bad_flow.lua');
        let reports = checker.check(CHECK_DATA);
        let req = [{ "code": "542", "column": 28, "end_column": 31, "line": 1, "message": "empty if branch" }, { "code": "541", "column": 4, "end_column": 5, "line": 6, "message": "empty do..end block" }, { "code": "532", "column": 15, "end_column": 15, "line": 12, "message": "left-hand side of assignment is too long" }, { "code": "531", "column": 15, "end_column": 15, "line": 16, "message": "left-hand side of assignment is too short" }, { "code": "511", "column": 7, "end_column": 11, "line": 21, "message": "unreachable code" }, { "code": "512", "column": 1, "end_column": 5, "line": 25, "message": "loop is executed at most once" }]

        assert(JSON.stringify(req) == JSON.stringify(reports))
    });
    test("bad_whitespace.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'bad_whitespace.lua');
        let reports = checker.check(CHECK_DATA);
        let req = [{ "code": "612", "column": 26, "end_column": 26, "line": 4, "message": "line contains trailing whitespace" }, { "code": "612", "column": 25, "end_column": 25, "line": 8, "message": "line contains trailing whitespace" }, { "code": "612", "column": 40, "end_column": 40, "line": 13, "message": "line contains trailing whitespace" }, { "code": "611", "column": 1, "end_column": 1, "line": 17, "message": "line contains only whitespace" }, { "code": "611", "column": 1, "end_column": 1, "line": 18, "message": "line contains only whitespace" }, { "code": "611", "column": 1, "end_column": 2, "line": 19, "message": "line contains only whitespace" }, { "code": "611", "column": 1, "end_column": 3, "line": 20, "message": "line contains only whitespace" }, { "code": "621", "column": 1, "end_column": 2, "line": 25, "message": "inconsistent indentation (SPACE followed by TAB)" }]
        assert(JSON.stringify(req) == JSON.stringify(reports))
    });
    test("compat.lua", () => {
        const CHECK_DATA = path.join(TEST_DATA_ROOT, 'samples', 'compat.lua');
        let reports = checker.check(CHECK_DATA);
        let req = [{ "code": "113", "column": 2, "end_column": 8, "line": 1, "name": "setfenv", "message": "accessing undefined variable 'setfenv'" }, { "code": "113", "column": 22, "end_column": 28, "line": 1, "name": "setfenv", "message": "accessing undefined variable 'setfenv'" }]

        assert(JSON.stringify(req) == JSON.stringify(reports))
    });
});