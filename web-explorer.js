#!/usr/bin/env node
"use strict"

var chalk = require('chalk');



let path = require('path')
let express = require('express')
let contentDisposition = require('content-disposition')
let pkg = require(path.join(__dirname, 'package.json'))
let scan = require('./scan')

let program = require('commander')

program
        .version(pkg.version)
        .option('-p, --port <port>', 'Port on which to listen to (defaults to 3000', parseInt)
        .parse(process.argv)

let port = program.port || 3000


let tree = scan('.', 'files')


let app = express()


app.use('/', express.static(path.join(__dirname, 'frontend')))


app.use('/files', express.static(process.cwd(), {
    index: false,
    setHeaders: function(res, path) {
        res.setHeader('Content-Disposition', contentDisposition(path))
    }
}))


app.get('/scan', function(req, res) {
    res.send(tree)
})

app.listen(port)

console.log(chalk.blue('web explorer is running on port ' + port))