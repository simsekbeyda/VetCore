import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ownerService } from '@/services/ownerService'
import { ArrowLeft, Plus, Trash2, Bell, BellOff, Calendar, Pill, Stethoscope } from 'lucide-react'
import DrugSearchInput from '@/components/common/DrugSearchInput'

const tabs = ['Ziyaret Geçmişi', 'İlaç Kayıtları', 'İlaç Takvimi'] as const
type Tab = typeof tabs[number]

export default function PetDetailPage() {
  const { id } = useParams()
  const petId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('Ziyaret Geçmişi')

  const { data: pets } = useQuery({ queryKey: ['owner-pets'], queryFn: ownerService.getPets })
  const pet = pets?.find((p: any) => p.id === petId)

  const { data: visits } = useQuery({ queryKey: ['visits', petId], queryFn: () => ownerService.getVisits(petId) })
  const { data: meds } = useQuery({ queryKey: ['meds', petId], queryFn: () => ownerService.getMedications(petId) })
  const { data: schedules } = useQuery({ queryKey: ['schedules', petId], queryFn: () => ownerService.getSchedules(petId) })

  const delVisit = useMutation({ mutationFn: (vid: number) => ownerService.deleteVisit(petId, vid), onSuccess: () => qc.invalidateQueries({ queryKey: ['visits', petId] }) })
  const delMed = useMutation({ mutationFn: (mid: number) => ownerService.deleteMedication(petId, mid), onSuccess: () => qc.invalidateQueries({ queryKey: ['meds', petId] }) })
  const delSch = useMutation({ mutationFn: (sid: number) => ownerService.deleteSchedule(petId, sid), onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules', petId] }) })
  const toggleSch = useMutation({ mutationFn: (sid: number) => ownerService.toggleSchedule(petId, sid), onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules', petId] }) })

  if (!pet) return <p className="text-gray-400 p-8">Yükleniyor...</p>

  return (
    <div>
      <button onClick={() => navigate('/owner')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-5">
        <ArrowLeft size={16} /> Hayvanlarım
      </button>

      {/* Pet Header */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{pet.species === 'Kedi' ? '🐱' : pet.species === 'Köpek' ? '🐶' : '🐾'}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pet.name}</h1>
            <p className="text-gray-500">{pet.species}{pet.breed ? ` — ${pet.breed}` : ''}{pet.gender ? ` · ${pet.gender}` : ''}</p>
            <div className="flex gap-4 mt-1 text-xs text-gray-400">
              {pet.birth_date && <span>📅 {pet.birth_date}</span>}
              {pet.weight && <span>⚖️ {pet.weight} kg</span>}
              {pet.color && <span>🎨 {pet.color}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t === 'Ziyaret Geçmişi' && <Stethoscope size={14} className="inline mr-1" />}
            {t === 'İlaç Kayıtları' && <Pill size={14} className="inline mr-1" />}
            {t === 'İlaç Takvimi' && <Calendar size={14} className="inline mr-1" />}
            {t}
          </button>
        ))}
      </div>

      {/* Ziyaret Geçmişi */}
      {tab === 'Ziyaret Geçmişi' && (
        <VisitSection petId={petId} visits={visits} onDelete={(id: number) => delVisit.mutate(id)} qc={qc} />
      )}

      {/* İlaç Kayıtları */}
      {tab === 'İlaç Kayıtları' && (
        <MedSection petId={petId} meds={meds} onDelete={(id: number) => delMed.mutate(id)} qc={qc} />
      )}

      {/* İlaç Takvimi */}
      {tab === 'İlaç Takvimi' && (
        <ScheduleSection petId={petId} schedules={schedules}
          onDelete={(id: number) => delSch.mutate(id)}
          onToggle={(id: number) => toggleSch.mutate(id)} qc={qc} />
      )}
    </div>
  )
}

// ── Alt Bölümler ──────────────────────────────────────────
function VisitSection({ petId, visits, onDelete, qc }: any) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ visit_date: '', vet_name: '', clinic: '', reason: '', diagnosis: '', treatment: '', notes: '', next_visit: '' })
  const mut = useMutation({ mutationFn: () => ownerService.addVisit(petId, form), onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['visits', petId] }) } })

  return (
    <div>
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Ziyaret Geçmişi</h3>
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-800"><Plus size={13} /> Ziyaret Ekle</button>
      </div>
      {open && (
        <div className="bg-blue-50 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
          {[['visit_date','Tarih','date'],['vet_name','Veteriner Adı','text'],['clinic','Klinik','text'],['reason','Şikayet','text'],['diagnosis','Tanı','text'],['treatment','Tedavi','text'],['next_visit','Sonraki Ziyaret','date']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-xs text-gray-600 mb-1">{l}</label>
              <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
            </div>
          ))}
          <div className="col-span-2 flex gap-2 justify-end">
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 border rounded-lg text-sm text-gray-600">İptal</button>
            <button onClick={() => mut.mutate()} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm">Kaydet</button>
          </div>
        </div>
      )}
      {visits?.length === 0 ? <p className="text-gray-400 text-sm">Henüz ziyaret kaydı yok.</p>
        : visits?.map((v: any) => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 border-l-4 border-blue-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">{v.visit_date}</p>
                {v.vet_name && <p className="text-sm text-gray-500">Dr. {v.vet_name}{v.clinic ? ` — ${v.clinic}` : ''}</p>}
                {v.reason && <p className="text-sm text-gray-600 mt-1">Şikayet: {v.reason}</p>}
                {v.diagnosis && <p className="text-sm text-blue-700 mt-1">Tanı: {v.diagnosis}</p>}
                {v.treatment && <p className="text-sm text-green-700">Tedavi: {v.treatment}</p>}
                {v.next_visit && <p className="text-xs text-orange-600 mt-1">📅 Sonraki: {v.next_visit}</p>}
              </div>
              <button onClick={() => { if (confirm('Silinsin mi?')) onDelete(v.id) }} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
    </div>
  )
}

function MedSection({ petId, meds, onDelete, qc }: any) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ drug_name: '', dose: '', start_date: '', end_date: '', prescribed_by: '', notes: '' })
  const mut = useMutation({ mutationFn: () => ownerService.addMedication(petId, form), onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['meds', petId] }) } })

  return (
    <div>
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-gray-700">İlaç Kayıtları</h3>
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-800"><Plus size={13} /> İlaç Ekle</button>
      </div>
      {open && (
        <div className="bg-green-50 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
              <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">İlaç Adı</label>
              <DrugSearchInput value={form.drug_name} onChange={v => setForm(f => ({...f, drug_name: v}))} placeholder="İlaç adı yazın veya seçin..." />
            </div>
          {[['dose','Doz','text'],['start_date','Başlangıç','date'],['end_date','Bitiş','date'],['prescribed_by','Yazan Hekim','text']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-xs text-gray-600 mb-1">{l}</label>
              <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
            </div>
          ))}
          <div className="col-span-2 flex gap-2 justify-end">
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 border rounded-lg text-sm text-gray-600">İptal</button>
            <button onClick={() => mut.mutate()} className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm">Kaydet</button>
          </div>
        </div>
      )}
      {meds?.length === 0 ? <p className="text-gray-400 text-sm">Henüz ilaç kaydı yok.</p>
        : meds?.map((m: any) => (
          <div key={m.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 border-l-4 border-green-400 flex justify-between">
            <div>
              <p className="font-medium text-gray-800">💊 {m.drug_name}</p>
              {m.dose && <p className="text-sm text-gray-500">Doz: {m.dose}</p>}
              <p className="text-xs text-gray-400">{m.start_date}{m.end_date ? ` → ${m.end_date}` : ''}</p>
              {m.prescribed_by && <p className="text-xs text-gray-400">Dr. {m.prescribed_by}</p>}
            </div>
            <button onClick={() => { if (confirm('Silinsin mi?')) onDelete(m.id) }} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
    </div>
  )
}

function ScheduleSection({ petId, schedules, onDelete, onToggle, qc }: any) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ drug_name: '', dose: '', frequency: 'Günlük 1x', times: '08:00', start_date: '', end_date: '', notes: '' })
  const mut = useMutation({ mutationFn: () => ownerService.addSchedule(petId, form), onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ['schedules', petId] }) } })

  const activeCount = schedules?.filter((s: any) => s.is_active).length || 0

  return (
    <div>
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-gray-700">İlaç Takvimi {activeCount > 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-1">{activeCount} aktif</span>}</h3>
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-800"><Plus size={13} /> Takvim Ekle</button>
      </div>

      {/* Aktif hatırlatıcı bildirimi */}
      {activeCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-amber-800 text-sm">
          <Bell size={16} /> <span>{activeCount} aktif ilaç hatırlatıcısı var.</span>
        </div>
      )}

      {open && (
        <div className="bg-purple-50 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
              <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">İlaç Adı</label>
              <DrugSearchInput value={form.drug_name} onChange={v => setForm(f => ({...f, drug_name: v}))} placeholder="İlaç adı yazın veya seçin..." />
            </div>
          {[['dose','Doz','text'],['start_date','Başlangıç','date'],['end_date','Bitiş (opsiyonel)','date'],['times','Saat(ler) (virgülle)','text']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-xs text-gray-600 mb-1">{l}</label>
              <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sıklık</label>
            <select value={form.frequency} onChange={e => setForm(f => ({...f,frequency:e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400">
              {['Günlük 1x','Günlük 2x','Günlük 3x','Haftalık','Aylık'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 border rounded-lg text-sm text-gray-600">İptal</button>
            <button onClick={() => mut.mutate()} className="px-3 py-1.5 bg-purple-700 text-white rounded-lg text-sm">Kaydet</button>
          </div>
        </div>
      )}

      {schedules?.length === 0 ? <p className="text-gray-400 text-sm">Henüz takvim kaydı yok.</p>
        : schedules?.map((s: any) => (
          <div key={s.id} className={`bg-white rounded-xl shadow-sm p-4 mb-3 border-l-4 ${s.is_active ? 'border-purple-500' : 'border-gray-300'} flex justify-between items-start`}>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800">💊 {s.drug_name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  {s.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              {s.dose && <p className="text-sm text-gray-500">Doz: {s.dose}</p>}
              <p className="text-xs text-gray-400">{s.frequency} — {s.times.split(',').map((t: string) => `⏰ ${t.trim()}`).join(' ')}</p>
              <p className="text-xs text-gray-400">{s.start_date}{s.end_date ? ` → ${s.end_date}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onToggle(s.id)} className={`${s.is_active ? 'text-purple-500' : 'text-gray-400'} hover:opacity-70`}>
                {s.is_active ? <Bell size={16} /> : <BellOff size={16} />}
              </button>
              <button onClick={() => { if (confirm('Silinsin mi?')) onDelete(s.id) }} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
    </div>
  )
}
