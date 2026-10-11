import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/services/api'
import { ClipboardList, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Loader } from 'lucide-react'

// ── Tipler ──────────────────────────────────────────────
type CheckMap = Record<string, boolean>

const initSistem: CheckMap = {
  anoreksi: false, polifaji: false, polidipsi: false, pityalizm: false,
  disfaji: false, regurgitasyon: false, kusma: false, hematemez: false,
  diyare: false, konstipasyon: false, dishezi: false, hematokezi: false,
  melena: false, tenesmus: false, sigara_solunumu: false, rinore: false,
  epistaksis: false, ekspektorasyon: false, oksuruk: false, gece_oksurugu: false,
  egzersiz_intoleransi: false, dispne: false, ortopne: false, periferal_odem: false,
  disuri: false, stranguri: false, hematuri: false, anuri: false,
  oligouri: false, polyuri: false, pollakiuri: false, hemoglobinuri: false,
  myoglobinuri: false, senkop: false, tremor: false, ataksi: false,
  opistotonus: false, myoklonus: false, parapleji: false, hemipleji: false,
  tetrapleji: false, konvulsiyon: false,
}

const initAsi: CheckMap = {
  ic_parazit: false, dis_parazit: false, karma: false, kuduz: false,
  losemi: false, lyme: false, bronsin: false, corona: false,
}

const sistemLabels: Record<string, string> = {
  anoreksi: 'Anoreksi', polifaji: 'Polifaji', polidipsi: 'Polidipsi',
  pityalizm: 'Pityalizm', disfaji: 'Disfaji', regurgitasyon: 'Regürgitasyon',
  kusma: 'Kusma', hematemez: 'Hematemez', diyare: 'Diyare',
  konstipasyon: 'Konstipasyon', dishezi: 'Dishezi', hematokezi: 'Hematokezi',
  melena: 'Melena', tenesmus: 'Tenesmus', sigara_solunumu: 'Sigara Solunumu',
  rinore: 'Rinore', epistaksis: 'Epistaksis', ekspektorasyon: 'Ekspektorasyon',
  oksuruk: 'Öksürük', gece_oksurugu: 'Gece Öksürüğü', egzersiz_intoleransi: 'Egzersiz İntol.',
  dispne: 'Dispne', ortopne: 'Ortopne', periferal_odem: 'Periferik Ödem',
  disuri: 'Disüri', stranguri: 'Strangüri', hematuri: 'Hematüri',
  anuri: 'Anüri', oligouri: 'Oligoüri', polyuri: 'Poliüri',
  pollakiuri: 'Pollakiüri', hemoglobinuri: 'Hemoglobinüri', myoglobinuri: 'Myoglobinüri',
  senkop: 'Senkop', tremor: 'Tremor', ataksi: 'Ataksi',
  opistotonus: 'Opistotonus', myoklonus: 'Myoklonus', parapleji: 'Parapleji',
  hemipleji: 'Hemipleji', tetrapleji: 'Tetrapleji', konvulsiyon: 'Konvülsiyon',
}

const asiLabels: Record<string, string> = {
  ic_parazit: 'İç Parazit', dis_parazit: 'Dış Parazit', karma: 'Karma',
  kuduz: 'Kuduz', losemi: 'Lösemi', lyme: 'Lyme', bronsin: 'Bronşin', corona: 'Corona',
}

const sistemGruplari = [
  { baslik: 'Sindirim Sistemi', keys: ['anoreksi','polifaji','polidipsi','pityalizm','disfaji','regurgitasyon','kusma','hematemez','diyare','konstipasyon','dishezi','hematokezi','melena','tenesmus'] },
  { baslik: 'Solunum Sistemi', keys: ['sigara_solunumu','rinore','epistaksis','ekspektorasyon','oksuruk','gece_oksurugu','egzersiz_intoleransi','dispne','ortopne','periferal_odem'] },
  { baslik: 'Üriner Sistem', keys: ['disuri','stranguri','hematuri','anuri','oligouri','polyuri','pollakiuri','hemoglobinuri','myoglobinuri','senkop'] },
  { baslik: 'Nörolojik', keys: ['tremor','ataksi','opistotonus','myoklonus','parapleji','hemipleji','tetrapleji','konvulsiyon'] },
]

// ── Yardımcı Bileşenler ──────────────────────────────────
const CheckBox = ({ label, checked, onChange }: any) => (
  <label className="flex items-center gap-2 cursor-pointer select-none group">
    <input type="checkbox" checked={checked} onChange={onChange}
      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
    <span className={`text-sm ${checked ? 'text-blue-700 font-medium' : 'text-gray-600'} group-hover:text-gray-800`}>
      {label}
    </span>
  </label>
)

const Select = ({ label, value, onChange, options }: any) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="">— Seçiniz —</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

const Input = ({ label, value, onChange, placeholder }: any) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
)

const Section = ({ title, children, defaultOpen = true }: any) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
      <button onClick={() => setOpen((o: boolean) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition">
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  )
}

// ── Ana Sayfa ────────────────────────────────────────────
export default function AnamnezPage() {
  const [hasta, setHasta] = useState({
    hasta_adi: '', hasta_sahibi: '', protokol_no: '', tur: '', irk: '',
    cinsiyet: '', yas: '', kilo: '', hastalik_suresi: '',
    mama_tuketimi: '', mama_markasi: '', su_tuketimi: '',
    anne_sutu: '', seyahat: '', sigara_iceride: '',
  })
  const [asi, setAsi] = useState<CheckMap>(initAsi)
  const [sikayet, setSikayet] = useState('')
  const [sistem, setSistem] = useState<CheckMap>(initSistem)
  const [fiziksel, setFiziksel] = useState({
    genel_durum: '', goz_muayenesi: '', gozler_orbitaya_cokme: '',
    mukoza_rengi: '', mukoza_nemliligi: '', crt: '', deri_turgoru: '',
    dehidrasyon: '', lenf_nodulleri: '', batin_palpasyonu: '',
    periferal_sicaklik: '', kardiyak_oskultasyon: '', pulmoner_oskultasyon: '',
  })
  const [vital, setVital] = useState({ vucut_sicakligi: '', nabiz: '', solunum_sayisi: '', tansiyon: '' })
  const [tedaviGecmisi, setTedaviGecmisi] = useState('')
  const [result, setResult] = useState<any>(null)

  const setH = (k: string, v: string) => setHasta(p => ({ ...p, [k]: v }))
  const setF = (k: string, v: string) => setFiziksel(p => ({ ...p, [k]: v }))
  const setV = (k: string, v: string) => setVital(p => ({ ...p, [k]: v }))
  const toggleSistem = (k: string) => setSistem(p => ({ ...p, [k]: !p[k] }))
  const toggleAsi = (k: string) => setAsi(p => ({ ...p, [k]: !p[k] }))

  const mutation = useMutation({
    mutationFn: () => api.post('/vet/anamnez/analyze', {
      hasta, asi, sikayet, sistem, fiziksel, vital, tedavi_gecmisi: tedaviGecmisi
    }).then(r => r.data),
    onSuccess: (data) => {
      setResult(data)
      setTimeout(() => document.getElementById('ai-result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    },
  })

  const pozitifSayisi = Object.values(sistem).filter(Boolean).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList size={22} className="text-blue-700" />
        <h1 className="text-xl font-bold text-gray-800">Anamnez Formu & AI Analiz</h1>
      </div>

      {/* Hasta Bilgileri */}
      <Section title="Hasta Bilgileri">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input label="Hasta Adı" value={hasta.hasta_adi} onChange={(v: string) => setH('hasta_adi', v)} placeholder="ör. Pamuk" />
          <Input label="Hasta Sahibi" value={hasta.hasta_sahibi} onChange={(v: string) => setH('hasta_sahibi', v)} placeholder="ör. Ahmet Yılmaz" />
          <Input label="Protokol No" value={hasta.protokol_no} onChange={(v: string) => setH('protokol_no', v)} placeholder="ör. 200755" />
          <Select label="Tür" value={hasta.tur} onChange={(v: string) => setH('tur', v)} options={['Kedi', 'Köpek', 'Diğer']} />
          <Input label="Irk" value={hasta.irk} onChange={(v: string) => setH('irk', v)} placeholder="ör. British Shorthair" />
          <Select label="Cinsiyet" value={hasta.cinsiyet} onChange={(v: string) => setH('cinsiyet', v)} options={['Erkek', 'Dişi', 'Erkek Kısır', 'Dişi Kısır']} />
          <Input label="Yaş" value={hasta.yas} onChange={(v: string) => setH('yas', v)} placeholder="ör. 3 yaş" />
          <Input label="Kilo (kg)" value={hasta.kilo} onChange={(v: string) => setH('kilo', v)} placeholder="ör. 4.5" />
          <Input label="Hastalık Süresi" value={hasta.hastalik_suresi} onChange={(v: string) => setH('hastalik_suresi', v)} placeholder="ör. 2 gün" />
          <Select label="Anne Sütü" value={hasta.anne_sutu} onChange={(v: string) => setH('anne_sutu', v)} options={['Aldı', 'Almadı']} />
          <Select label="Seyahat" value={hasta.seyahat} onChange={(v: string) => setH('seyahat', v)} options={['Var', 'Yok']} />
          <Select label="Yanında Sigara" value={hasta.sigara_iceride} onChange={(v: string) => setH('sigara_iceride', v)} options={['Evet', 'Hayır']} />
        </div>
      </Section>

      {/* Diyet & Mama */}
      <Section title="Diyet & Beslenme">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select label="Mama Tüketimi" value={hasta.mama_tuketimi} onChange={(v: string) => setH('mama_tuketimi', v)}
            options={['Kuru Mama', 'Yaş Mama', 'Ev Yemeği', 'Karışık']} />
          <Input label="Mama Markası" value={hasta.mama_markasi} onChange={(v: string) => setH('mama_markasi', v)} placeholder="ör. Royal Canin" />
          <Select label="Su Tüketimi" value={hasta.su_tuketimi} onChange={(v: string) => setH('su_tuketimi', v)}
            options={['Az', 'Normal', 'Fazla']} />
        </div>
      </Section>

      {/* Aşı Durumu */}
      <Section title="Aşı Durumu">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.keys(initAsi).map(k => (
            <CheckBox key={k} label={asiLabels[k]} checked={asi[k]} onChange={() => toggleAsi(k)} />
          ))}
        </div>
      </Section>

      {/* Şikayet */}
      <Section title="Hastanın Şikayeti">
        <textarea value={sikayet} onChange={e => setSikayet(e.target.value)} rows={3}
          placeholder="Hayvan sahibinin ifadesiyle şikayeti yazın..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </Section>

      {/* Sistem Bulguları */}
      <Section title={`Sistem Bulguları ${pozitifSayisi > 0 ? `(${pozitifSayisi} pozitif)` : ''}`}>
        <div className="space-y-5">
          {sistemGruplari.map(grup => (
            <div key={grup.baslik}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{grup.baslik}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {grup.keys.map(k => (
                  <CheckBox key={k} label={sistemLabels[k]} checked={sistem[k]} onChange={() => toggleSistem(k)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Fiziksel Muayene */}
      <Section title="Fiziksel Muayene Bulguları">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <Select label="Genel Durum" value={fiziksel.genel_durum} onChange={(v: string) => setF('genel_durum', v)}
            options={['Alert', 'Depresif', 'Stupor', 'Komatöz', 'Hiperestezik']} />
          <Select label="Göz Muayenesi" value={fiziksel.goz_muayenesi} onChange={(v: string) => setF('goz_muayenesi', v)}
            options={['Normal', 'Akıntı', 'Kanlanma', 'Refleks yok']} />
          <Select label="Gözlerin Orbitaya Çökmesi" value={fiziksel.gozler_orbitaya_cokme} onChange={(v: string) => setF('gozler_orbitaya_cokme', v)}
            options={['Yok', '2-4 mm', '4-6 mm', '6-8 mm']} />
          <Select label="Mukoza Rengi" value={fiziksel.mukoza_rengi} onChange={(v: string) => setF('mukoza_rengi', v)}
            options={['Normal', 'Anemik', 'Hiperemik', 'İkterik', 'Siyanotik']} />
          <Select label="Mukoza Nemliliği" value={fiziksel.mukoza_nemliligi} onChange={(v: string) => setF('mukoza_nemliligi', v)}
            options={['Normal (Nemli)', 'Kuru', 'Sulu']} />
          <Input label="CRT (sn)" value={fiziksel.crt} onChange={(v: string) => setF('crt', v)} placeholder="ör. 2" />
          <Select label="Deri Turgoru" value={fiziksel.deri_turgoru} onChange={(v: string) => setF('deri_turgoru', v)}
            options={['Normal', 'Hafif azalmış', 'Belirgin azalmış']} />
          <Select label="Dehidrasyon" value={fiziksel.dehidrasyon} onChange={(v: string) => setF('dehidrasyon', v)}
            options={['<%5', '%5', '%6-8', '%8-10', '%10-12']} />
          <Select label="Lenf Nodülleri" value={fiziksel.lenf_nodulleri} onChange={(v: string) => setF('lenf_nodulleri', v)}
            options={['Normal', 'Ağrılı', 'Büyük', 'Isı artışı']} />
          <Select label="Batın Palpasyonu" value={fiziksel.batin_palpasyonu} onChange={(v: string) => setF('batin_palpasyonu', v)}
            options={['Normal', 'Gerginlik', 'Ağrı', 'Hassasiyet', 'Asites']} />
          <Select label="Periferal Sıcaklık" value={fiziksel.periferal_sicaklik} onChange={(v: string) => setF('periferal_sicaklik', v)}
            options={['Normal', 'Soğuk', 'Çok Soğuk', 'Sıcak']} />
          <Select label="Kardiyak Oskültasyon" value={fiziksel.kardiyak_oskultasyon} onChange={(v: string) => setF('kardiyak_oskultasyon', v)}
            options={['Normal', 'Aritmi', 'Üfürüm', 'Arrest']} />
          <Select label="Pulmoner Oskültasyon" value={fiziksel.pulmoner_oskultasyon} onChange={(v: string) => setF('pulmoner_oskultasyon', v)}
            options={['Normal', 'Raller', 'Ronküsler', 'Stridor', 'Wheezing', 'Arrest', 'Plevral Frotman']} />
        </div>
      </Section>

      {/* Vital Bulgular */}
      <Section title="Vital Bulgular">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input label="Vücut Sıcaklığı (°C)" value={vital.vucut_sicakligi} onChange={(v: string) => setV('vucut_sicakligi', v)} placeholder="ör. 38.5" />
          <Input label="Nabız (/dk)" value={vital.nabiz} onChange={(v: string) => setV('nabiz', v)} placeholder="ör. 120" />
          <Input label="Solunum Sayısı (/dk)" value={vital.solunum_sayisi} onChange={(v: string) => setV('solunum_sayisi', v)} placeholder="ör. 24" />
          <Input label="Tansiyon" value={vital.tansiyon} onChange={(v: string) => setV('tansiyon', v)} placeholder="ör. 120/80" />
        </div>
      </Section>

      {/* Tedavi Geçmişi */}
      <Section title="Tedavi Geçmişi" defaultOpen={false}>
        <textarea value={tedaviGecmisi} onChange={e => setTedaviGecmisi(e.target.value)} rows={2}
          placeholder="Daha önce kullandığı ilaçlar, uygulanan tedaviler..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </Section>

      {/* AI Analiz Butonu */}
      <div className="flex justify-center my-6">
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:from-blue-800 hover:to-indigo-800 disabled:opacity-60 shadow-lg transition">
          {mutation.isPending
            ? <><Loader size={18} className="animate-spin" /> Analiz ediliyor...</>
            : <><Sparkles size={18} /> AI ile Analiz Et</>}
        </button>
      </div>

      {/* AI Sonucu */}
      {result && (
        <div id="ai-result" className="space-y-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">AI Analiz Sonucu</h2>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h3 className="font-semibold text-green-800 mb-2">🐾 Hayvan Sahibi İçin (Sade Dil)</h3>
            <p className="text-green-900 text-sm leading-relaxed">{result.halk_dili}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-800 mb-2">🩺 Veteriner Hekim Değerlendirmesi</h3>
            <pre className="text-blue-900 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.hekim_dili}</pre>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <h3 className="font-semibold text-purple-800 mb-2">🔬 Önerilen Tetkikler</h3>
            <pre className="text-purple-900 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.onerilen_tetkikler}</pre>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs">{result.uyari}</p>
          </div>
        </div>
      )}

      {mutation.isError && (
        <p className="text-center text-red-500 text-sm mt-4">Analiz sırasında hata oluştu. Tekrar deneyin.</p>
      )}
    </div>
  )
}
