function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === 'object' && value !== null && !Array.isArray(value)
}

interface StoredTask {
   id: number
   focus: boolean
   text: string
   done: boolean
   size: number
   impact: number
   indentation: number
   [key: string]: unknown
}

export function isTaskList(value: unknown): value is StoredTask[] {
   return (
      Array.isArray(value) &&
      value.every(
         task =>
            isRecord(task) &&
            Number.isFinite(task.id) &&
            typeof task.focus === 'boolean' &&
            typeof task.text === 'string' &&
            typeof task.done === 'boolean' &&
            Number.isFinite(task.size) &&
            Number.isFinite(task.impact) &&
            Number.isFinite(task.indentation)
      )
   )
}

export function isSheetNameList(value: unknown): value is string[] {
   return (
      Array.isArray(value) &&
      value.every(name => typeof name === 'string' && name.trim().length > 0) &&
      new Set(value).size === value.length
   )
}

function storageError(action: string, key: string, error: unknown): Error {
   const reason = error instanceof Error ? error.message : String(error)
   const subject = action === 'save' ? 'data' : 'saved data'
   return new Error(`Could not ${action} ${subject} "${key}": ${reason}`)
}

export function readStoredJson<T>(
   storage: Storage,
   key: string,
   fallback: T,
   validate: (value: unknown) => value is T
): T {
   let serialized: string | null
   try {
      serialized = storage.getItem(key)
   } catch (error) {
      throw storageError('read', key, error)
   }
   if (serialized === null) return fallback

   let value: unknown
   try {
      value = JSON.parse(serialized)
   } catch (error) {
      throw storageError('parse', key, error)
   }
   if (!validate(value)) {
      throw new Error(`Could not load saved data "${key}": its format is invalid.`)
   }
   return value
}

export function writeStoredJson(storage: Storage, key: string, value: unknown): void {
   try {
      storage.setItem(key, JSON.stringify(value))
   } catch (error) {
      throw storageError('save', key, error)
   }
}

export function readStoredValue(storage: Storage, key: string): string | null {
   try {
      return storage.getItem(key)
   } catch (error) {
      throw storageError('read', key, error)
   }
}

export function writeStoredValue(storage: Storage, key: string, value: string): void {
   try {
      storage.setItem(key, value)
   } catch (error) {
      throw storageError('save', key, error)
   }
}

export function removeStoredValue(storage: Storage, key: string): void {
   try {
      storage.removeItem(key)
   } catch (error) {
      throw storageError('remove', key, error)
   }
}
