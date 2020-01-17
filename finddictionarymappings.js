const yargs = require('yargs')
const fs = require('fs')
var path = require('path')

var parse = require('vssln-parser')
const axios = require('axios')



// --solution, --folder
const argv = yargs.argv


let recFindByExt = function (base, ext, files, result) {
    files = files || fs.readdirSync(base)
    result = result || []

    files.forEach(
        function (file) {
            var newbase = path.join(base, file)
            if (fs.statSync(newbase).isDirectory()) {
                result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result)
            }
            else {
                if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
                    result.push(newbase)
                }
            }
        }
    )
    return result
}

let dictionaryNamespace = argv.namespace;
let pattern = '@Translate\\.TextByDomain\\("' + dictionaryNamespace + '", ?"(.*?)"\\)'

var regex = new RegExp(pattern, 'g')

let slnPath = path.dirname(argv.solution)

let cshtmlFileList = recFindByExt(slnPath, 'cshtml')
cshtmlFileList = cshtmlFileList.filter((file) => {
    if (file.indexOf('\\bin') > -1) return false
    if (file.indexOf('\\obj') > -1) return false
    return true
})



for (let cshtmlFile of cshtmlFileList) {
    fs.readFile(cshtmlFile, 'utf8', function (err, cshtml) {

        let match

        let matches = []
        while (match = regex.exec(cshtml)) {
            matches.push(match[1])
        }

        if (matches.length > 0) {
            let last = cshtmlFile.lastIndexOf('\\') + 1
            let component = cshtmlFile.substr(last, cshtmlFile.length - last - 7)
            console.log(component)
            matches.forEach(m => {
                //axios(window.location.origin + '/sitecore/api/ssc/item/' + itemId + '?IncludeStandardTemplateFields=true')
                if (m.indexOf('.') > -1) {
                    console.log('\t' + m.replace('.', '/'))
                } else {
                    console.log('\t' + 'Common/' + m)
                }
            })

        }
        //let matches = cshtml.match(regex)
        //if (matches && matches.length > 1) {
        //}
    })


}
