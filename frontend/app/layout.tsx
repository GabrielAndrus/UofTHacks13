import './globals.css';

export const metadata = {
  title: 'Brick by Brick',
  description: 'Build your world, brick by brick',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">{children}</body>
    </html>
  )
}
