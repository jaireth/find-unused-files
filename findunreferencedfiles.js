const yargs = require('yargs')
const fs = require('fs')
const path = require('path')

const xml2js = require('xml2js')
const parser = new xml2js.Parser()

const parse = require('vssln-parser')

const recursive = require("recursive-readdir")


// --solution, --folder
const argv = yargs.argv

let slnPath = path.dirname(argv.solution)

let ignoredExt = ['.user', '.pubxml','.vspscc']

// let projectList = recFindByExt(slnPath, 'csproj')

// let tdsProjectList = recFindByExt(slnPath, 'scproj')

const stream = fs.createReadStream(argv.solution)
parse(stream, solution => {
    let solutionProjectPaths = solution.projects
        .filter(project => project.path.endsWith('.csproj') || project.path.endsWith('.scproj'))
        .map(project => slnPath + '\\' + project.path) // note: the argv.folder is NOT necesary where the solution is relative to!

    // let uknownProjectList = projectList.filter(projectPath =>  !solutionProjectPaths.includes(projectPath))
    // let uknownTdsProjectList = tdsProjectList.filter(projectPath =>  !solutionProjectPaths.includes(projectPath))

    // console.log('uknownProjectList', uknownProjectList)
    // console.log('uknownTdsProjectList', uknownTdsProjectList)
    //console.log(solution.projects.map(pr => pr.path))
    for (let solutionProjectPath of solutionProjectPaths) {
        let projectPath = path.dirname(solutionProjectPath)

        let ignoreFunc = function (file, stats) {
            // `file` is the path to the file, and `stats` is an `fs.Stats`
            // object returned from `fs.lstat()`.
            if (file == solutionProjectPath) return true // don't include the project file itself doh
            if (ignoredExt.includes(path.extname(file))) return true
            if (file.startsWith(projectPath + '\\bin')) return true
            if (file.startsWith(projectPath + '\\obj')) return true

            return false
            //return stats.isDirectory() && path.basename(file) == "test";
        }
        recursive(projectPath, [ignoreFunc], function (err, filePaths) {
            //let filePaths = readDirectorySynchronously(projectPath)


            fs.readFile(solutionProjectPath, function (err, data) {
                parser.parseString(data, function (err, result) {

                    let projectFiles = result.Project.ItemGroup
                        .filter(itemGroup => itemGroup.SitecoreItem || itemGroup.Compile || itemGroup.Content || itemGroup.None)
                        .map(itemGroup => {
                            return [].concat(
                                itemGroup.Compile ? itemGroup.Compile.map(c => c.$.Include) : [],
                                itemGroup.Content ? itemGroup.Content.map(c => c.$.Include) : [],
                                itemGroup.None ? itemGroup.None.map(c => c.$.Include) : [],
                                itemGroup.SitecoreItem ? itemGroup.SitecoreItem.map(c => c.$.Include) : []
                            )
                        })

                    projectFilePaths = [].concat.apply([], projectFiles).map(file => projectPath + '\\' + file) // flattening the array (hack)


                    let unknownFiles = filePaths.filter(projectPath => !projectFilePaths.includes(projectPath))


                    if (unknownFiles.length > 0) {
                        console.log('Project: ' + solutionProjectPath)
                        console.log('Files: ')
                        console.log(unknownFiles.map(file => file.replace(projectPath, '')))
                        console.log('')
                    }
                })
            })
            //let fileList = readDirectorySynchronously(slnPath, '')
            //console.log(fileList.length)



            //return // just first project, for test
        })
    }
})


//Belden.sln

