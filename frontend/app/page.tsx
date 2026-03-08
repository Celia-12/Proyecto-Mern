"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiciosPage } from "@/components/pages/servicios-page"
import { SociosPage } from "@/components/pages/socios-page"
import { CotizacionPage } from "@/components/pages/cotizacion-page"
import { LoginPage } from "@/components/pages/login-page"
import { PerfilClientePage } from "@/components/pages/perfil-cliente-page"
import { PerfilEspecialistaPage } from "@/components/pages/perfil-especialista-page"
import { QuienesPage } from "@/components/pages/quienes-page"
import type { CartItem, Specialist } from "@/lib/types"

export default function Page() {
  const [activePage, setActivePage] = useState("servicios")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"cliente" | "especialista">("cliente")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)

  const handleNavigate = (page: string) => {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLogin = (type: "cliente" | "especialista") => {
    setIsLoggedIn(true)
    setUserType(type)
    setActivePage("perfil")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserType("cliente")
    setActivePage("servicios")
  }

  const addToCart = useCallback((specialist: Specialist) => {
    setCart((prev) => {
      if (prev.some((item) => item.specialist.id === specialist.id)) return prev
      return [...prev, { specialist, addedAt: new Date().toISOString() }]
    })
  }, [])

  const removeFromCart = useCallback((specialistId: string) => {
    setCart((prev) => prev.filter((item) => item.specialist.id !== specialistId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userType={userType}
        cartCount={cart.length}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activePage === "servicios" && (
          <ServiciosPage
            onNavigate={handleNavigate}
            onSelectCategory={(category: string) => {
              setSelectedCategory(category)
              handleNavigate("socios")
            }}
          />
        )}
        {activePage === "socios" && (
          <SociosPage
            onNavigate={handleNavigate}
            onAddToCart={addToCart}
            cart={cart}
            isLoggedIn={isLoggedIn}
            initialCategory={selectedCategory}
          />
        )}
        {activePage === "cotizacion" && (
          <CotizacionPage
            cart={cart}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            isLoggedIn={isLoggedIn}
            onNavigate={handleNavigate}
          />
        )}
        {activePage === "login" && <LoginPage onLogin={handleLogin} />}
        {activePage === "perfil" && userType === "cliente" && (
          <PerfilClientePage onNavigate={handleNavigate} />
        )}
        {activePage === "perfil" && userType === "especialista" && <PerfilEspecialistaPage />}
        {activePage === "quienes" && <QuienesPage />}
      </main>

      <Footer />
    </div>
  )
}
