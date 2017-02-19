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
    name?: string;
    message: string;
    msg?: string;
    module?: boolean;
    indirect?: boolean;
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
        function members_copy(luadata, table, names) {
            for (let name of names) {
                let value = luadata.get(name);
                if (value !== undefined) {
                    if (!value.free) {
                        table[name] = value
                    }
                    else {
                        value.free()
                    }
                }
            }
        }
        let reports = []
        try {
            let lreports = fn.invoke([source], 1)[0]
            for (var i = 1; i <= max_reports; i++) {
                let lreport = lreports.get(i);
                if (!lreport) {
                    break;
                }
                let rt = {}
                members_copy(lreport, rt, ["code", "column", "end_column", "line", "name"
                    , "msg", "message", "module", "indirect", "func", "recursive"
                    , "mutually_recursive", "field", "prev_line", "label"]);
                lreport.free();
                reports.push(rt)
            }
            lreports.free();
        }
        catch (e) {
            console.error(e)
        }
        finally {
        }
        return JSON.parse(JSON.stringify(reports));

    }
    public check(filepath, source_text = "", max_reports = 100): report[] {

        if (fs.existsSync(filepath)) {
            let full_path = path.resolve(filepath);
            let token = path.parse(full_path);
            let cwd = path.dirname(full_path);
            let filename = path.basename(full_path);
            let mountdir = cwd
            try {
                while (true) {
                    let root = mountdir.split(path.sep).slice(0, -1).join(path.sep);
                    this.L.chroot(root);
                    mountdir = root
                }

            } catch (e) {
                this.L.chroot(mountdir);
            }
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