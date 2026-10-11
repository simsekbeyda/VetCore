import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ownerService } from '@/services/ownerService'
import { ArrowLeft, AlertTriangle, ExternalLink, FlaskConical } from 'lucide-react'

function Section({ title, icon, content }: { title: string; icon: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-3">
        {icon} {title}
      </h3>
      <div className="text-gray-700 text-sm space-y-2">
        {content}
      </div>
    </div>
  )
}

export default function DrugDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: drug, isLoading } = useQuery({
    queryKey: ['owner-drug', id],
    queryFn: () => ownerService.getDrug(Number(id)),
  })

  if (isLoading) return <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
  if (!drug) return <div className="text-center py-16 text-red-400">İlaç bulunamadı.</div>

  return (
    <div className="p-6">
      {/* Geri Butonu */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6">
        <ArrowLeft size={16} /> Geri
      </button>

      {/* Uyarı */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 text-sm">Bu bilgiler yalnızca referans amaçlıdır. Veteriner hekiminizle ilaç kullanımı hakkında danışınız.</p>
      </div>

      {/* Başlık */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{drug.name}</h1>
        {drug.trade_names && <p className="text-gray-600 mt-2">{drug.trade_names}</p>}
        {drug.pharmacological_class && (
          <div className="mt-3">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{drug.pharmacological_class}</span>
          </div>
        )}
        {drug.spc_url && (
          <a href={drug.spc_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:underline text-sm">
            <ExternalLink size={14} /> Bilgi Sayfası
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol: Temel Bilgiler */}
        <div className="space-y-4">
          {/* Hayvan Türleri */}
          {drug.species && drug.species.length > 0 && (
            <Section
              title="Uygun Hayvan Türleri"
              icon={<span>🐾</span>}
              content={
                <div className="flex flex-wrap gap-2">
                  {drug.species.map((s: string, i: number) => (
                    <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              }
            />
          )}

          {/* Endikasyonlar */}
          {drug.indications && drug.indications.length > 0 && (
            <Section
              title="Kullanım Alanları"
              icon={<span>📋</span>}
              content={
                <ul className="space-y-1 list-disc list-inside">
                  {drug.indications.map((ind: string, i: number) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              }
            />
          )}

          {/* Etken Maddeler */}
          {drug.ingredients && drug.ingredients.length > 0 && (
            <Section
              title="Etken Maddeler"
              icon={<FlaskConical size={16} />}
              content={
                <ul className="space-y-1">
                  {drug.ingredients.map((ing: any, i: number) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{ing.name}</span> {ing.amount && `— ${ing.amount}`}
                    </li>
                  ))}
                </ul>
              }
            />
          )}
        </div>

        {/* Sağ: Uyarılar ve Önemli Bilgiler */}
        <div className="space-y-4">
          {/* Yan Etkiler */}
          {drug.side_effects && (
            <Section
              title="⚠️ Olabilecek Yan Etkiler"
              icon={<span>⚡</span>}
              content={<p className="text-sm leading-relaxed whitespace-pre-wrap">{drug.side_effects}</p>}
            />
          )}

          {/* Kontrendikasyonlar */}
          {drug.contraindications && (
            <Section
              title="🚫 Kullanılamayacak Durumlar"
              icon={<span>🛑</span>}
              content={<p className="text-sm leading-relaxed whitespace-pre-wrap">{drug.contraindications}</p>}
            />
          )}

          {/* Uyarılar */}
          {drug.warnings && (
            <Section
              title="⚠️ Önemli Uyarılar"
              icon={<span>⚠️</span>}
              content={<p className="text-sm leading-relaxed whitespace-pre-wrap">{drug.warnings}</p>}
            />
          )}
        </div>
      </div>

      {/* Alt Uyarı */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
        <p className="text-blue-800 text-sm">
          Herhangi bir sorunuz ya da kaygınız varsa, lütfen veteriner hekiminize başvurunuz.
        </p>
      </div>
    </div>
  )
}
