import { defineConfig } from 'cypress'
import { baseConfig } from './base.config'
// import path from 'node:path'
import merge from 'lodash/merge'
import 'dotenv/config'

// require('dotenv').config({
//   path: path.resolve(__dirname, '../../.env')
// })

const port = process.env.PORT || 3001

const config = {
  e2e: {
    env: {
      ENVIRONMENT: 'local',
      KAFKA_UI_URL: 'http://localhost:8085'
    },
    baseUrl: `http://localhost:${port}`,
    retries: 0
  },
  projectId: process.env.CYPRESS_PROJECT_ID || 'local'
}

export default defineConfig(merge({}, baseConfig, config))
