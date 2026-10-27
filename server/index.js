import { createServer } from 'node:http'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const databaseFile = resolve(process.env.DATABASE_FILE || join(root, 'data', 'users.json'))
const distDirectory = join(root, 'dist')
let writeQueue = Promise.resolve()

async function readUsers() {
  try {
    return JSON.parse(await readFile(databaseFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(dirname(databaseFile), { recursive: true })
    await writeFile(databaseFile, '[]\n', 'utf8')
    return []
  }
}

function updateUsers(update) {
  const operation = writeQueue.then(async () => {
    const users = await readUsers()
    const result = await update(users)
    if (!result.error && result.changed) {
      await mkdir(dirname(databaseFile), { recursive: true })
      const temporaryFile = `${databaseFile}.${randomUUID()}.tmp`
      await writeFile(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, 'utf8')
      await rename(temporaryFile, databaseFile)
    }
    return result
  })
  writeQueue = operation.catch(() => {})
  return operation
}

async function readBody(request) {
  const chunks = []
  let length = 0
  for await (const chunk of request) {
    length += chunk.length
    if (length > 1_000_000) throw Object.assign(new Error('Запит завеликий.'), { status: 413 })
    chunks.push(chunk)
  }
  if (!length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Некоректний JSON.'), { status: 400 })
  }
}

function respond(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(value))
}

async function handleApi(request, response, pathname) {
  if (pathname === '/api/users' && request.method === 'GET') {
    return respond(response, 200, await readUsers())
  }

  if (pathname === '/api/users' && request.method === 'POST') {
    const body = await readBody(request)
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 50) return respond(response, 400, { error: 'Вкажіть ім’я до 50 символів.' })
    const result = await updateUsers((users) => {
      const user = { id: randomUUID(), name, createdAt: new Date().toISOString(), tasks: [] }
      users.push(user)
      return { changed: true, value: user }
    })
    return respond(response, 201, result.value)
  }

  const userPath = pathname.match(/^\/api\/users\/([^/]+)$/)
  if (userPath && request.method === 'DELETE') {
    const result = await updateUsers((users) => {
      const index = users.findIndex((user) => user.id === userPath[1])
      if (index < 0) return { error: 'Користувача не знайдено.' }
      users.splice(index, 1)
      return { changed: true, value: { ok: true } }
    })
    return respond(response, result.error ? 404 : 200, result.error ? { error: result.error } : result.value)
  }

  const taskCollection = pathname.match(/^\/api\/users\/([^/]+)\/tasks$/)
  if (taskCollection && request.method === 'POST') {
    const body = await readBody(request)
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title || title.length > 120) return respond(response, 400, { error: 'Вкажіть назву завдання до 120 символів.' })
    const result = await updateUsers((users) => {
      const user = users.find((item) => item.id === taskCollection[1])
      if (!user) return { error: 'Користувача не знайдено.' }
      const task = { id: randomUUID(), title, completed: false, createdAt: new Date().toISOString() }
      user.tasks.push(task)
      return { changed: true, value: task }
    })
    return respond(response, result.error ? 404 : 201, result.error ? { error: result.error } : result.value)
  }

  const taskPath = pathname.match(/^\/api\/users\/([^/]+)\/tasks\/([^/]+)$/)
  if (taskPath && request.method === 'PATCH') {
    const body = await readBody(request)
    if (typeof body.completed !== 'boolean') return respond(response, 400, { error: 'Вкажіть стан виконання завдання.' })
    const result = await updateUsers((users) => {
      const user = users.find((item) => item.id === taskPath[1])
      const task = user?.tasks.find((item) => item.id === taskPath[2])
      if (!task) return { error: 'Завдання не знайдено.' }
      task.completed = body.completed
      return { changed: true, value: task }
    })
    return respond(response, result.error ? 404 : 200, result.error ? { error: result.error } : result.value)
  }

  if (taskPath && request.method === 'DELETE') {
    const result = await updateUsers((users) => {
      const user = users.find((item) => item.id === taskPath[1])
      const index = user?.tasks.findIndex((item) => item.id === taskPath[2]) ?? -1
      if (index < 0) return { error: 'Завдання не знайдено.' }
      user.tasks.splice(index, 1)
      return { changed: true, value: { ok: true } }
    })
    return respond(response, result.error ? 404 : 200, result.error ? { error: result.error } : result.value)
  }

  return respond(response, 404, { error: 'Маршрут API не знайдено.' })
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

async function serveStatic(pathname, response) {
  let requestedPath = decodeURIComponent(pathname)
  if (requestedPath === '/') requestedPath = '/index.html'
  let filePath = resolve(distDirectory, `.${requestedPath}`)
  if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
    response.writeHead(403).end()
    return
  }
  try {
    const contents = await readFile(filePath)
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' })
    response.end(contents)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const contents = await readFile(join(distDirectory, 'index.html'))
    response.writeHead(200, { 'Content-Type': mimeTypes['.html'] })
    response.end(contents)
  }
}

const server = createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost')
    if (pathname.startsWith('/api/')) {
      if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) return respond(response, 405, { error: 'Метод не підтримується.' })
      return await handleApi(request, response, pathname)
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return response.writeHead(405).end()
    return await serveStatic(pathname, response)
  } catch (error) {
    if (!response.headersSent) respond(response, error.status || 500, { error: error.status ? error.message : 'Внутрішня помилка сервера.' })
    else response.destroy()
    if (!error.status) console.error(error)
  }
})

const port = Number(process.env.PORT || 4173)
server.listen(port, process.env.HOST || '0.0.0.0', () => {
  console.log(`Ритм API працює на http://localhost:${port}`)
})