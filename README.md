# luacheck README

Lua error checker

## Features
* Syntax error check
* Support all platforms for Visual Studio Code
* Static analyze by [luacheck](https://github.com/mpeterv/luacheck) (default off)
* No dependency and additional installation 


## Extension Settings

This extension contributes the following settings:

* `lualint.useLuacheck`: If true use [luacheck](https://github.com/mpeterv/luacheck) more detail analyze. Otherwise syntax error only check.
* `lualint.maxNumberOfReports`: Maximum number of code check reports.

## Known Issues

* Wrong column with multibyte characters
* ``.luacheckrc`` read only in the same directory

## Release Notes

### 0.0.2
add repositry URL
