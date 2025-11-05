import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/AuthProvider'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quiz Manager - Hệ thống quản lý bài thi',
  description: 'Hệ thống quản lý và làm bài thi trực tuyến với Supabase Auth',
  keywords: 'quiz, exam, test, education, online learning',
  authors: [{ name: 'MiniMax Agent' }],
  openGraph: {
    title: 'Quiz Manager',
    description: 'Hệ thống quản lý bài thi trực tuyến',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}