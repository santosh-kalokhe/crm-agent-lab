import { BarChart3, BriefcaseBusiness, Headphones, Megaphone, Bot, Settings } from 'lucide-react'
export type Page = 'dashboard'|'sales'|'service'|'marketing'|'agents'
const items: {id:Page,label:string,icon:any}[] = [
  {id:'dashboard',label:'Dashboard',icon:BarChart3},{id:'sales',label:'Sales',icon:BriefcaseBusiness},
  {id:'service',label:'Customer Service',icon:Headphones},{id:'marketing',label:'Marketing',icon:Megaphone},
  {id:'agents',label:'Agent Control Center',icon:Bot},
]
export default function Sidebar({page,setPage}:{page:Page,setPage:(p:Page)=>void}){
 return <aside className="sidebar"><div className="brand"><div className="brandMark">C</div><div><strong>CRM Lab</strong><span>Autonomous SDLC Demo</span></div></div><nav>{items.map(({id,label,icon:Icon})=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={19}/>{label}</button>)}</nav><div className="sideFooter"><Settings size={18}/> Demo Workspace</div></aside>
}
