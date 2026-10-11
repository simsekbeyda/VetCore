import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ownerService } from '@/services/ownerService'
import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function DrugSearchInput({ value, onChange, placeholder = 'İlaç adı yazın...' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['drug-search-input', value],
    queryFn: () => ownerService.searchDrugs(value),
    enabled: value.length >= 2,
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      {open && data && data.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {data.map((drug: any) => (
            <button
              key={drug.id}
              type="button"
              onMouseDown={() => { onChange(drug.name); setOpen(false) }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
            >
              <p className="font-medium text-gray-800">{drug.name}</p>
              {drug.pharmacological_class && (
                <p className="text-xs text-gray-400">{drug.pharmacological_class}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
