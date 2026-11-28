// Supabase Edge Function: cloudinary-sign
//
// Keeps Cloudinary secrets strictly in server-side Edge Function Secrets
// (NEVER in SQL queries, database tables, or client-side .env files).
//
// Required Secret (Supabase Dashboard -> Edge Functions -> Secrets):
//   CLOUDINARY_URL = cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>
//   (Or individual secrets: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
//
// Auto-injected by Supabase Runtime:
//   SUPABASE_URL, SUPABASE_ANON_KEY

const ALLOWED_ORIGINS = new Set([
  'https://erongeronimo.vercel.app',
  'https://portfolio-geronimo.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || ''
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://erongeronimo.vercel.app'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

const ALLOWED_FOLDERS = new Set([
  'media/profile',
  'media/resume',
  'media/project_thumbnails',
  'media/project_images',
  'media/project_videos',
  'media/certificates',
  'media/skill_icons',
  'media/theme_backgrounds',
])

const ALLOWED_RESOURCE_TYPES = new Set(['image', 'video', 'raw'])

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  })
}

function getCloudinaryCredentials() {
  const url = (Deno.env.get('CLOUDINARY_URL') || '').trim()
  if (url) {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/\s]+)$/)
    if (match) {
      return {
        apiKey: match[1],
        apiSecret: match[2],
        cloudName: match[3],
      }
    }
  }

  const cloudName = (Deno.env.get('CLOUDINARY_CLOUD_NAME') || '').trim()
  const apiKey = (Deno.env.get('CLOUDINARY_API_KEY') || '').trim()
  const apiSecret = (Deno.env.get('CLOUDINARY_API_SECRET') || '').trim()

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret }
  }
  return null
}

async function sha1Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false

  const supabaseUrl = (Deno.env.get('SUPABASE_URL') || '').replace(/\/+$/, '')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  if (!supabaseUrl || !supabaseAnonKey) return false

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/check_is_admin`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })

  if (!res.ok) return false
  const isAdmin = await res.json().catch(() => false)
  return isAdmin === true
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  if (req.method !== 'POST') {
    return jsonResponse(req, { error: 'Method not allowed' }, 405)
  }

  try {
    const isAdmin = await verifyAdmin(req.headers.get('Authorization'))
    if (!isAdmin) {
      return jsonResponse(req, { error: 'Forbidden: admin authentication required.' }, 403)
    }

    const creds = getCloudinaryCredentials()
    if (!creds) {
      return jsonResponse(
        req,
        { error: 'Server misconfiguration: set CLOUDINARY_URL in Supabase Edge Function Secrets.' },
        500
      )
    }

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || 'upload')
    const timestamp = Math.floor(Date.now() / 1000)

    // ── Action 1: Sign a direct browser upload ───────────────────────────────
    if (action === 'upload') {
      const folder = String(body?.folder || '')
      const publicId = body?.public_id ? String(body.public_id) : ''

      if (!ALLOWED_FOLDERS.has(folder)) {
        return jsonResponse(req, { error: `Invalid upload folder: ${folder}` }, 400)
      }
      if (publicId && !/^[A-Za-z0-9._-]+$/.test(publicId)) {
        return jsonResponse(req, { error: 'Invalid public_id format.' }, 400)
      }

      // Cloudinary requires signed parameters sorted alphabetically
      const toSign = publicId
        ? `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${creds.apiSecret}`
        : `folder=${folder}&timestamp=${timestamp}${creds.apiSecret}`

      const signature = await sha1Hex(toSign)

      return jsonResponse(req, {
        cloud_name: creds.cloudName,
        api_key: creds.apiKey,
        folder,
        public_id: publicId || null,
        timestamp,
        signature,
      })
    }

    // ── Action 2: Destroy an asset server-side ───────────────────────────────
    if (action === 'destroy') {
      const publicId = String(body?.public_id || '')
      const resourceType = String(body?.resource_type || 'image')

      if (!publicId || !/^[A-Za-z0-9._/-]+$/.test(publicId) || publicId.includes('..')) {
        return jsonResponse(req, { error: 'Invalid public_id.' }, 400)
      }
      if (!ALLOWED_RESOURCE_TYPES.has(resourceType)) {
        return jsonResponse(req, { error: 'Invalid resource_type.' }, 400)
      }

      const signature = await sha1Hex(
        `public_id=${publicId}&timestamp=${timestamp}${creds.apiSecret}`
      )

      const fd = new FormData()
      fd.append('public_id', publicId)
      fd.append('api_key', creds.apiKey)
      fd.append('timestamp', String(timestamp))
      fd.append('signature', signature)

      const destroyRes = await fetch(
        `https://api.cloudinary.com/v1_1/${creds.cloudName}/${resourceType}/destroy`,
        { method: 'POST', body: fd }
      )
      const destroyJson = await destroyRes.json().catch(() => ({}))

      return jsonResponse(
        req,
        { result: destroyJson?.result || 'unknown' },
        destroyRes.ok ? 200 : destroyRes.status
      )
    }

    return jsonResponse(req, { error: `Unsupported action: ${action}` }, 400)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return jsonResponse(req, { error: message }, 500)
  }
})
