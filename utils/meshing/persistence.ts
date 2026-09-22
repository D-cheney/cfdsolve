import type { MeshProject } from '~/types/meshing'

const DATABASE_NAME = 'cfdrookie-meshing'
const STORE_NAME = 'projects'

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'documentId' })
    }
    request.onsuccess = () => resolve(request.result)
  })
}

export async function saveMeshProject(project: MeshProject) {
  const database = await openDatabase()
  const value = JSON.parse(JSON.stringify(project))
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(value)
    transaction.oncomplete = () => { database.close(); resolve() }
    transaction.onerror = () => { database.close(); reject(transaction.error) }
  })
}

export async function loadMeshProject(documentId: string) {
  const database = await openDatabase()
  return new Promise<MeshProject | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(documentId)
    request.onsuccess = () => { database.close(); resolve(request.result ?? null) }
    request.onerror = () => { database.close(); reject(request.error) }
  })
}
