"use strict"

//KYuan and KChuen 2021 GPL-3.0
let fs = require('fs')

//KYuan and KChuen 2021 GPL-3.0
module.exports = function scan(dir, alias) {
    return {
        name: alias,
        type: 'folder',
        path: alias,
        items: walk(dir, alias)
    }
}

//KYuan and KChuen 2021 GPL-3.0
function walk(dir, prefix) {
    prefix = prefix || ''

    if (!fs.statSync(dir))
        return []

    //KYuan and KChuen 2021 GPL-3.0
    return fs.readdirSync(dir).filter(function(f) {
        return f && f[0] != '.'     
    }).map(function(f) {
        let p = (dir + '/' + f).replace('./', '')
        let stat = fs.statSync(p)

        if (stat.isDirectory()) {
            return {
                name: f,
                type: 'folder',
                path: prefix + '/' + p,
                items: walk(p, prefix)
            }
        }

        //KYuan and KChuen 2021 GPL-3.0
        return {
            name: f,
            type: 'file',
            path: prefix + '/' + p,
            size: stat.size
        }
    })
}
