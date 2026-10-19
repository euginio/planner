import {
   isTaskList,
   readStoredJson,
   readStoredValue,
   removeStoredValue,
   writeStoredValue,
} from './storage'

export const BACKUP_FORMAT = 'daymark-backup'
export const BACKUP_VERSION = 1
const SHEETS_STORAGE_KEY = 'App.Sheets'

interface BackupTask {
   id: number
   focus: boolean
   text: string
   done: boolean
   size: number
   impact: number
   indentation: number
   [key: string]: unknown
}

export interface BackupPlan {
   name: string
   lists: Record<string, BackupTask[]>
}

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBackupTask(value: unknown): value is BackupTask {
   if (!isRecord(value)) return false
   return (
      Number.isFinite(value.id) &&
      typeof value.focus === 'boolean' &&
      typeof value.text === 'string' &&
      typeof value.done === 'boolean' &&
      Number.isFinite(value.size) &&
      Number.isFinite(value.impact) &&
      Number.isFinite(value.indentation)
   )
}

function parseTaskList(value: unknown, context: string): BackupTask[] {
   if (!Array.isArray(value) || !value.every(isBackupTask)) {
      throw new Error(`${context} must contain a valid task list.`)
   }
   if (new Set(value.map(task => task.id)).size !== value.length) {
      throw new Error(`${context} must not contain duplicate task IDs.`)
   }
   return value
}

export function createBackup(
   storage: Storage,
   sheetNames: string[],
   listNames: string[]
): string {
   const plans: BackupPlan[] = sheetNames.map(name => ({
      name,
      lists: Object.fromEntries(
         listNames.map(listName => {
            const storageKey = `${name}.${listName}`
            const tasks = readStoredJson(storage, storageKey, [], isTaskList)
            return [listName, tasks]
         })
      ),
   }))

   return JSON.stringify(
      {
         format: BACKUP_FORMAT,
         version: BACKUP_VERSION,
         exportedAt: new Date().toISOString(),
         plans,
      },
      null,
      2
   )
}

function parseBackup(content: string, listNames: string[]): BackupPlan[] {
   let parsed: unknown
   try {
      parsed = JSON.parse(content)
   } catch {
      throw new Error('The selected file is not valid JSON.')
   }

   if (
      !isRecord(parsed) ||
      parsed.format !== BACKUP_FORMAT ||
      parsed.version !== BACKUP_VERSION ||
      !Array.isArray(parsed.plans)
   ) {
      throw new Error('This is not a supported Daymark backup file.')
   }

   const seenNames = new Set<string>()
   return parsed.plans.map((plan, index) => {
      if (!isRecord(plan) || typeof plan.name !== 'string' || !plan.name.trim()) {
         throw new Error(`Plan ${index + 1} must have a non-empty name.`)
      }
      if (seenNames.has(plan.name)) {
         throw new Error(`The backup contains duplicate plan name "${plan.name}".`)
      }
      seenNames.add(plan.name)

      const planLists = plan.lists
      if (!isRecord(planLists)) {
         throw new Error(`Plan "${plan.name}" does not contain task lists.`)
      }

      const unknownLists = Object.keys(planLists).filter(name => !listNames.includes(name))
      if (unknownLists.length) {
         throw new Error(
            `Plan "${plan.name}" contains unsupported list "${unknownLists[0]}".`
         )
      }
      const missingLists = listNames.filter(
         name => !Object.prototype.hasOwnProperty.call(planLists, name)
      )
      if (missingLists.length) {
         throw new Error(`Plan "${plan.name}" is missing task list "${missingLists[0]}".`)
      }

      const lists = Object.fromEntries(
         listNames.map(listName => [
            listName,
            parseTaskList(planLists[listName], `Plan "${plan.name}", list "${listName}"`),
         ])
      )
      return { name: plan.name, lists }
   })
}

export function importBackup(
   content: string,
   storage: Storage,
   currentSheetNames: string[],
   listNames: string[]
): string[] {
   const plans = parseBackup(content, listNames)
   const sheetNames = [...currentSheetNames]
   for (const plan of plans) {
      if (!sheetNames.includes(plan.name)) sheetNames.push(plan.name)
   }

   const storageKeys = [
      SHEETS_STORAGE_KEY,
      ...plans.flatMap(plan => listNames.map(listName => `${plan.name}.${listName}`)),
   ]
   const originalValues = new Map(storageKeys.map(key => [key, readStoredValue(storage, key)]))

   try {
      for (const plan of plans) {
         for (const listName of listNames) {
            writeStoredValue(
               storage,
               `${plan.name}.${listName}`,
               JSON.stringify(plan.lists[listName])
            )
         }
      }
      writeStoredValue(storage, SHEETS_STORAGE_KEY, JSON.stringify(sheetNames))
   } catch (error) {
      const rollbackErrors: unknown[] = []
      for (const [key, originalValue] of originalValues) {
         try {
            if (originalValue === null) removeStoredValue(storage, key)
            else writeStoredValue(storage, key, originalValue)
         } catch (rollbackError) {
            rollbackErrors.push(rollbackError)
         }
      }

      const message =
         error instanceof Error ? error.message : 'An unknown storage error occurred.'
      if (rollbackErrors.length) {
         throw new Error(`Import failed: ${message} Stored data could not be fully restored.`)
      }
      throw new Error(`Import failed: ${message}`)
   }

   return sheetNames
}
