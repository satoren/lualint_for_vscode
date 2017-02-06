'use strict';

import * as path from 'path';
import * as fs from 'fs';
const LuaVM = require('./lua.vm');

const luacheck_module_path = path.normalize(path.join(__dirname, '../luamodule/'))

export interface report {
    code: string;
    column: number;
    end_column: number;
    line: number;
    name: string;
    message: string;
    msg?: string;
    module?: string;
    indirect?: string;
    func?: boolean;
    recursive?: string;
    mutually_recursive?: string;
    field?: string;
    prev_line?: number;
    label?: string;
}

export class luacheck {
    constructor(public L) {
        L.mount(luacheck_module_path, "/luacheck");
        L.execute("package.path = package.path..';/luacheck/?.lua;/luacheck/?/init.lua'");
        L.execute('luacheck = require("luacheck");')


        var FS = L.filesystem();
        // Create 'lfs' library
        var lfs = {
            currentdir: function () { return FS.cwd(); },
            attributes: function (type) {
                let path = this;
                if (type == 'mode') {
                    try {
                        var stat = FS.stat(path);
                        if (!stat) { return null; }
                        var m = stat.mode;
                        if (FS.isFile(m)) { return "file" }
                        if (FS.isDir(m)) { return "directory" }
                    } catch (e) {

                    }
                    return "";
                } else { return 0; }
            },
            dir: function () { return {}; },
        }
        L.push(lfs);
        L.setglobal("lfs");
        L.execute("package.loaded.lfs = lfs")

        L.execute('luacheck_config = require("luacheck.config");')
    }

    private invokeCheckFunction(fn, source, max_reports) {
        let reports = []
        try {
            let lreports = fn.invoke([source], 1)[0]
            for (var i = 1; i < max_reports; i++) {
                let lreport = lreports.get(i);
                if (!lreport) {
                    break;
                }
                let r = {
                    code: lreport.get("code")
                    , column: lreport.get("column")
                    , end_column: lreport.get("end_column")
                    , line: lreport.get("line")
                    , name: lreport.get("name")
                    , msg: lreport.get("msg")
                    , message: lreport.get("message")
                    , module: lreport.get("module")
                    , indirect: lreport.get("indirect")
                    , func: lreport.get("func")
                    , recursive: lreport.get("recursive")
                    , mutually_recursive: lreport.get("mutually_recursive")
                    , field: lreport.get("field")
                    , prev_line: lreport.get("prev_line")
                    , label: lreport.get("label")
                }
                lreport.free();
                reports.push(r)
            }
            lreports.free();
        }
        catch (e) {
            console.error(e)
        }
        finally {
        }
        return reports;

    }

    public check(filepath, source_text="", max_reports = 100): report[] {

        if (fs.existsSync(filepath)) {
            var full_path = path.resolve(filepath);
            var token = path.parse(full_path);
            var cwd = path.dirname(full_path);
            var filename = path.basename(full_path);
            this.L.chroot(token.root);
            this.L.chdir(cwd);
            filepath = path.relative(cwd, filepath)
        }

        if (source_text.length != 0) {


            let file_checker = this.L.load('local options = luacheck_config.load_config().options ' +
                '  local reports = luacheck.check_strings({...},options)[1] ' +
                '  for i = 1,#reports do ' +
                '   reports[i]["message"] =luacheck.get_message(reports[i]) ' +
                '  end ' +
                ' return reports ');
            let reports = this.invokeCheckFunction(file_checker, source_text, max_reports);
            file_checker.free();
            return reports;
        }
        else {
            let strings_checker = this.L.load('local options = luacheck_config.load_config().options ' +
                '  local reports = luacheck.check_files({...},options)[1] ' +
                '  for i = 1,#reports do ' +
                '   reports[i]["message"] =luacheck.get_message(reports[i]) ' +
                '  end ' +
                ' return reports ');
            let reports = this.invokeCheckFunction(strings_checker, filepath, max_reports);
            strings_checker.free();
            return reports;
        }
    }

}