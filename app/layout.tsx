import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dharwin Job Scrapper - LinkedIn Jobs Dashboard',
  description: 'Search and filter LinkedIn job listings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
