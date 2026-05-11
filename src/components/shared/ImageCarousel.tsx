import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { cx } from '@/lib/utils'

export default function ImageCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => { setIndex(0) }, [images.length])

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
        <ImageOff className="w-10 h-10 text-gray-300" />
      </div>
    )
  }

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  return (
    <div className="space-y-2">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
        <img src={images[index]} alt="" className="w-full h-full object-cover" />
        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <span key={i} className={cx('h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60')} />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button key={i} onClick={() => setIndex(i)}
              className={cx('flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition',
                i === index ? 'ring-2 ring-brand-600' : 'opacity-70 hover:opacity-100')}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
