import type { ModelingDocument } from '~/types/modeling'

const DATABASE_NAME = 'cfdrookie-modeling'
const STORE_NAME = 'documents'

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
  })
}

export async function saveModelingDocument(document: ModelingDocument) {
  const database = await openDatabase()
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(JSON.parse(JSON.stringify(document)))
    transaction.oncomplete = () => { database.close(); resolve() }
    transaction.onerror = () => { database.close(); reject(transaction.error) }
  })
}

export async function loadModelingDocument(id: string) {
  const database = await openDatabase()
  return new Promise<ModelingDocument | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id)
    request.onsuccess = () => { database.close(); resolve(request.result ?? null) }
    request.onerror = () => { database.close(); reject(request.error) }
  })
}

export async function loadLatestModelingDocument() {
  const database = await openDatabase()
  return new Promise<ModelingDocument | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      database.close()
      const documents = request.result as ModelingDocument[]
      documents.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      resolve(documents[0] ?? null)
    }
    request.onerror = () => { database.close(); reject(request.error) }
  })
}
