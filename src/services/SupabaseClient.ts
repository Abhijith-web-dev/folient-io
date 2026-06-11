/**
 * SupabaseClient.ts
 *
 * Lightweight, direct REST API wrapper for Supabase Storage buckets.
 * Eliminates the need for @supabase/supabase-js to keep compilation footprint zero.
 */

export interface SupabaseFile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

export interface SupabaseAsset {
  id: string | number;
  name: string;
  type: 'image' | 'video' | 'program' | 'document';
  format: string;
  size: string;
  url: string;
}

/**
 * Helper to construct standard headers for Supabase calls.
 */
function getHeaders(anonKey: string, contentType?: string) {
  const headers: Record<string, string> = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  };
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
}

/**
 * Automatically create a bucket in Supabase Storage.
 */
export async function createSupabaseBucket(
  url: string,
  anonKey: string,
  bucket: string
): Promise<void> {
  const cleanUrl = url.replace(/\/$/, '');
  const endpoint = `${cleanUrl}/storage/v1/bucket`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Only ignore if the bucket already exists or 409 Conflict occurred
      if (
        errorText.includes('already exists') || 
        errorText.includes('duplicate') || 
        response.status === 409
      ) {
        return;
      }
      throw new Error(`Failed to create bucket "${bucket}": ${errorText}`);
    }
  } catch (error) {
    console.error(`Error auto-provisioning bucket "${bucket}":`, error);
    throw error;
  }
}

/**
 * List files inside the configured Supabase storage bucket.
 * Automatically provisions the bucket if it does not exist.
 */
export async function listSupabaseFiles(
  url: string,
  anonKey: string,
  bucket: string,
  retryCount = 0,
  serviceRoleKey?: string
): Promise<SupabaseAsset[]> {
  const cleanUrl = url.replace(/\/$/, '');
  const endpoint = `${cleanUrl}/storage/v1/object/list/${bucket}`;

  try {
    const authKey = serviceRoleKey || anonKey;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(authKey, 'application/json'),
      body: JSON.stringify({
        prefix: '',
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Auto-create bucket if not found and retry once
      if ((errorText.includes('Bucket not found') || response.status === 404) && retryCount === 0) {
        console.warn(`Bucket "${bucket}" not found. Auto-provisioning and retrying...`);
        try {
          const authKey = serviceRoleKey || anonKey;
          await createSupabaseBucket(url, authKey, bucket);
          return await listSupabaseFiles(url, authKey, bucket, 1, serviceRoleKey);
        } catch (createErr: unknown) {
          console.error("Auto-provisioning bucket failed during listing:", createErr);
          const errMsg = createErr instanceof Error ? createErr.message : String(createErr);
          throw new Error(`Bucket "${bucket}" not found and auto-provisioning failed: ${errMsg}`, { cause: createErr });
        }
      }
      throw new Error(`Failed to list Supabase files: ${errorText}`);
    }

    const files: SupabaseFile[] = await response.json();
    return files.map((file) => {
      const ext = file.name.split('.').pop()?.toUpperCase() || '';
      let type: 'image' | 'video' | 'program' | 'document' = 'document';

      if (['PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(ext)) {
        type = 'image';
      } else if (['MP4', 'WEBM', 'MOV', 'AVI'].includes(ext)) {
        type = 'video';
      } else if (['JS', 'TS', 'HTML', 'CSS', 'JSON', 'PY', 'RS'].includes(ext)) {
        type = 'program';
      }

      const sizeKB = (file.metadata?.size || 0) / 1024;
      const sizeStr = sizeKB > 1024 
        ? `${(sizeKB / 1024).toFixed(1)} MB` 
        : `${sizeKB.toFixed(1)} KB`;

      const publicUrl = `${cleanUrl}/storage/v1/object/public/${bucket}/${file.name}`;

      return {
        id: file.id || file.name,
        name: file.name,
        type,
        format: ext,
        size: sizeStr,
        url: publicUrl
      };
    });
  } catch (error: unknown) {
    console.error('Supabase list error:', error);
    throw error;
  }
}

/**
 * Upload a local file directly into the Supabase storage bucket.
 * Automatically provisions the bucket if it does not exist.
 */
export async function uploadSupabaseFile(
  url: string,
  anonKey: string,
  bucket: string,
  file: File,
  retryCount = 0,
  serviceRoleKey?: string
): Promise<SupabaseAsset> {
  const cleanUrl = url.replace(/\/$/, '');
  const filepath = encodeURIComponent(file.name);
  const endpoint = `${cleanUrl}/storage/v1/object/${bucket}/${filepath}`;

  try {
    const authKey = serviceRoleKey || anonKey;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(authKey, file.type),
      body: file
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Auto-create bucket if not found and retry once
      if ((errorText.includes('Bucket not found') || response.status === 404) && retryCount === 0) {
        console.warn(`Bucket "${bucket}" not found. Auto-provisioning and retrying...`);
        try {
          const authKey = serviceRoleKey || anonKey;
          await createSupabaseBucket(url, authKey, bucket);
          return await uploadSupabaseFile(url, authKey, bucket, file, 1, serviceRoleKey);
        } catch (createErr: unknown) {
          console.error("Auto-provisioning bucket failed during upload:", createErr);
          const errMsg = createErr instanceof Error ? createErr.message : String(createErr);
          throw new Error(`Bucket "${bucket}" not found and auto-provisioning failed: ${errMsg}`, { cause: createErr });
        }
      }
      throw new Error(`Upload to Supabase failed: ${errorText}`);
    }

    const data = await response.json();
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    let type: 'image' | 'video' | 'program' | 'document' = 'document';

    if (['PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(ext)) {
      type = 'image';
    } else if (['MP4', 'WEBM', 'MOV', 'AVI'].includes(ext)) {
      type = 'video';
    } else if (['JS', 'TS', 'HTML', 'CSS', 'JSON', 'PY', 'RS'].includes(ext)) {
      type = 'program';
    }

    const sizeKB = file.size / 1024;
    const sizeStr = sizeKB > 1024 
      ? `${(sizeKB / 1024).toFixed(1)} MB` 
      : `${sizeKB.toFixed(1)} KB`;

    const publicUrl = `${cleanUrl}/storage/v1/object/public/${bucket}/${file.name}`;

    return {
      id: data.Key || data.id || file.name,
      name: file.name,
      type,
      format: ext,
      size: sizeStr,
      url: publicUrl
    };
  } catch (error: unknown) {
    console.error('Supabase upload error:', error);
    throw error;
  }
}

/**
 * Delete a file from the Supabase storage bucket.
 */
export async function deleteSupabaseFile(
  url: string,
  anonKey: string,
  bucket: string,
  filename: string,
  serviceRoleKey?: string
): Promise<void> {
  const cleanUrl = url.replace(/\/$/, '');
  const endpoint = `${cleanUrl}/storage/v1/object/${bucket}`;

  try {
    const authKey = serviceRoleKey || anonKey;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: getHeaders(authKey, 'application/json'),
      body: JSON.stringify({
        prefixes: [filename]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete Supabase file: ${errorText}`);
    }
  } catch (error: unknown) {
    console.error('Supabase delete error:', error);
    throw error;
  }
}
