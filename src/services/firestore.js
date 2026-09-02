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

function normalizeProtocol(protocol) {
  const value = String(protocol || '').trim().toUpperCase()
  const long = value.match(/^AND-(\d{4})-(\d{6})$/)
  if (long) return `AND-${long[1]}-${long[2].slice(-3)}`
  return value
}

export async function createDemandWithTracking(privateData, publicData, protocol) {
  const shortProtocol = normalizeProtocol(protocol)

  const existing = await getDoc(doc(db, 'demandas', shortProtocol))
  if (existing.exists()) {
    throw new Error('Protocolo já existente. Envie novamente para gerar outro número.')
  }

  const batch = writeBatch(db)

  batch.set(doc(db, 'demandas', shortProtocol), {
    ...privateData,
    protocolo: shortProtocol,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  batch.set(doc(db, 'acompanhamentos', shortProtocol), {
    ...publicData,
    protocolo: shortProtocol,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  await batch.commit()
}

export async function updateDemandAndTracking(protocol, privateUpdates, publicUpdates) {
  const shortProtocol = normalizeProtocol(protocol)
  const batch = writeBatch(db)

  batch.update(doc(db, 'demandas', shortProtocol), {
    ...privateUpdates,
    updatedAt: serverTimestamp()
  })

  batch.set(
    doc(db, 'acompanhamentos', shortProtocol),
    {
      ...publicUpdates,
      protocolo: shortProtocol,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )

  await batch.commit()
}

export async function getTrackingByProtocol(protocol) {
  const shortProtocol = normalizeProtocol(protocol)
  const snap = await getDoc(doc(db, 'acompanhamentos', shortProtocol))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}
