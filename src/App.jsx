import { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Home,
  ListTodo,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { ProgressRing } from './components/ProgressRing.jsx'
import { TaskRow } from './components/TaskRow.jsx'
import './App.css'

const colors = ['peach', 'lilac', 'mint', 'blue', 'yellow']
const TODAY_LABEL = new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

function Link({ href, navigate, children, className = '', ...props }) {
  return (
    <a href={href} className={className} onClick={(event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      navigate(href)
    }} {...props}>
      {children}
    </a>
  )
}

function Avatar({ name, index = 0, size = 'normal' }) {
  return <span className={`avatar avatar--${colors[index % colors.length]} avatar--${size}`} aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>
}

function Sidebar({ path, navigate }) {
  return (
    <aside className="sidebar">
      <Link href="/" navigate={navigate} className="brand" aria-label="Ритм, на головну"><span className="brand-mark"><ListTodo size={20} strokeWidth={2.5} /></span><span>ритм<span className="brand-period">.</span></span></Link>
      <p className="sidebar-label">РОБОЧИЙ ПРОСТІР</p>
      <nav className="primary-nav" aria-label="Головна навігація">
        <Link href="/" navigate={navigate} className={`nav-link ${path === '/' ? 'is-active' : ''}`}><Home size={18} /> Огляд</Link>
        <Link href="/users" navigate={navigate} className={`nav-link ${path.startsWith('/users') ? 'is-active' : ''}`}><UsersRound size={18} /> Користувачі</Link>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-note-icon"><Sparkles size={16} /></div><p>Маленькі кроки<br />створюють великі звички.</p><span>ТВІЙ ТЕМП. ТВОЇ ПРАВИЛА.</span></div>
      <div className="sidebar-profile"><span className="profile-badge">R</span><span className="profile-copy"><strong>Робочий простір</strong><small>Особистий акаунт</small></span><ArrowDownLeft size={16} className="profile-more" /></div>
    </aside>
  )
}

function PageHeader({ eyebrow, title, action }) {
  return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{action}</header>
}

function UserCard({ user, index, navigate, onDelete }) {
  const completed = user.tasks.filter((task) => task.completed).length
  const total = user.tasks.length
  const progress = total ? Math.round((completed / total) * 100) : 0
  return (
    <article className="user-card">
      <div className="user-card-top"><Avatar name={user.name} index={index} /><button className="icon-button delete-user" aria-label={`Видалити ${user.name}`} title="Видалити користувача" onClick={() => onDelete(user.id)}><Trash2 size={16} /></button></div>
      <Link href={`/users/${user.id}`} navigate={navigate} className="user-card-name">{user.name}</Link>
      <p className="user-card-caption">{total ? `${completed} із ${total} завдань виконано` : 'Поки без завдань'}</p>
      <div className="user-progress-line"><span><span style={{ width: `${progress}%` }} /></span><strong>{progress}%</strong></div>
      <Link href={`/users/${user.id}`} navigate={navigate} className="card-arrow" aria-label={`Відкрити список завдань ${user.name}`}><ArrowRight size={17} /></Link>
    </article>
  )
}

function Dashboard({ users, navigate, onDelete }) {
  const totalTasks = users.reduce((sum, user) => sum + user.tasks.length, 0)
  const completedTasks = users.reduce((sum, user) => sum + user.tasks.filter((task) => task.completed).length, 0)
  const leaders = [...users].map((user, index) => ({ user, index, progress: user.tasks.length ? user.tasks.filter((task) => task.completed).length / user.tasks.length : 0 })).sort((a, b) => b.progress - a.progress || a.user.name.localeCompare(b.user.name, 'uk')).slice(0, 3)
  return (
    <>
      <PageHeader eyebrow={TODAY_LABEL} title="Твій ритм роботи" action={<Link className="button button--primary" href="/users/new" navigate={navigate}><Plus size={18} /> Новий користувач</Link>} />
      <section className="welcome-banner" aria-label="Привітання"><div className="welcome-copy"><span className="welcome-kicker"><Sparkles size={14} /> ПРОСТІР ДЛЯ ТВОГО ФОКУСУ</span><h2>Плануй менше.<br /><span>Встигай важливе.</span></h2><p>Кожне виконане завдання — це ще один крок уперед.</p></div><div className="welcome-art" aria-hidden="true"><div className="sun-stamp"><Sparkles size={23} /></div><div className="art-note art-note--one"><Check size={18} /></div><div className="art-note art-note--two"><span>✓</span></div><div className="art-lines"><span /><span /><span /></div></div><span className="banner-index">№ 01 <ArrowRight size={14} /></span></section>
      <section className="stats-row" aria-label="Загальна статистика">
        <article className="stat-item"><span className="stat-icon stat-icon--coral"><UsersRound size={19} /></span><div><span className="stat-label">УЧАСНИКИ</span><strong>{users.length}</strong><small>активних користувачів</small></div></article>
        <article className="stat-item"><span className="stat-icon stat-icon--green"><ListTodo size={19} /></span><div><span className="stat-label">УСІ ЗАВДАННЯ</span><strong>{totalTasks}</strong><small>у персональних списках</small></div></article>
        <article className="stat-item"><span className="stat-icon stat-icon--yellow"><CheckCircle2 size={19} /></span><div><span className="stat-label">ВИКОНАНО</span><strong>{completedTasks}<span className="stat-total"> / {totalTasks}</span></strong><small>{totalTasks ? `${Math.round((completedTasks / totalTasks) * 100)}% від усіх завдань` : 'час зробити перший крок'}</small></div></article>
      </section>
      <section className="dashboard-section"><div className="section-heading"><div><p className="eyebrow">ТВОЯ КОМАНДА</p><h2>Користувачі <span className="heading-count">{users.length}</span></h2></div><Link href="/users" navigate={navigate} className="text-link">Усі користувачі <ArrowRight size={16} /></Link></div>
        {users.length ? <div className="users-grid">{users.slice(0, 4).map((user, index) => <UserCard key={user.id} user={user} index={index} navigate={navigate} onDelete={onDelete} />)}</div> : <EmptyState title="Твій простір починається тут" message="Додай першого користувача, щоб створювати персональні списки завдань." action={<Link className="button button--primary" href="/users/new" navigate={navigate}><Plus size={18} /> Додати користувача</Link>} />}
      </section>
      <section className="dashboard-section leaderboard-section"><div className="section-heading"><div><p className="eyebrow">ПОСТУП У СПРАВАХ</p><h2>Топ прогресу <span className="heading-spark">✳</span></h2></div><span className="section-caption">За відсотком виконання</span></div>
        {leaders.length ? <div className="leaderboard">{leaders.map(({ user, index, progress }, rank) => <Link href={`/users/${user.id}`} navigate={navigate} className="leader-row" key={user.id}><span className={`leader-rank ${rank === 0 ? 'leader-rank--first' : ''}`}>0{rank + 1}</span><Avatar name={user.name} index={index} size="small" /><span className="leader-name">{user.name}</span><span className="leader-task-count">{user.tasks.filter((task) => task.completed).length}/{user.tasks.length} завдань</span><ProgressRing value={Math.round(progress * 100)} size={40} strokeWidth={3} /><span className="leader-percent">{Math.round(progress * 100)}%</span><ArrowRight size={16} className="leader-arrow" /></Link>)}</div> : <p className="leaderboard-empty">Топ з’явиться після створення користувачів.</p>}
      </section>
    </>
  )
}

function EmptyState({ title, message, action }) {
  return <div className="empty-state"><span className="empty-icon"><ListTodo size={23} /></span><h3>{title}</h3><p>{message}</p>{action}</div>
}

function UsersPage({ users, navigate, onDelete }) {
  const countLabel = users.length === 1 ? 'учасник' : users.length > 1 && users.length < 5 ? 'учасники' : 'учасників'
  return <><PageHeader eyebrow="РОБОЧИЙ ПРОСТІР" title="Користувачі" action={<Link className="button button--primary" href="/users/new" navigate={navigate}><Plus size={18} /> Додати користувача</Link>} /><section className="subpage-intro"><span className="intro-icon"><UsersRound size={20} /></span><p>Особисті списки справ для кожного. Усі кроки — в одному місці.</p><span className="subpage-count">{users.length} {countLabel}</span></section>{users.length ? <div className="users-grid users-grid--all">{users.map((user, index) => <UserCard key={user.id} user={user} index={index} navigate={navigate} onDelete={onDelete} />)}</div> : <EmptyState title="Список поки порожній" message="Додай користувача, щоб розпочати." action={<Link className="button button--primary" href="/users/new" navigate={navigate}><Plus size={18} /> Додати користувача</Link>} />}</>
}

function CreateUserPage({ navigate, onCreate, busy, error }) {
  const [name, setName] = useState('')
  function submit(event) {
    event.preventDefault()
    if (name.trim()) onCreate(name.trim())
  }
  return <><Link href="/users" navigate={navigate} className="back-link"><ArrowLeft size={16} /> До користувачів</Link><PageHeader eyebrow="НОВИЙ УЧАСНИК" title="Додати користувача" /><div className="form-layout"><div className="form-aside"><span className="form-art"><UserRound size={27} /></span><h2>Окремий список.<br />Спільний фокус.</h2><p>Для кожної людини — свій темп і свої маленькі перемоги.</p></div><form className="user-form" onSubmit={submit}><label htmlFor="user-name">Ім’я користувача</label><p className="field-hint">Так, як його бачитимуть у списках</p><input id="user-name" name="name" autoFocus autoComplete="name" maxLength={50} placeholder="Наприклад, Олена" value={name} onChange={(event) => setName(event.target.value)} required /><span className="field-counter">{name.length}/50</span>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="button button--primary form-submit" disabled={busy || !name.trim()}><Plus size={18} /> {busy ? 'Створюємо…' : 'Створити користувача'}</button><p className="form-footnote"><CheckCircle2 size={14} /> Список завдань створиться автоматично</p></form></div></>
}

function UserTasksPage({ user, index, navigate, onAddTask, onToggleTask, onDeleteTask, busy, error }) {
  const [title, setTitle] = useState('')
  if (!user) return <EmptyState title="Користувача не знайдено" message="Можливо, його вже видалили або посилання застаріло." action={<Link className="button button--primary" href="/users" navigate={navigate}>До користувачів</Link>} />
  const completed = user.tasks.filter((task) => task.completed).length
  const total = user.tasks.length
  const percent = total ? Math.round((completed / total) * 100) : 0
  function submit(event) {
    event.preventDefault()
    if (title.trim()) {
      onAddTask(user.id, title.trim())
      setTitle('')
    }
  }
  return <><Link href="/users" navigate={navigate} className="back-link"><ArrowLeft size={16} /> До користувачів</Link><PageHeader eyebrow="ПЕРСОНАЛЬНИЙ СПИСОК" title={`Завдання ${user.name}`} action={<Avatar name={user.name} index={index} />} /><section className="task-summary"><div className="task-summary-person"><Avatar name={user.name} index={index} size="large" /><div><span className="eyebrow">У ФОКУСІ</span><h2>{user.name}</h2><p>{completed} із {total} завдань виконано</p></div></div><div className="task-summary-progress"><ProgressRing value={percent} size={66} strokeWidth={5} /><div><span className="eyebrow">ПРОГРЕС</span><strong>{percent}%</strong></div></div></section><section className="task-workspace"><div className="task-column"><div className="section-heading"><div><p className="eyebrow">ПЛАН НА ДЕНЬ</p><h2>Список завдань <span className="heading-count">{total}</span></h2></div><span className="task-date"><Clock3 size={15} /> Можна зробити</span></div><form className="task-add-form" onSubmit={submit}><label className="sr-only" htmlFor="task-title">Нове завдання</label><Plus size={18} /><input id="task-title" name="title" placeholder="Що потрібно зробити?" maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} /><button type="submit" aria-label="Додати завдання" disabled={busy || !title.trim()}><ArrowRight size={18} /></button></form>{error && <p className="form-error" role="alert">{error}</p>}<div className="task-list">{user.tasks.length ? user.tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={(value) => onToggleTask(user.id, task.id, value)} onDelete={() => onDeleteTask(user.id, task.id)} />) : <div className="task-empty"><ListTodo size={22} /><p>Ще немає завдань.</p><span>Додай перше — і можна починати.</span></div>}</div></div><aside className="focus-note"><span className="focus-note-icon"><Sparkles size={18} /></span><p className="eyebrow">МАЛЕНЬКА ПОРАДА</p><h3>Один крок за раз.</h3><p>Не обов’язково зробити все одразу. Почни з того, що справді важливо сьогодні.</p><div className="focus-note-footer"><span>ТИ ВЖЕ НА ШЛЯХУ</span><span>✳</span></div></aside></section></>
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [users, setUsers] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setError('')
  }
  async function refreshUsers() {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Не вдалося завантажити користувачів.')
      setUsers(await response.json())
    } catch (requestError) {
      setError(requestError.message || 'Помилка з’єднання із сервером.')
      setUsers([])
    }
  }
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    fetch('/api/users')
      .then((response) => {
        if (!response.ok) throw new Error('Не вдалося завантажити користувачів.')
        return response.json()
      })
      .then(setUsers)
      .catch((requestError) => {
        setError(requestError.message || 'Помилка з’єднання із сервером.')
        setUsers([])
      })
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  async function request(url, options = {}) {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Не вдалося зберегти зміни.')
      await refreshUsers()
      return result
    } catch (requestError) {
      setError(requestError.message || 'Помилка з’єднання із сервером.')
      return null
    } finally {
      setBusy(false)
    }
  }
  async function createUser(name) {
    const created = await request('/api/users', { method: 'POST', body: JSON.stringify({ name }) })
    if (created) navigate(`/users/${created.id}`)
  }
  async function addTask(userId, title) {
    await request(`/api/users/${userId}/tasks`, { method: 'POST', body: JSON.stringify({ title }) })
  }
  async function toggleTask(userId, taskId, completed) {
    await request(`/api/users/${userId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ completed }) })
  }
  async function deleteTask(userId, taskId) {
    await request(`/api/users/${userId}/tasks/${taskId}`, { method: 'DELETE' })
  }
  async function deleteUser(userId) {
    if (window.confirm('Видалити користувача разом з усіма його завданнями?')) await request(`/api/users/${userId}`, { method: 'DELETE' })
  }
  const userMatch = path.match(/^\/users\/([^/]+)$/)
  const loadedUsers = users ?? []
  const currentUser = userMatch ? loadedUsers.find((user) => user.id === userMatch[1]) : null
  const currentIndex = currentUser ? loadedUsers.indexOf(currentUser) : 0
  let page
  if (users === null) page = <div className="loading-state" role="status">Завантажуємо твій простір…</div>
  else if (path === '/') page = <Dashboard users={loadedUsers} navigate={navigate} onDelete={deleteUser} />
  else if (path === '/users') page = <UsersPage users={loadedUsers} navigate={navigate} onDelete={deleteUser} />
  else if (path === '/users/new') page = <CreateUserPage navigate={navigate} onCreate={createUser} busy={busy} error={error} />
  else if (userMatch) page = <UserTasksPage user={currentUser} index={currentIndex} navigate={navigate} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} busy={busy} error={error} />
  else page = <EmptyState title="Сторінку не знайдено" message="Схоже, такої адреси немає." action={<Link className="button button--primary" href="/" navigate={navigate}>На головну</Link>} />
  return <div className="app-shell"><Sidebar path={path} navigate={navigate} /><main className="main-content"><div className="page-content">{error && !path.includes('/new') && !userMatch && <p className="form-error global-error" role="alert">{error}</p>}{page}</div></main></div>
}

export default App