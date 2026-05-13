"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { t, type Lang } from "@/lib/translations"
import { createClient } from "@/lib/supabase/client"

type Tab = "login" | "register" | "reset"

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "login_error_password_length"
  if (!/[a-z]/.test(pw)) return "login_error_password_lowercase"
  if (!/[A-Z]/.test(pw)) return "login_error_password_uppercase"
  if (!/[0-9]/.test(pw)) return "login_error_password_digit"
  if (!/[^a-zA-Z0-9]/.test(pw)) return "login_error_password_special"
  return null
}

function isRecoveryUrl(): boolean {
  if (typeof window === "undefined") return false
  const hash = window.location.hash
  return hash.includes("type=recovery") || hash.includes("type=invite")
}

export default function LoginPage() {
  const auth = useAuth()
  const [lang, setLang] = useState<Lang>("de")
  const [tab, setTab] = useState<Tab>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null
    if (stored === "de" || stored === "en") setLang(stored)
    if (isRecoveryUrl()) {
      setIsRecovery(true)
      setTab("reset")
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (auth.mode.type === "authenticated" && !isRecovery) {
      window.location.href = "/dashboard"
    }
    if (auth.mode.type === "recovery") {
      setIsRecovery(true)
      setTab("reset")
    }
  }, [auth.mode, isRecovery])

  if (!loaded) {
    return <div className="flex min-h-screen items-center justify-center" style={{ background: "#e8eef3", color: "#999" }}>Laden...</div>
  }

  const tr = (key: string) => t(key, lang)
  const setLangAndStore = (l: Lang) => {
    setLang(l)
    localStorage.setItem("lang", l)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) { setError(tr("login_error_required")); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(tr("login_error_email")); return
    }

    if (tab === "reset") {
      if (isRecovery) {
        const pwErr = validatePassword(password)
        if (pwErr) { setError(tr(pwErr)); return }
        setSubmitting(true)
        const err = await auth.updatePassword(password)
        setSubmitting(false)
        if (err) { setError(err.message); return }
        setSuccess(tr("login_password_updated"))
        setTimeout(() => { window.location.href = "/login" }, 2000)
      } else {
        setSubmitting(true)
        const err = await auth.resetPassword(email)
        setSubmitting(false)
        if (err) { setError(err.message); return }
        setSuccess(tr("login_reset_sent"))
        setEmail("")
      }
      return
    }

    if (!password) { setError(tr("login_error_required")); return }

    if (tab === "register") {
      const pwErr = validatePassword(password)
      if (pwErr) { setError(tr(pwErr)); return }
    } else if (password.length < 6) {
      setError(tr("login_error_password")); return
    }

    setSubmitting(true)
    const err = tab === "login"
      ? await auth.signIn(email, password)
      : await auth.signUp(email, password)
    setSubmitting(false)

    if (err) { setError(err.message); return }

    if (tab === "register") {
      setSuccess(tr("login_confirm_email"))
      setPassword("")
    }
  }

  const btnLabel = isRecovery
    ? tr("login_save_password")
    : tab === "reset" ? tr("login_reset")
    : tab === "login" ? tr("login_submit_login")
    : tr("login_submit_register")

  const showForm = isRecovery || tab !== "reset"

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), center/cover url('/img/body_background_two.jpg') #e8eef3", zIndex: -1 }} />
      <nav className="navbar">
        <div className="nav-left">
          <img src="/img/logo-compact.svg" alt="GSC Logo" className="nav-logo" />
        </div>
        <div className="nav-links" id="navLinks" style={{ display: menuOpen ? "flex" : undefined }}>
          <a href="/" data-i18n="navbar_home">Home</a>
          <a href="/about.html" data-i18n="navbar_about">Über mich</a>
          <a href="/nachhilfe.html" data-i18n="navbar_services">Nachhilfe &amp; Studium</a>
          <a href="/consulting.html" data-i18n="navbar_consulting">Beratung &amp; Datenanalyse</a>
          <a href="/login" data-i18n="navbar_login" style={{ color: "var(--orange)" }}>Login</a>
        </div>
        <div className="nav-right">
          <div className="nav-lang">
            <button className={`lang-btn ${lang === "de" ? "active-lang" : ""}`} data-lang="de" onClick={() => setLangAndStore("de")}>DE</button>
            <span className="lang-separator">|</span>
            <button className={`lang-btn ${lang === "en" ? "active-lang" : ""}`} data-lang="en" onClick={() => setLangAndStore("en")}>EN</button>
          </div>
          <div className="burger" id="burger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-inner">
          <div className="hero-brand"></div>
          <div className="hero-content">
            <div className="hero-action">
              <span className="hero-scrolled-text" data-i18n="hero_login">Login – Kundenbereich</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div className="section-spacer" style={{ marginTop: "150px" }}></div>

        <section className="login-content" id="authSection">
          {!isRecovery && tab !== "reset" && (
            <div className="login-tabs">
              <button className={`login-tab ${tab === "login" ? "active" : ""}`} data-login-tab="login" onClick={() => { setTab("login"); setError(""); setSuccess("") }}>{tr("login_tab_login")}</button>
              <button className={`login-tab ${tab === "register" ? "active" : ""}`} data-login-tab="register" onClick={() => { setTab("register"); setError(""); setSuccess("") }}>{tr("login_tab_register")}</button>
            </div>
          )}

          <form className="login-form" id="authForm" onSubmit={handleSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr("login_email_placeholder")} required autoComplete={isRecovery ? "off" : "email"} />
            {showForm && (
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isRecovery ? tr("login_new_password") : tr("login_password_placeholder")} required autoComplete={isRecovery ? "new-password" : tab === "login" ? "current-password" : "new-password"} />
            )}
            <p className="login-error">{error || "\u00A0"}</p>
            <p className="login-success">{success || "\u00A0"}</p>
            <button type="submit" className="btn" disabled={submitting}>{submitting ? "..." : btnLabel}</button>
          </form>

          <p className="login-info">
            {isRecovery ? (
              <a style={{ cursor: "pointer" }} onClick={() => { setTab("login"); setIsRecovery(false); setError(""); setSuccess("") }}>{tr("login_back_to_login")}</a>
            ) : tab === "reset" ? (
              <a style={{ cursor: "pointer" }} onClick={() => { setTab("login"); setError(""); setSuccess("") }}>{tr("login_back_to_login")}</a>
            ) : (
              <>
                <span>{tab === "login" ? tr("login_info_text") : tr("login_info_text_alt")} </span>
                <a style={{ cursor: "pointer" }} onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); setSuccess("") }}>{tab === "login" ? tr("login_info_link") : tr("login_info_link_alt")}</a>
              </>
            )}
          </p>

          {tab === "login" && !isRecovery && (
            <p className="login-info" id="forgotPasswordRow">
              <a style={{ cursor: "pointer" }} onClick={() => { setTab("reset"); setError(""); setSuccess("") }}>{tr("login_forgot_password")}</a>
            </p>
          )}
        </section>
      </main>

      <footer>
        <div>
          <div className="chr-footer__social__container">
            <h3 className="chr-footer__social__title chr-headline-6">{tr("footer_social_title")}</h3>
            <ul className="chr-footer__social__list">
              <li>
                <a href="https://www.youtube.com/user/@meinuser" aria-label="YouTube" target="_blank" rel="noopener noreferrer nofollow" className="social-btn youtube">
                  <img src="/img/youtube_icon.svg" alt="YouTube" />
                  <title>YouTube</title>
                </a>
              </li>
              <li>
                <a href="https://de.linkedin.com/in/glockconsulting" aria-label="linkedin" target="_blank" rel="noopener noreferrer nofollow" className="social-btn linkedin">
                  <img src="/img/linkedin_icon.svg" alt="LinkedIn" />
                  <title>LinkedIn</title>
                </a>
              </li>
            </ul>
          </div>
          <div className="section-divider"></div>
          <div className="footer-spacer">
            <ul className="chr-footer__list">
              <li><p>Kevin Glock Statistical Consulting Services | GSC</p></li>
              <li className="footer-legal">
                <a href="/impressum.html" className="footer-link">{tr("footer_impressum")}</a>
                <span className="footer-sep">|</span>
                <a href="/datenschutz.html" className="footer-link">{tr("footer_datenschutz")}</a>
              </li>
              <li><p>Handcrafted with ❤️</p></li>
            </ul>
          </div>
        </div>
      </footer>

      <div className="bg-band band-1"></div>
      <div className="bg-band band-2"></div>
      <div className="bg-band band-3"></div>
    </div>
  )
}