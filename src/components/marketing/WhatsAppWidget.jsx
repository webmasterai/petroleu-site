import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { websiteContent } from '../../content/websiteContent'

const WhatsAppGlyph = (props) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { whatsappNumber, whatsappMessage, name } = websiteContent.brand
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="mb-1 w-80 overflow-hidden rounded-2xl shadow-2xl border border-border bg-card">
          <div className="flex items-center gap-3 bg-[#25D366] px-4 py-4">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#25D366] bg-green-300" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{name} Support</p>
              <p className="text-xs text-white/80">Typically replies within minutes</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-[#ECE5DD] px-4 py-5">
            <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm">
              <p className="text-sm text-gray-800 leading-relaxed">
                Hi there! Welcome to <strong>{name}</strong>{' '}
                <span role="img" aria-label="wave">👋</span>
              </p>
              <p className="mt-1 text-sm text-gray-800 leading-relaxed">
                How can we help you with your petrol pump management needs?
              </p>
              <p className="mt-2 text-[10px] text-gray-400 text-right">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="bg-[#ECE5DD] px-4 pb-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#1ebe5d] transition-colors duration-200"
            >
              <WhatsAppGlyph className="h-5 w-5 fill-white" />
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:bg-[#1ebe5d] transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
        )}
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <WhatsAppGlyph className="h-7 w-7 fill-white" />
        )}
      </button>
    </div>
  )
}

export default WhatsAppWidget
