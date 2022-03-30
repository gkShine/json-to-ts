# Generate typescript class files from json files


## Basic Example

### package.json
```
  scripts: {
    "json-to-ts": "json-to-ts -d json"
  }
```

## Install
`npm i json-to-ts --save-dev`

## Run
1. add a script (see example package.json)
2. `npm run json-to-ts`

## Options
- `-d, -directory, REQUIRED, default [none] : json file directory`
- `-n, -className, default [#Model] : # is json file name`
- `-f, -fullmode, default [false] : with function toJSON and function fromJSON`
- `-x, -deleteFile, default [false] : deletes json file after generate`

## JSON:
Person.json
```
{
  "name": "shine",
  "age": 20,
  "height": 180
}
```

## Class:
Person.ts
```
class PersonModel {
  name: string
  age: number
  height: number

  constructor(data = { name: '', age: 0, height: 0 }) {
    this.name = data['name']
    this.age = data['age']
    this.height = data['height']
  }
}

export default FileUploadModel
```

### Fullmode Class:
Person.ts
```
class PersonModel {
  constructor( public name: string = '', public age: number = 0, public height: number = 0 ) {}

  static fromJSON(json: any) {
    if (!json) return null
    return new PersonModel( json.name, json.age, json.height )
  }

  toJSON() {
    return { name: this.name ?? '', age: this.age ?? 0, height: this.height ?? 0 }
  }
}

export default FileUploadModel
```