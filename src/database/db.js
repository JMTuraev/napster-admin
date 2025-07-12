import Database from 'better-sqlite3'
import { join, existsSync, mkdirSync } from 'path'
import { existsSync as fsExistsSync, mkdirSync as fsMkdirSync } from 'fs'

const dbDir = join(process.cwd(), 'data')
if (!fsExistsSync(dbDir)) fsMkdirSync(dbDir, { recursive: true })
const dbPath = join(dbDir, 'napster.db')
export const db = new Database(dbPath)
