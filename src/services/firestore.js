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

const FEATURE_FALLBACKS = new Set(['linha_do_tempo', 'mandatos_anteriores'])

function isPermissionLikeError(error) {
  const code = String(error?.code || '')
  return code.includes('permission-denied') || code.includes('failed-precondition')
}

function featurePayload(name, data) {
  return {
    ...data,
    _feature: name,
    updatedAt: serverTimestamp()
  }
}

export function listenCollection(name, callback) {
  let fallbackStop = null
  let stopped = false

  const q = query(collection(db, name), orderBy('createdAt', 'desc'))
  const primaryStop = onSnapshot(
    q,
    snapshot => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
    error => {
      console.error(`Erro ao ler ${name}:`, error)

      if (FEATURE_FALLBACKS.has(name) && isPermissionLikeError(error)) {
        const fallbackQuery = query(collection(db, 'acoes'), orderBy('createdAt', 'desc'))
        fallbackStop = onSnapshot(
          fallbackQuery,
          snapshot => {
            if (stopped) return
            const items = snapshot.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(item => item._feature === name)
            callback(items)
          },
          fallbackError => {
            console.error(`Erro ao ler fallback de ${name}:`, fallbackError)
            if (!stopped) callback([])
          }
        )
        return
      }

      callback([])
    }
  )

  return () => {
    stopped = true
    try { primaryStop?.() } catch {}
    try { fallbackStop?.() } catch {}
  }
}

export async function createDocument(name, data) {
  try {
    return await addDoc(collection(db, name), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    if (!FEATURE_FALLBACKS.has(name) || !isPermissionLikeError(error)) throw error

    return addDoc(collection(db, 'acoes'), {
      ...featurePayload(name, data),
      createdAt: serverTimestamp()
    })
  }
}

export async function updateDocument(name, id, data) {
  try {
    return await updateDoc(doc(db, name, id), {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    if (!FEATURE_FALLBACKS.has(name) || !isPermissionLikeError(error)) throw error

    return updateDoc(doc(db, 'acoes', id), featurePayload(name, data))
  }
}

export async function removeDocument(name, id) {
  try {
    return await deleteDoc(doc(db, name, id))
  } catch (error) {
    if (!FEATURE_FALLBACKS.has(name) || !isPermissionLikeError(error)) throw error
    return deleteDoc(doc(db, 'acoes', id))
  }
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
