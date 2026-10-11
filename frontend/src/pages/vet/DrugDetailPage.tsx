import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vetService } from '@/services/vetService'
import { ArrowLeft, Heart, ExternalLink, AlertTriangle, Zap, Ban, FlaskConical, Info, Calculator } from 'lucide-react'
import { useState } from 'react'
import AdvancedDoseCalculator from './AdvancedDoseCalculator'

export default function DrugDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showCalc, setShowCalc] = useState(false)

  const { data: drug, isLoading } = useQuery({
    queryKey: ['vet-drug', id],
    queryFn: () => vetService.getDrug(Number(id)),
  })

  const { data: favData } = useQuery({ queryKey: ['vet-favorites'], queryFn: vetService.getFavorites })
  const favIds = new Set<number>((favData || []).map((f: any) => f.id))
  const isFav = favIds.has(Number(id))

  const addFav = useMutation({ mutationFn: () => vetService.addFavorite(Number(id)), onSuccess: () => qc.invalidateQueries({ queryKey: ['vet-favorites'] }) })
  const remFav = useMutation({ mutationFn: () => vetService.removeFavorite(Number(id)), onSuccess: () => qc.invalidateQueries({ queryKey: ['vet-favorites'] }) })

  if (isLoading) return <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
  if (!drug) return <div className="text-center py-16 text-red-400">İlaç bulunamadı.</div>

  return (
    <div>
      {/* Üst Bar */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm">
          <ArrowLeft size={16} /> Geri
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCalc(s => !s)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Calculator size={15} /> Doz Hesapla
          </button>
          <button onClick={() => isFav ? remFav.mutate() : addFav.mutate()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition ${isFav ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
            {isFav ? 'Favoriden Çıkar' : 'Favoriye Ekle'}
          </button>
        </div>
      </div>

      {/* Gelişmiş Doz Hesaplama */}
      {showCalc && <AdvancedDoseCalculator drugName={drug.name} />}

      {/* Uyarı */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 text-sm">Bu bilgiler yalnızca referans amaçlıdır. Tanı koyma, tedavi planlama ve doz belirleme veteriner hekimin sorumluluğundadır.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sol: Genel Bilgiler */}
        <div className="lg:col-span-2 space-y-4">
          {/* Başlık */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h1 className="text-2xl font-bold text-gray-800">{drug.turkish_name ? `${drug.turkish_name} (${drug.name})` : drug.name}</h1>
            {drug.trade_names && <p className="text-gray-500 mt-1">{drug.trade_names}</p>}
            {drug.pharmacological_class && (
              <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{drug.pharmacological_class}</span>
            )}

            {drug.spc_url && (
              <a href={drug.spc_url} target="_blank" rel="noreferrer"
                className="mt-3 flex items-center gap-2 text-blue-600 hover:underline text-sm">
                <ExternalLink size={14} /> SPC Dokümanı Görüntüle
              </a>
            )}
          </div>

          {/* Etken Maddeler */}
          {drug.ingredients?.length > 0 && (
            <Section icon={<FlaskConical size={16} />} title="Etken Maddeler" color="indigo">
              <div className="flex flex-wrap gap-2">
                {drug.ingredients.map((ing: any, i: number) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    {ing.name}{ing.amount ? ` — ${ing.amount}` : ''}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Yan Etkiler */}
          {drug.side_effects && (
            <Section icon={<Zap size={16} />} title="Yan Etkiler" color="yellow">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{drug.side_effects}</p>
            </Section>
          )}

          {/* Kontrendikasyonlar */}
          {drug.contraindications && (
            <Section icon={<Ban size={16} />} title="Kontrendikasyonlar" color="red">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{drug.contraindications}</p>
            </Section>
          )}

          {/* Etkileşimler */}
          {drug.interactions && (
            <Section icon={<Info size={16} />} title="İlaç Etkileşimleri" color="orange">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{drug.interactions}</p>
            </Section>
          )}

          {/* Doz Aşımı */}
          {drug.overdose_symptoms && (
            <Section icon={<AlertTriangle size={16} />} title="Doz Aşımı Belirtileri" color="red">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{drug.overdose_symptoms}</p>
            </Section>
          )}

          {/* Uyarılar */}
          {drug.warnings && (
            <Section icon={<Info size={16} />} title="Uyarılar / Dikkat Edilecekler" color="gray">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{drug.warnings}</p>
            </Section>
          )}
        </div>

        {/* Sağ: Hedef Türler, Endikasyonlar, Kaynak */}
        <div className="space-y-4">
          {/* Hedef Türler */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Hedef Türler</h3>
            {drug.species?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {drug.species.map((s: any) => (
                  <span key={s.id} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{s.turkish_name || s.name}</span>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">Belirtilmemiş</p>}
          </div>

          {/* Endikasyonlar */}
          {drug.indications?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Endikasyonlar</h3>
              <div className="flex flex-wrap gap-2">
                {drug.indications.map((i: any) => (
                  <span key={i.id} className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs">{i.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Kaynak */}
          {drug.source && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Kaynak</h3>
              <p className="text-gray-600 text-xs">{drug.source.name}</p>
              {drug.source.url && (
                <a href={drug.source.url} target="_blank" rel="noreferrer"
                  className="text-blue-500 hover:underline text-xs flex items-center gap-1 mt-1">
                  <ExternalLink size={11} /> Kaynağa Git
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, color, children }: any) {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-600', yellow: 'text-yellow-600', red: 'text-red-600',
    orange: 'text-orange-600', gray: 'text-gray-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className={`flex items-center gap-2 font-semibold text-sm mb-3 ${colors[color] || 'text-gray-700'}`}>
        {icon} {title}
      </h3>
      {children}
    </div>
  )
}
