import { useState, useRef } from 'react'
import { adminService } from '@/services/adminService'
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle } from 'lucide-react'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleImport = async () => {
    if (!file) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await adminService.importExcel(file)
      setResult(res)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'İçe aktarma başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Excel / Veri İçe Aktarma</h2>
      <p className="text-gray-500 text-sm mb-6">VMD veya diğer kaynaklardan indirdiğiniz Excel dosyasını yükleyin.</p>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <FileSpreadsheet size={40} className="mx-auto text-gray-400 mb-3" />
          {file ? (
            <p className="text-blue-700 font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">Excel dosyası seçin</p>
              <p className="text-gray-400 text-xs mt-1">.xlsx veya .xls</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={e => { setFile(e.target.files?.[0] || null); setResult(null) }} />

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-700 mb-1">Beklenen sütunlar:</p>
          <p>ilac_adi, ticari_isimler, etken_maddeler, hedef_turler, kullanim_amaci, farmakolojik_sinif, yan_etkiler, kontrendikasyonlar, etkilesimler, doz_asimi_belirtileri, spc_url</p>
        </div>

        {error && <p className="mt-3 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button onClick={handleImport} disabled={!file || loading}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-2.5 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60">
          <Upload size={16} /> {loading ? 'Yükleniyor...' : 'İçe Aktar'}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" /> Sonuç
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Toplam Satır', value: result.total_rows, color: 'text-gray-700' },
              { label: 'Eklenen', value: result.inserted, color: 'text-green-600' },
              { label: 'Güncellenen', value: result.updated, color: 'text-blue-600' },
              { label: 'Atlanan', value: result.skipped, color: 'text-yellow-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
          {result.errors?.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-red-700 font-medium text-sm flex items-center gap-1 mb-2"><AlertCircle size={14} /> Hatalar</p>
              <ul className="space-y-1">
                {result.errors.map((e: string, i: number) => (
                  <li key={i} className="text-red-600 text-xs">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
