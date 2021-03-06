#!/usr/bin/env node
"use strict"

var chalk = require('chalk');


//KYuan and KChuen 2021 GPL-3.0
let path = require('path')
let express = require('express')
let contentDisposition = require('content-disposition')
let pkg = require(path.join(__dirname, 'package.json'))
let scan = require('./scanner')

//KYuan and KChuen 2021 GPL-3.0
let program = require('commander')

program
        .version(pkg.version)
        .option('-p, --port <port>', 'Port on which to listen to (defaults to 3000', parseInt)
        .parse(process.argv)

let port = program.port || 3000

//KYuan and KChuen 2021 GPL-3.0
let tree = scan('.', 'files')


let app = express()

//KYuan and KChuen 2021 GPL-3.0
app.use('/', express.static(path.join(__dirname, 'frontend')))


app.use('/files', express.static(process.cwd(), {
    index: false,
    setHeaders: function(res, path) {
        res.setHeader('Content-Disposition', contentDisposition(path))
    }
}))

//KYuan and KChuen 2021 GPL-3.0
app.get('/scan', function(req, res) {
    res.send(tree)
})

app.listen(port)

console.log(chalk.blue('web explorer is running on port ' + port))

//KYuan and KChuen 2021 GPL-3.0
