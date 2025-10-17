// Terry’s Burgers — Votación
// Config: reemplazá estos valores
const CONFIG = {
  EMAILJS_PUBLIC_KEY: "TU_PUBLIC_KEY_DE_EMAILJS",
  EMAILJS_SERVICE_ID: "TU_SERVICE_ID_EMAILJS",
  EMAILJS_TEMPLATE_ID: "TU_TEMPLATE_ID_EMAILJS",
  SHEET_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbwcbE-dKAqT95Z0EoJ8hKNkgZ4nj4MXz4o7mICCT5mqs1I77lRoYN4fb-uZn6P0Aen4/exec" // URL del desplegado de Apps Script (doPost)
};

// Inicializa EmailJS
document.addEventListener("DOMContentLoaded", () => {
  if (window.emailjs && CONFIG.EMAILJS_PUBLIC_KEY !== "TU_PUBLIC_KEY_DE_EMAILJS") {
    emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
  }
});

const state = {
  burger: null,
  email: "",
  consent: false,
  voteId: null
};

// Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const emailOk = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

function genVoteId() {
  const n = Math.floor(Math.random()*90000)+10000; // 5 dígitos
  const y = new Date().getFullYear().toString().slice(-2);
  return `TB${y}-${n}`;
}

function enableSubmitIfReady(){
  const submit = $("#submit");
  const ok = !!state.burger && emailOk(state.email) && state.consent;
  if (ok) {
    submit.disabled = false;
    submit.classList.add("enabled");
    submit.style.cursor = "pointer";
  } else {
    submit.disabled = true;
    submit.classList.remove("enabled");
    submit.style.cursor = "not-allowed";
  }
}

// Selección de hamburguesa con imágenes
$$(".burger-card").forEach(card => {
  card.addEventListener("click", () => {
    $$(".burger-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    const burger = card.dataset.burger;
    state.burger = burger;
    $("#burger").value = burger;
    $("#helper").textContent = "Ingresá tu e-mail para confirmar el voto.";
    enableSubmitIfReady();
    // Scroll suave hasta el formulario
    document.querySelector("#vote-form").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

// Form
$("#email").addEventListener("input", (e)=>{
  state.email = e.target.value.trim();
  enableSubmitIfReady();
});
$("#consent").addEventListener("change", (e)=>{
  state.consent = !!e.target.checked;
  enableSubmitIfReady();
});

$("#form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  enableSubmitIfReady();
  if ($("#submit").disabled) return;

  state.voteId = genVoteId();
  const payload = {
    burger: state.burger,
    email: state.email,
    voteId: state.voteId,
    ua: navigator.userAgent,
    ts: new Date().toISOString()
  };

  // Guardar en Google Sheets (Apps Script)
  let saved = false;
  try{
    const res = await fetch(CONFIG.SHEET_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data?.status === "ok") saved = true;
    if (data?.error === "duplicate") {
      alert("Ese e‑mail ya votó. Si creés que es un error, contactanos.");
      return;
    }
  }catch(err){
    console.error(err);
    alert("No pudimos registrar el voto (Sheets). Intentá de nuevo en 1 minuto.");
    return;
  }

  // Enviar e‑mail con EmailJS
  let mailed = false;
  try{
    if (emailjs && CONFIG.EMAILJS_TEMPLATE_ID !== "TU_TEMPLATE_ID_EMAILJS") {
      await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, {
        to_email: state.email,
        burger: state.burger,
        voteId: state.voteId
      });
      mailed = true;
    }
  }catch(err){
    console.error(err);
  }

  // UI éxito
  if (saved){
    $("#voted-burger").textContent = state.burger;
    $("#vote-id").textContent = state.voteId;
    $("#success").classList.remove("hidden");
    $("#vote-form").classList.add("hidden");
    $("#choices").classList.add("hidden");
    $("#success").scrollIntoView({ behavior:"smooth", block:"start" });
    if (!mailed){
      alert("Tu voto está registrado. No pudimos enviar el e‑mail ahora; te llegará en breve o te lo reenviamos manualmente.");
    }
  }
});
