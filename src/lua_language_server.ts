'use strict';

import {
    IPCMessageReader, IPCMessageWriter,
    createConnection, IConnection,
    TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
    InitializeParams, InitializeResult
} from 'vscode-languageserver';

import Uri from 'vscode-uri'
import * as path from 'path';

import * as luacheck from './luacheck';
const LuaVM = require('./lua.vm');
let L = new LuaVM.Lua.State();
let checker = new luacheck.luacheck(L)

interface Settings {
    lualint: LuaLintSetting;
}

// These are the example settings we defined in the client's package.json
// file
interface LuaLintSetting {
    useLuacheck: boolean;
    maxNumberOfReports: number;
}

// hold the useLuacheck setting
let useLuacheck: boolean;
let maxNumberOfReports: number;

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
let documents: TextDocuments = new TextDocuments();

documents.listen(connection);

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities. 
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind
        }
    }
});

// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
    let settings = <Settings>change.settings;
    useLuacheck = settings.lualint.useLuacheck;
    maxNumberOfReports = settings.lualint.maxNumberOfReports || 100;
    // Revalidate any open text documents
    documents.all().forEach(validateTextDocument);
});

documents.onDidChangeContent((change) => {
    validateTextDocument(change.document)
});

function validateTextDocument(textDocument: TextDocument): void {
    if (useLuacheck) {
        fullcheck_by_luacheck(textDocument.getText(), textDocument.uri);
    }
    else {
        syntax_error_check(textDocument.getText(), textDocument.uri);
    }

}

function syntax_error_check(text, uri) {
    const message_parse_reg = /..+:([0-9]+): (.+) near.*[<'](.*)['>]/;

    let fspath = Uri.parse(uri).fsPath;
    let diagnostics: Diagnostic[] = [];
    try {

        let syntax = L.load(text, path.basename(fspath));
        syntax.free();
    }
    catch (e) {
        const match = message_parse_reg.exec(e.message)
        const error = {
            line: parseInt(match[1]),
            kind: match[2],
            near: match[3],
        }
        let lines = text.split(/\r?\n/g);
        let errorLine = lines[error.line - 1];
        let errorStart = { line: error.line - 1, character: 0 };
        let errorEnd = { line: error.line - 1, character: errorLine.length };
        if (error.near != "eof") {
            let errorColstart = errorLine.indexOf(error.near);
            if (errorColstart >= 0) {
                errorStart = { line: error.line - 1, character: errorColstart };
                errorEnd = { line: error.line - 1, character: errorColstart + error.near.length };
            }
        }
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: errorStart,
                end: errorEnd
            },
            message: e.message
        });
    }

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: uri, diagnostics });
}

function fullcheck_by_luacheck(text, uri) {

    let fspath = Uri.parse(uri).fsPath;

    var document_full_path = path.resolve(fspath);

    let diagnostics: Diagnostic[] = [];
    let reports = checker.check(document_full_path, text, maxNumberOfReports)
    for (var report of reports) {

        let errorStart = { line: report.line - 1, character: report.column - 1 };
        let errorEnd = { line: report.line - 1, character: report.end_column };

        let level = DiagnosticSeverity.Warning;
        if (report.msg) {
            level = DiagnosticSeverity.Error;
        }
        diagnostics.push({
            severity: level,
            range: {
                start: errorStart,
                end: errorEnd
            },
            message: report.message
        });
    }
    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: uri, diagnostics });
}


// Listen on the connection
connection.listen();