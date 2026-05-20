async function loadFeedback(containerId) {
  const el = document.getElementById(containerId)
  if (!el) { console.log("feedback: container not found"); return }

  try {
    const res = await fetch("/api/feedback/public")
    if (!res.ok) { console.log("feedback: API error", res.status); return }
    const data = await res.json()
    console.log("feedback: loaded", data.feedback?.length, "items")
    if (!data.feedback || data.feedback.length === 0) return

    const items = data.feedback.filter((f) => f.rating >= 3)
    console.log("feedback: filtered", items.length, "items (>=3 stars)")
    if (items.length === 0) return

    let html = `
      <style>
        #feedback-carousel { position:relative; overflow:hidden; margin:0 auto; }
        #feedback-track { display:flex; transition:transform .5s ease; gap:16px; }
        .f-card { flex:0 0 calc((100% - 32px)/3); min-width:0; background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:20px; box-sizing:border-box; }
        .f-stars { color:#f59e0b; font-size:18px; margin-bottom:8px; }
        .f-text { color:#334155; font-size:14px; line-height:1.5; margin:0; word-break:break-word; }
        .f-date { color:#94a3b8; font-size:11px; margin-top:10px; }
        #feedback-dots { text-align:center; margin-top:16px; display:flex; justify-content:center; gap:8px; }
        .f-dot { width:10px; height:10px; border-radius:50%; background:#d1d5db; border:none; cursor:pointer; padding:0; }
        .f-dot.active { background:#f59e0b; }
        @media (max-width:700px) { .f-card { flex:0 0 100%; } }
      </style>
      <div id="feedback-carousel">
        <div id="feedback-track">
    `

    items.forEach((f) => {
      html += `
        <div class="f-card">
          <div class="f-stars">${renderStars(f.rating)}</div>
          ${f.text ? `<p class="f-text">${escapeHtml(f.text)}</p>` : ""}
          <div class="f-date">${new Date(f.created_at).toLocaleDateString("de-DE")}</div>
        </div>
      `
    })

    html += `</div><div id="feedback-dots"></div></div>`
    el.innerHTML = html

    const track = document.getElementById("feedback-track")
    const dotsContainer = document.getElementById("feedback-dots")
    const isMobile = window.innerWidth <= 700
    const perPage = isMobile ? 1 : 3
    const totalSlides = Math.ceil(items.length / perPage)
    let current = 0

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("button")
      dot.className = "f-dot" + (i === 0 ? " active" : "")
      dot.addEventListener("click", () => goTo(i))
      dotsContainer.appendChild(dot)
    }

    function goTo(i) {
      current = i
      const gap = 16
      const cardWidth = track.children[0].offsetWidth
      const offset = -current * (cardWidth + gap) * perPage
      track.style.transform = `translateX(${offset}px)`
      dotsContainer.querySelectorAll(".f-dot").forEach((d, j) => d.className = "f-dot" + (j === current ? " active" : ""))
    }

    let interval = setInterval(() => goTo((current + 1) % totalSlides), 4000)

    const carousel = el.querySelector("#feedback-carousel")
    if (carousel) {
      carousel.addEventListener("mouseenter", () => clearInterval(interval))
      carousel.addEventListener("mouseleave", () => { interval = setInterval(() => goTo((current + 1) % totalSlides), 4000) })
    }

    let lastPerPage = perPage
    window.addEventListener("resize", () => {
      const mob = window.innerWidth <= 700
      const pp = mob ? 1 : 3
      if (pp !== lastPerPage) {
        lastPerPage = pp
        clearInterval(interval)
        current = 0
        goTo(0)
        interval = setInterval(() => goTo((current + 1) % totalSlides), 4000)
      }
    })
  } catch (e) {
    console.log("feedback: error", e)
  }
}

function renderStars(n) {
  return "\u2605".repeat(n) + "\u2606".repeat(5 - n)
}

function escapeHtml(str) {
  const div = document.createElement("div")
  div.textContent = str
  return div.innerHTML
}
