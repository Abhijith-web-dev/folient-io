import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { folientDb, type Project } from '../db/dexie';
import { uploadSupabaseFile } from './SupabaseClient';

/**
 * Uploads a backup of the project JSON to Supabase Storage bucket
 */
export async function backupProjectToSupabase(project: Project, userId: string): Promise<void> {
  const supabaseUrl = localStorage.getItem('supabase_url');
  const supabaseKey = localStorage.getItem('supabase_service_role_key') || localStorage.getItem('supabase_anon_key');
  const supabaseBucket = localStorage.getItem('supabase_bucket') || 'folient-media';

  if (!supabaseUrl || !supabaseKey) {
    return;
  }

  try {
    const jsonStr = JSON.stringify(project);
    const filename = `backups/${userId}/${project.id || 'new'}-portfolio.json`;
    const file = new File([jsonStr], filename, { type: 'application/json' });
    await uploadSupabaseFile(supabaseUrl, supabaseKey, supabaseBucket, file, 0, localStorage.getItem('supabase_service_role_key') || undefined);
  } catch (err) {
    console.warn("Failed to backup portfolio to Supabase:", err);
  }
}

/**
 * Syncs projects between Local IndexedDB and Firestore
 */
export async function syncProjectsWithFirestore(userId: string): Promise<void> {
  try {
    const localProjects = await folientDb.projects.toArray();
    const colRef = collection(db, 'user_portfolios');
    const q = query(colRef, where('ownerUid', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const cloudProjectsMap: Record<string, any> = {};
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      cloudProjectsMap[data.localId || docSnap.id] = { id: docSnap.id, ...data };
    });

    // 1. Sync from local to cloud
    for (const local of localProjects) {
      const cloud = cloudProjectsMap[local.id!];
      
      if (!cloud) {
        const docRef = doc(collection(db, 'user_portfolios'));
        const cloudData = {
          ...local,
          localId: local.id,
          ownerUid: userId,
          updatedAt: local.updatedAt || Date.now()
        };
        Object.keys(cloudData).forEach(key => (cloudData as any)[key] === undefined && delete (cloudData as any)[key]);
        await setDoc(docRef, cloudData);
        await backupProjectToSupabase(local, userId);
      } else if (local.updatedAt > (cloud.updatedAt || 0)) {
        const docRef = doc(db, 'user_portfolios', cloud.id);
        const cloudData = {
          ...local,
          localId: local.id,
          ownerUid: userId,
          updatedAt: local.updatedAt
        };
        Object.keys(cloudData).forEach(key => (cloudData as any)[key] === undefined && delete (cloudData as any)[key]);
        await setDoc(docRef, cloudData, { merge: true });
        await backupProjectToSupabase(local, userId);
      }
    }

    // 2. Sync from cloud to local
    for (const localId of Object.keys(cloudProjectsMap)) {
      const cloud = cloudProjectsMap[localId];
      const local = localProjects.find(p => p.id === Number(localId));

      if (!local) {
        const newLocalData = {
          ...cloud,
          id: Number(localId)
        };
        delete newLocalData.localId;
        delete newLocalData.ownerUid;
        
        await folientDb.projects.add(newLocalData);
      } else if ((cloud.updatedAt || 0) > local.updatedAt) {
        const updatedLocalData = {
          ...cloud,
          id: Number(localId)
        };
        delete updatedLocalData.localId;
        delete updatedLocalData.ownerUid;

        await folientDb.projects.put(updatedLocalData);
      }
    }
  } catch (err) {
    console.warn("Failed to sync portfolios with Firestore:", err);
  }
}

/**
 * Saves a single portfolio project to Firestore and backups to Supabase
 */
export async function syncSingleProjectToCloud(project: Project, userId: string): Promise<void> {
  try {
    const colRef = collection(db, 'user_portfolios');
    const q = query(colRef, where('ownerUid', '==', userId), where('localId', '==', project.id));
    const querySnapshot = await getDocs(q);
    
    let docRef;
    if (!querySnapshot.empty) {
      docRef = doc(db, 'user_portfolios', querySnapshot.docs[0].id);
    } else {
      docRef = doc(collection(db, 'user_portfolios'));
    }

    const cloudData = {
      ...project,
      localId: project.id,
      ownerUid: userId,
      updatedAt: project.updatedAt || Date.now()
    };
    Object.keys(cloudData).forEach(key => (cloudData as any)[key] === undefined && delete (cloudData as any)[key]);
    
    await setDoc(docRef, cloudData, { merge: true });
    await backupProjectToSupabase(project, userId);
  } catch (err) {
    console.warn("Failed to sync single project to Firestore:", err);
  }
}

/**
 * Deletes a portfolio project from Firestore
 */
export async function deleteProjectFromCloud(localId: number, userId: string): Promise<void> {
  try {
    const colRef = collection(db, 'user_portfolios');
    const q = query(colRef, where('ownerUid', '==', userId), where('localId', '==', localId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, 'user_portfolios', querySnapshot.docs[0].id));
    }
  } catch (err) {
    console.warn("Failed to delete project from Firestore:", err);
  }
}
