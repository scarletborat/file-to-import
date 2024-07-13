import fs from 'node:fs/promises'
import path from 'node:path'

const createVarName = (name, separator = '-') => {
  const capitalize = str => str.substring(0, 1).toUpperCase() + str.substring(1)
  const tokens = name.split(separator)
  const nameTail = tokens.slice(1).map(token => capitalize(token)).join('')
  const varName = `${tokens[0]}${nameTail}`
  return varName
}

const createImport = (file, basePath) => {
  const { name } = path.parse(file)
  const varName = createVarName(name)
  const relativePath = basePath ? file.replace(basePath, '') : file
  const normalizedPath = path.normalize(relativePath)
  const importStr = `import ${varName} from '~${normalizedPath}';`
  return importStr
}

const walkDirectory = async (dir, callback) => {
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
          await walkDirectory(fullPath, callback);
      } else {
          await callback(fullPath);
      }
  }
}

const createActionHandler = (basePath, result = []) => ({
  getResult: () => result,
  create: (file) => {
    result.push(createImport(file, basePath))
  }
})

const [dir, basePath] = process.argv.slice(2)
const action = createActionHandler(basePath)
await walkDirectory(dir, action.create)
console.log(action.getResult().join('\n'))
