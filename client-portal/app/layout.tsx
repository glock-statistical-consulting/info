import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"

export const metadata: Metadata = {
  title: "GSC Client Portal",
  description: "Login – Kundenbereich",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="/style.css" />
        <link rel="icon" href="/img/favicon.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
