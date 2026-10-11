import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calculator, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { vetService } from '@/services/vetService'

const ANIMAL_TYPES = [
  { value: 'dog', label: 'Köpek' },
  { value: 'cat', label: 'Kedi' },
  { value: 'rabbit', label: 'Tavşan' },
  { value: 'hamster', label: 'Hamster' },
  { value: 'bird', label: 'Kuş' },
  { value: 'reptile', label: 'Sürüngen' },
  { value: 'other', label: 'Diğer' },
]

const ROUTES: Record<string, { value: number; label: string }> = {
  oral: { value: 1.0, label: 'Oral (PO)' },
  iv: { value: 0.8, label: 'İntravenöz (IV)' },
  im: { value: 0.9, label: 'İntramüsküler (IM)' },
  sc: { value: 0.85, label: 'Subkutanöz (SC)' },
  inhalation: { value: 0.5, label: 'İnhalasyon' },
  topical: { value: 0.6, label: 'Topikal' },
}

const SEVERITY: Record<string, { value: number; label: string }> = {
  mild: { value: 0.8, label: 'Hafif' },
  moderate: { value: 1.0, label: 'Orta' },
  severe: { value: 1.2, label: 'Ağır' },
  critical: { value: 1.5, label: 'Kritik' },
}

const AGE: Record<string, { value: number; label: string }> = {
  pediatric: { value: 0.5, label: 'Yavru (0-12 ay)' },
  young_adult: { value: 1.0, label: 'Genç Yetişkin (1-7 yaş)' },
  adult: { value: 1.0, label: 'Yetişkin (7+ yaş)' },
  geriatric: { value: 0.75, label: 'Yaşlı (10+ yaş)' },
}

interface Props {
  drugName?: string
  standalone?: boolean
}

export default function AdvancedDoseCalculator({ drugName = '', standalone = false }: Props) {
  const [drugInput, setDrugInput] = useState(drugName)
  const [selectedDrug, setSelectedDrug] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [weight, setWeight] = useState('')
  const [baseDose, setBaseDose] = useState('')
  const [animalType, setAnimalType] = useState('dog')
  const [ageGroup, setAgeGroup] = useState('young_adult')
  const [route, setRoute] = useState('oral')
  const [severity, setSeverity] = useState('moderate')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<any>(null)

  // API'den ilaçları ara
  const { data: searchResults = [] } = useQuery({
    queryKey: ['drug-search', drugInput],
    queryFn: () => 
      drugInput.length > 2 
        ? vetService.searchDrugs({ search: drugInput, size: 10 }).then(r => r.items || []) 
        : Promise.resolve([]),
    enabled: drugInput.length > 2,
  })

  const handleSelectDrug = (drug: any) => {
    setSelectedDrug(drug)
    setDrugInput(drug.name)
    setShowDropdown(false)
  }

  const handleClearDrug = () => {
    setDrugInput('')
    setSelectedDrug(null)
    setShowDropdown(false)
  }

  const drugInputRef = useRef<HTMLDivElement>(null)

  // Click outside handler - dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drugInputRef.current && !drugInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const calculate = () => {
    const w = parseFloat(weight)
    const bd = parseFloat(baseDose)
    if (isNaN(w) || isNaN(bd) || w <= 0 || bd <= 0) { setResult(null); return }
    const base = w * bd
    const rf = ROUTES[route]?.value || 1.0
    const af = AGE[ageGroup]?.value || 1.0
    const sf = SEVERITY[severity]?.value || 1.0
    const final = base * rf * sf * af
    setResult({
      base: base.toFixed(2), final: final.toFixed(2),
      rf: rf.toFixed(2), af: af.toFixed(2), sf: sf.toFixed(2),
      details: {
        animal: ANIMAL_TYPES.find(t => t.value === animalType)?.label,
        age: AGE[ageGroup]?.label,
        route: ROUTES[route]?.label,
      },
    })
  }

  return (
    <div className={standalone ? 'bg-white rounded-2xl shadow-sm p-5 mb-4' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-5'}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-blue-700" />
        <h3 className="font-semibold text-blue-900">Gelişmiş Doz Hesaplama</h3>
        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full ml-auto">Beta</span>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 space-y-3">
        {standalone && (
          <div className="relative" ref={drugInputRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">İlaç Adı</label>
            <div className="relative">
              <input 
                type="text" 
                value={drugInput} 
                onChange={e => { setDrugInput(e.target.value); setShowDropdown(true) }}
                onFocus={() => drugInput.length > 2 && setShowDropdown(true)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                placeholder="İlaç adını yazın..." 
              />
              {drugInput && (
                <button 
                  onClick={handleClearDrug}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((drug: any) => (
                  <button
                    key={drug.id}
                    onClick={() => handleSelectDrug(drug)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {drug.turkish_name ? `${drug.turkish_name} (${drug.name})` : drug.name}
                    </div>
                    {drug.trade_names && (
                      <div className="text-xs text-gray-500">Ticari: {drug.trade_names}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Seçilen İlaç Bilgisi */}
            {selectedDrug && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <p className="text-blue-900">
                  <strong>{selectedDrug.turkish_name ? `${selectedDrug.turkish_name} (${selectedDrug.name})` : selectedDrug.name}</strong>
                </p>
                {selectedDrug.trade_names && (
                  <p className="text-blue-700">Ticari: {selectedDrug.trade_names}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ağırlık (kg) *</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} min="0" step="0.1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="ör. 25.5" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Temel Doz (mg/kg) *</label>
            <input type="number" value={baseDose} onChange={e => setBaseDose(e.target.value)} min="0" step="0.5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="ör. 10" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hayvan Türü</label>
            <select value={animalType} onChange={e => setAnimalType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
              {ANIMAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Gelişmiş Parametreler
        </button>

        {showAdvanced && (
          <div className="pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Yaş Grubu</label>
              <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                {Object.entries(AGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Uygulama Yolu</label>
              <select value={route} onChange={e => setRoute(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                {Object.entries(ROUTES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hastalık Şiddeti</label>
              <select value={severity} onChange={e => setSeverity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                {Object.entries(SEVERITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={calculate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition">
            Hesapla
          </button>
          {result && (
            <button onClick={() => setResult(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
              Sıfırla
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg p-4 border-2 border-blue-300 space-y-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
            {drugInput && <p className="text-xs text-gray-500 mb-1">{drugInput}</p>}
            <p className="text-xs text-gray-600 mb-1">Hesaplanan Doz</p>
            <p className="text-3xl font-bold text-green-700">{result.final} <span className="text-base">mg</span></p>
            <p className="text-xs text-gray-500 mt-1">{result.details.animal} • {result.details.age} • {result.details.route}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded"><p className="text-gray-600">Temel Doz</p><p className="font-semibold">{result.base} mg</p></div>
            <div className="bg-gray-50 p-2 rounded"><p className="text-gray-600">Yol Faktörü</p><p className="font-semibold">× {result.rf}</p></div>
            <div className="bg-gray-50 p-2 rounded"><p className="text-gray-600">Şiddet</p><p className="font-semibold">× {result.sf}</p></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex gap-2">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Bu hesaplama yalnızca rehber amaçlıdır. Kesin doz veteriner hekimin mesleki yargısına bağlıdır.</p>
          </div>
        </div>
      )}

      {!result && (
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">💡 <strong>Faktörler:</strong> Hayvan türü, yaş, uygulama yolu ve hastalık şiddeti göz önünde bulundurularak doz hesaplanır.</p>
        </div>
      )}
    </div>
  )
}