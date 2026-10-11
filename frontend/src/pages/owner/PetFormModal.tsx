import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ownerService } from '@/services/ownerService'
import { X } from 'lucide-react'

interface Props { pet: any; onClose: () => void; onSaved: () => void }

// ── Bileşenler dışarıda tanımlı (her render'da yeniden oluşmasın) ──
interface FieldProps { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }
const Field = ({ label, value, onChange, type = 'text', placeholder = '' }: FieldProps) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
)

interface SelectFieldProps { label: string; value: string; onChange: (v: string) => void; options: string[] }
const SelectField = ({ label, value, onChange, options }: SelectFieldProps) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="">—</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

export default function PetFormModal({ pet, onClose, onSaved }: Props) {
  const isEdit = !!pet
  const [form, setForm] = useState({
    name: '', species: 'Kedi', breed: '', gender: '',
    birth_date: '', weight: '', color: '', notes: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name || '', species: pet.species || 'Kedi',
        breed: pet.breed || '', gender: pet.gender || '',
        birth_date: pet.birth_date || '', weight: pet.weight?.toString() || '',
        color: pet.color || '', notes: pet.notes || '',
      })
    }
  }, [pet])

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? ownerService.updatePet(pet.id, data) : ownerService.createPet(data),
    onSuccess: onSaved,
    onError: (e: any) => setError(e.response?.data?.detail || 'Hata oluştu.'),
  })

  const submit = () => {
    if (!form.name.trim()) { setError('Hayvan adı zorunludur.'); return }
    mutation.mutate({ ...form, weight: form.weight ? parseFloat(form.weight) : null })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-800">{isEdit ? 'Hayvanı Düzenle' : 'Yeni Hayvan Ekle'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Adı *" value={form.name} onChange={set('name')} placeholder="ör. Pamuk" />
            <SelectField label="Tür" value={form.species} onChange={set('species')} options={['Kedi', 'Köpek', 'Diğer']} />
            <Field label="Irk" value={form.breed} onChange={set('breed')} placeholder="ör. British Shorthair" />
            <SelectField label="Cinsiyet" value={form.gender} onChange={set('gender')} options={['Erkek', 'Dişi', 'Erkek Kısır', 'Dişi Kısır']} />
            <Field label="Doğum Tarihi" value={form.birth_date} onChange={set('birth_date')} type="date" />
            <Field label="Kilo (kg)" value={form.weight} onChange={set('weight')} type="number" placeholder="ör. 4.5" />
            <Field label="Renk / Tüy" value={form.color} onChange={set('color')} placeholder="ör. Gri, Tekir" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notlar</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">İptal</button>
          <button onClick={submit} disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60">
            {mutation.isPending ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Ekle')}
          </button>
        </div>
      </div>
    </div>
  )
}
