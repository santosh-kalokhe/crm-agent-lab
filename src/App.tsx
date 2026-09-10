import { useState } from 'react'
import Sidebar,{type Page} from './components/Sidebar'
import Dashboard from './pages/Dashboard'; import Sales from './pages/Sales'; import Service from './pages/Service'; import Marketing from './pages/Marketing'; import Agents from './pages/Agents'
import { isSupabaseConfigured } from './lib/supabase'
export default function App(){const [page,setPage]=useState<Page>('dashboard'); const content={dashboard:<Dashboard/>,sales:<Sales/>,service:<Service/>,marketing:<Marketing/>,agents:<Agents/>}[page]; return <div className="app"><Sidebar page={page} setPage={setPage}/><main><div className="topbar"><span className={`status ${isSupabaseConfigured?'connected':''}`}></span>{isSupabaseConfigured?'Supabase connected':'Demo data mode'}</div>{content}</main></div>}
