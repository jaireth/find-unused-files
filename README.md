# find-unused-files

A few utilities for getting reports for sitecore projects. 

Please note that the .gitignore will ignore files that start with "test"

## findunreferencedprojects.js
This finds projects that are in the file system but not in the the solution.

Usage: node findunreferencedprojects.js --solution C:\PATH\SOLUTION.sln

## findunreferencedfiles.js
This finds files in the projects that are in the file system but not in the the project. It has a bunch of extensions ignored(in the ignoredExt array)

Usage: node findunreferencedfiles.js --solution C:\PATH\SOLUTION.sln

## findunusedpackagedirectories.js
This compares three things for Nuget packages and then outputs an array of differences.

Usage: node findunusedpackagedirectories.js --solution C:\PATH\SOLUTION.sln

Output: an array with the following structure:
{ path, folder: true, package: 1, reference: 0 }

path: the assembly folder name. e.g. System.Runtime.4.3.0
folder: does it have a folder under packages
package: the number of projects with this folder in its packages.config
reference: the number of projects with this folder referenced in its project file

You can commment out ".map(package => 'rm ' + package.path + ' -Recurse -Force')" to map different command lines and output them to a file with '>'

I used this to clean my packages folder. But it can be used to find missing folders (a folder: false) or similar

## finddictionarymappings.js
Finds all the dictionary items used in cshtml files

Usage: node finddictionarymappings.js --solution C:\PATH\SOLUTION.sln --namespace namespace

Output: a file with a line for each component and then the dictionary items tabbed.

Pleases note the following:
- unlike other scripts here, it doesn't read from the sln/csproj files but from the directories directly.
- in assumes that your Dictionary folders are in folders that match your key prefixes (e.g. Forms.City is in Forms/City)

