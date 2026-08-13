import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { db } from './firebase'

export function listenCollection(name, callback) {
  const q = query(collection(db, name), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    snapshot => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
    error => {
      console.error(`Erro ao ler ${name}:`, error)
      callback([])
    }
  )
}

export async function createDocument(name, data) {
  return addDoc(collection(db, name), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateDocument(name, id, data) {
  return updateDoc(doc(db, name, id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function removeDocument(name, id) {
  return deleteDoc(doc(db, name, id))
}
