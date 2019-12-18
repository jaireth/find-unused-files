const yargs = require('yargs')
const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

const parse = require('vssln-parser')

// --solution, --folder
const argv = yargs.argv

let slnPath = path.dirname(argv.solution)

let packageFolderList = fs.readdirSync(slnPath + '\\packages').map(path => { return { path, folder: true, package: 0, reference: 0 } }) // have to clone, right?

let selectMany = (array, arr = []) => {
    for (var i in array) {
        if (array[i] instanceof Array)
            arr = selectMany(array[i], arr);
        else
            arr.push(array[i]);
    }
    return arr;
}

const stream = fs.createReadStream(argv.solution)
parse(stream, solution => {
    let solutionProjectPaths = solution.projects
        .filter(project => project.path.endsWith('.csproj') || project.path.endsWith('.scproj'))
        .map(project => slnPath + '\\' + project.path) // note: the argv.folder is NOT necesary where the solution is relative to!

    for (let solutionProjectPath of solutionProjectPaths) {
        let projectPath = path.dirname(solutionProjectPath)
        let data = fs.readFileSync(solutionProjectPath)
        parser.parseString(data, function (err, result) {
            //console.log('solutionProjectPath2', solutionProjectPath)

            let references = []
            result.Project.ItemGroup.filter(itemGroup => itemGroup.Reference).forEach(itemGroup => references = references.concat(itemGroup.Reference))



            references.filter(reference => reference.HintPath && reference.HintPath.length > 0).map(reference => {
                let path = reference.HintPath[0].replace(/\.\.\\\.\.\\\.\.\\\.\.\\packages\\/g, '') // TODO: it may not start with packages...
                path = path.substring(0, path.indexOf('\\')) // just take the folder name without the rest of the path
                return path
            })
                .forEach(path => {
                    let packageFolderMatches = packageFolderList.filter(package => package.path == path)
                    if (packageFolderMatches.length == 0) {
                        packageFolderList.push({ path, folder: false, package: 0, reference: 1 })
                    } else {
                        packageFolderMatches[0].reference++
                    }
                })

            if (fs.existsSync(projectPath + '\\packages.config')) {
                data = fs.readFileSync(projectPath + '\\packages.config')
                let result = ''
                parser.parseString(data, function (err, resultXml) { // it's not an async callback no matter what that guy says parseString is sync - but requires a callback - but it doesn't return until it's done!
                    result = resultXml
                })
                result.packages.package.map(package => package.$.id + '.' + package.$.version) // map in a string array in the same format as the folders
                    .forEach(path => {
                        let packageFolderMatches = packageFolderList.filter(package => package.path == path)
                        if (packageFolderMatches.length == 0) {
                            packageFolderList.push({ path, folder: false, package: 1, reference: 0 })
                        } else {
                            packageFolderMatches[0].package++
                        }
                    })
            }
        })



    }



    packageFolderList
        .filter(package => package.package == 0 && package.reference == 0)
        //.map(package => 'rm ' + package.path + ' -Recurse -Force')
        .forEach(output => console.log(output))

})


