const fs = require('node:fs/promises')
const path = require('node:path')

const listFiles = (dirPath) => {
  const absoluteDirPath = path.join(__dirname, dirPath)
  return fs.readdir(absoluteDirPath)
}

const getOnlyFiles = (filesList) => {
  const regex = /^[^<>:"/\\|?*\x00-\x1F]+(\.[a-zA-Z0-9]+)$/;
  return filesList.filter(fileName => regex.test(fileName))
}

const createVarName = (name, separator = '-') => {
  const capitalize = str => str.substring(0, 1).toUpperCase() + str.substring(1)
  const tokens = name.split(separator)
  const nameTail = tokens.slice(1).map(token => capitalize(token)).join('')
  const varName = `${tokens[0]}${nameTail}`
  return varName
}

const generateImport = (varName, path, fileName) => `import ${varName} from ~/${path}${fileName};`

const createImports = (files, filePath) => {
  const result = []
  for (const file of files) {
    const { name } = path.parse(file)
    const varName = createVarName(name)
    const importStr = generateImport(varName, filePath, file)
    result.push(importStr)
  }
  return result
}

(async function() {
  const [dir, basePath] = process.argv.slice(2)
  const filePath = basePath
    ? dir.replace(basePath, '')
    : dir
  let files = await listFiles(dir)
  files = getOnlyFiles(files)
  const result = createImports(files, filePath)
  console.log(result.join('\n'))
})()
