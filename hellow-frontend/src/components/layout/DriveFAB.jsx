import { useNavigate } from 'react-router-dom'
import { HardDrive } from 'lucide-react'

export function DriveFAB() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/drive')}
      title="Drive"
      className="fixed bottom-6 right-16 w-14 h-14 bg-[#1A1A1A] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-10 cursor-pointer group"
    >
      <HardDrive size={24} />
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#1A1A1A] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Drive
      </span>
    </button>
  )
}
