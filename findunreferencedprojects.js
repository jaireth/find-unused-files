const yargs = require('yargs')
const fs = require('fs')
var path = require('path')

var parse = require('vssln-parser')

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
// TODO: Find all .scproj and compare to the solution!

let slnPath = path.dirname(argv.solution)

let projectList = recFindByExt(slnPath, 'csproj')

let tdsProjectList = recFindByExt(slnPath, 'scproj')

const stream = fs.createReadStream(argv.solution)
parse(stream, solution => {
    let solutionProjectPaths = solution.projects.map(project => slnPath + '\\' + project.path) // note: the argv.folder is NOT necesary where the solution is relative to!
    let uknownProjectList = projectList.filter(projectPath =>  !solutionProjectPaths.includes(projectPath))
    let uknownTdsProjectList = tdsProjectList.filter(projectPath =>  !solutionProjectPaths.includes(projectPath))
    
    console.log('uknownProjectList', uknownProjectList)
    console.log('uknownTdsProjectList', uknownTdsProjectList)

    // for (let project of solution.projects) {
    //     project.path
    // }
})


//Belden.sln

