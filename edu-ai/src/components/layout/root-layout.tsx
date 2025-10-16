import { Outlet } from 'react-router-dom'
import '../../index.css'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[#1B2023]">
      <Outlet />
    </div>
  )
}