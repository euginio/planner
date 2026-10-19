import { readStoredValue, removeStoredValue, writeStoredValue } from './storage'

export const PLAN_NAMES_STORAGE_KEY = 'App.Sheets'

function restoreValues(storage: Storage, values: Map<string, string | null>): unknown[] {
   const errors: unknown[] = []
   for (const [key, value] of values) {
      try {
         if (value === null) removeStoredValue(storage, key)
         else writeStoredValue(storage, key, value)
      } catch (error) {
         errors.push(error)
      }
   }
   return errors
}

/** Removes a plan and all its list data as one recoverable storage operation. */
export function deletePlan(
   storage: Storage,
   planName: string,
   currentPlanNames: string[],
   listNames: string[]
): string[] {
   if (!currentPlanNames.includes(planName)) return currentPlanNames

   const updatedPlanNames = currentPlanNames.filter(name => name !== planName)
   const keys = [PLAN_NAMES_STORAGE_KEY, ...listNames.map(name => `${planName}.${name}`)]
   const originalValues = new Map(keys.map(key => [key, readStoredValue(storage, key)]))

   try {
      for (const listName of listNames) {
         removeStoredValue(storage, `${planName}.${listName}`)
      }
      writeStoredValue(storage, PLAN_NAMES_STORAGE_KEY, JSON.stringify(updatedPlanNames))
   } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const rollbackErrors = restoreValues(storage, originalValues)
      if (rollbackErrors.length) {
         throw new Error(`Could not delete plan: ${message} Saved data could not be fully restored.`)
      }
      throw new Error(`Could not delete plan: ${message}`)
   }

   return updatedPlanNames
}
