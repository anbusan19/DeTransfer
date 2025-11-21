import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackgroundEffect from '@/components/BackgroundEffect'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'DeTransfer - Zero-Knowledge File Sharing',
  description: 'Private, Decentralized and Trustless - Anonymous & Zero-Knowledge File Sharing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="relative min-h-screen text-white font-sans selection:bg-eco-accent/30 selection:text-white" suppressHydrationWarning>
        <BackgroundEffect />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}

