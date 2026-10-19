import { isSheetNameList, readStoredJson, readStoredValue, writeStoredValue } from './storage'

export const STORAGE_SCHEMA_VERSION = 1
export const STORAGE_SCHEMA_VERSION_KEY = 'App.StorageVersion'

/** Marks the original unversioned layout as schema 1 without rewriting task data. */
export function migrateStorage(storage: Storage): void {
   const rawVersion = readStoredValue(storage, STORAGE_SCHEMA_VERSION_KEY)
   if (rawVersion !== null) {
      let version: unknown
      try {
         version = JSON.parse(rawVersion)
      } catch {
         throw new Error('Saved data has an invalid storage version. Import a backup to recover it.')
      }
      if (!Number.isInteger(version) || (version as number) < 0) {
         throw new Error('Saved data has an invalid storage version. Import a backup to recover it.')
      }
      if ((version as number) > STORAGE_SCHEMA_VERSION) {
         throw new Error(
            `Saved data uses a newer schema (version ${version}) than this app supports (version ${STORAGE_SCHEMA_VERSION}). Import a backup from a compatible app version to recover your plans.`
         )
      }
      if (version === STORAGE_SCHEMA_VERSION) return
   }

   const planNames = readStoredJson(storage, 'App.Sheets', [], isSheetNameList)
   // Schema 1 keeps the existing per-list keys and task shape. Task payloads
   // remain validated by their normal loader so one bad list cannot hide plans.
   writeStoredValue(storage, STORAGE_SCHEMA_VERSION_KEY, JSON.stringify(STORAGE_SCHEMA_VERSION))
}
