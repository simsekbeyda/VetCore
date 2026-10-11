import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { X } from 'lucide-react'

interface Props { drug: any; onClose: () => void; onSaved: () => void }

export default function DrugFormModal({ drug, onClose, onSaved }: Props) {
  const isEdit = !!drug
  const [form, setForm] = useState({
    name: '', trade_names: '', pharmacological_class: '',
    side_effects: '', contraindications: '', interactions: '',
    overdose_symptoms: '', warnings: '', spc_url: '', source_id: '',
    species_ids: [] as number[], indication_ids: [] as number[],
    ingredients: [] as { ingredient_id: number; amount: string }[],
  })
  const [error, setError] = useState('')

  const { data: species } = useQuery({ queryKey: ['species'], queryFn: adminService.getSpecies })
  const { data: indications } = useQuery({ queryKey: ['indications'], queryFn: adminService.getIndications })
  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: adminService.getSources })

  useEffect(() => {
    if (drug) {
      setForm({
        name: drug.name || '',
        trade_names: drug.trade_names || '',
        pharmacological_class: drug.pharmacological_class || '',
        side_effects: drug.side_effects || '',
        contraindications: drug.contraindications || '',
        interactions: drug.interactions || '',
        overdose_symptoms: drug.overdose_symptoms || '',
        warnings: drug.warnings || '',
        spc_url: drug.spc_url || '',
        source_id: drug.source?.id || '',
        species_ids: drug.species?.map((s: any) => s.id) || [],
        indication_ids: drug.indications?.map((i: any) => i.id) || [],
        ingredients: drug.ingredients?.map((di: any) => ({ ingredient_id: di.ingredient.id, amount: di.amount || '' })) || [],
      })
    }
  }, [drug])

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? adminService.updateDrug(drug.id, data) : adminService.createDrug(data),
    onSuccess: onSaved,
    onError: (e: any) => setError(e.response?.data?.detail || 'Hata oluştu.'),
  })

  const toggleId = (field: 'species_ids' | 'indication_ids', id: number) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter(x => x !== id) : [...f[field], id],
    }))
  }

  const submit = () => {
    if (!form.name.trim()) { setError('İlaç adı zorunludur.'); return }
    mutation.mutate({ ...form, source_id: form.source_id ? Number(form.source_id) : null })
  }

  const Field = ({ label, field, textarea }: any) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {textarea
        ? <textarea rows={2} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        : <input value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-800">{isEdit ? 'İlaç Düzenle' : 'Yeni İlaç Ekle'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="İlaç Adı *" field="name" />
            <Field label="Ticari İsimler" field="trade_names" />
            <Field label="Farmakolojik Sınıf" field="pharmacological_class" />
            <Field label="SPC URL" field="spc_url" />
          </div>

          <Field label="Yan Etkiler" field="side_effects" textarea />
          <Field label="Kontrendikasyonlar" field="contraindications" textarea />
          <Field label="Etkileşimler" field="interactions" textarea />
          <Field label="Doz Aşımı Belirtileri" field="overdose_symptoms" textarea />
          <Field label="Uyarılar" field="warnings" textarea />

          {/* Kaynak */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kaynak</label>
            <select value={form.source_id} onChange={e => setForm(f => ({ ...f, source_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Seçiniz —</option>
              {sources?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Türler */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Hedef Türler</label>
            <div className="flex flex-wrap gap-2">
              {species?.map((s: any) => (
                <button key={s.id} type="button" onClick={() => toggleId('species_ids', s.id)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${form.species_ids.includes(s.id) ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {s.turkish_name || s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Endikasyonlar */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Endikasyonlar</label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {indications?.map((i: any) => (
                <button key={i.id} type="button" onClick={() => toggleId('indication_ids', i.id)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${form.indication_ids.includes(i.id) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {i.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
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
