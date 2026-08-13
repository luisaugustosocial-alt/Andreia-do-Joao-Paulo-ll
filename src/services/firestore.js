import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
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

export async function createDemandWithTracking(privateData, publicData, protocol) {
  const batch = writeBatch(db)

  batch.set(doc(db, 'demandas', protocol), {
    ...privateData,
    protocolo: protocol,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  batch.set(doc(db, 'acompanhamentos', protocol), {
    ...publicData,
    protocolo: protocol,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  await batch.commit()
}

export async function updateDemandAndTracking(protocol, privateUpdates, publicUpdates) {
  const batch = writeBatch(db)

  batch.update(doc(db, 'demandas', protocol), {
    ...privateUpdates,
    updatedAt: serverTimestamp()
  })

  batch.set(
    doc(db, 'acompanhamentos', protocol),
    {
      ...publicUpdates,
      protocolo: protocol,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )

  await batch.commit()
}

export async function getTrackingByProtocol(protocol) {
  const snap = await getDoc(doc(db, 'acompanhamentos', protocol))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}
