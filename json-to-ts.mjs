#!/usr/bin/env node
import fs from 'node:fs'
import { glob } from 'glob'
import path from 'node:path'
import minimist from 'minimist'

class JsonToClass {
  constructor (config) {
    this.config = config
  }
  run() {
    const { basePath } = this.config
    glob(`${basePath}/**/*.json`, {}).then((files) => {
      files.forEach(f => this.generate(f, fs.readFileSync(f, 'utf8')))
    })
  }
  generate(filepath, content) {
    const json = JSON.parse(content)
    const name = this.getClassName(filepath)
    let classContent = `class ${name} {\n`
    for(const [key, val] of Object.entries(json)) {
      classContent += `  ${this.getField(key)}: ${this.getType(val)}\n`
    }
    classContent += `\n  constructor(data = ${this.getDefault(json)}) {\n`
    classContent += this.init(json)
    classContent += '  }\n'
    classContent += '}\n'
    classContent += `\nexport default ${name}\n`
    this.generateFile(filepath, classContent)
  }
  generateFile(filepath, content) {
    fs.writeFileSync(filepath.replace(/json$/, 'ts'), content)
    if (this.config.clear) {
      fs.unlinkSync(filepath)
    }
  }
  init(json) {
    let init = ''
    for(const key in json) {
      init += `    this.${this.getField(key)} = data['${key}']\n`
    }
    return init
  }
  getClassName(filepath) {
    return this.config.className.replace('#', path.basename(filepath, '.json'))
  }
  getField(key) {
    return key.replace(/\_(\w)/g, (all, letter) => {
      return letter.toUpperCase();
    })
  }
  getType(val) {
    if (Array.isArray(val)) {
      return this.getType(val[0]) + '[]'
    } else {
      const type = typeof val
      return type === 'object' ? 'any' : type
    }
  }
  getDefault(json) {
    let obj = '{'
    for(const [key, val] of Object.entries(json)) {
      obj += ` ${key}: ${this.getDefaultValue(this.getType(val))},`
    }
    obj = obj.replace(/,$/, ' ')
    obj += '}'
    return obj
  }
  getDefaultValue(type) {
    switch (type) {
      case 'number':
        return 0
      case 'string':
        return "''"
      case 'boolean':
        return false
      default:
        if (type.includes('[]')) {
          return '[]'
        }
        return '{}'
    }
  }
}

class JsonToClass2 extends JsonToClass {
  generate(filepath, content) {
    const json = JSON.parse(content)
    const name = this.getClassName(filepath)
    let classContent = `class ${name} {\n`
    classContent += `  constructor(${this.getDefault(json)}) {}\n`
    classContent += `\n  static fromJSON(json: any): ${name} {\n`
    classContent += `    return new ${name}(${Object.keys(json).map(k => `json.${k},`).join(' ').replace(/,$/, '')})\n`
    classContent += '  }\n'
    classContent += '\n  toJSON() {\n'
    classContent += `    return { ${this.getToMap(json)} }\n`
    classContent += '  }\n'
    classContent += '}\n'
    classContent += `\nexport default ${name}\n`
    super.generateFile(filepath, classContent)
  }
  getDefault(json) {
    let obj = ''
    for(const [key, val] of Object.entries(json)) {
      const type = this.getType(val)
      obj += ` public ${this.getField(key)}: ${type} = ${this.getDefaultValue(type)},`
    }
    obj = obj.replace(/,$/, '')
    return obj.trim()
  }
  getToMap(json) {
    let obj = ''
    for(const [key, val] of Object.entries(json)) {
      obj += `${key}: this.${this.getField(key)} ?? ${this.getDefaultValue(this.getType(val))}, `
    }
    obj = obj.trim().replace(/,$/, '')
    return obj
  }
}

const argv = minimist(process.argv.slice(2))
const para = {
  basePath: argv.d || './',
  className: argv.n || '#Model',
  clear: argv.x || false
}
if (argv.f) {
  new JsonToClass2(para).run()
} else {
  new JsonToClass(para).run()
}
