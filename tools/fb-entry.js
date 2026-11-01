import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, signInAnonymously } from 'firebase/auth';
import {
  initializeFirestore, persistentLocalCache, persistentSingleTabManager,
  doc, onSnapshot, setDoc, serverTimestamp, increment, deleteField
} from 'firebase/firestore';

window.FB = {
  initializeApp, initializeAuth, indexedDBLocalPersistence, signInAnonymously,
  initializeFirestore, persistentLocalCache, persistentSingleTabManager,
  doc, onSnapshot, setDoc, serverTimestamp, increment, deleteField
};
