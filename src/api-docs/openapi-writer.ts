import fs from 'node:fs'
import path from 'node:path'
import { stringify } from 'yaml'
import { openApiDoc } from './openapi-generator'

// Genereate OpenApi docs with Zod

// convert OpenApi document to YAML
const yamlDoc = stringify(openApiDoc)

const scriptDir = path.resolve(__dirname)
// write the YAML file
fs.writeFileSync(`${scriptDir}/openapi.yaml`, yamlDoc) // See if this works, might use path.join

console.log('OpenAPI document generated in YAML format')

// JSON version
const jsonDoc = JSON.stringify(openApiDoc, null, 2)

// write the JSON file
fs.writeFileSync(`${scriptDir}/openapi.json`, jsonDoc)

console.log('OpenAPI document generated in JSON format')
