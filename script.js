// Terry’s Burgers — Votación (versión Supabase)
// ==============================================

// CONFIGURACIÓN
const CONFIG = {
  EMAILJS_PUBLIC_KEY: "TU_PUBLIC_KEY_DE_EMAILJS",
  EMAILJS_SERVICE_ID: "TU_SERVICE_ID_EMAILJS",
  EMAILJS_TEMPLATE_ID: "TU_TEMPLATE_ID_EMAILJS",
  SUPABASE_URL: "https://uprtbrtrdmligakzssoy.supabase.co", // <--- URL del proyecto Supabase
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcnRicnRyZG1saWdha3pzc295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzM5MzMsImV4cCI6MjA3NjMwOTkzM30.sLemQ_SxELedOjzYy_DVHcq20kM1dRvkWklyQUJABBA"               // <--- anon public key desde Settings → API
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
  const n = Math.floor(Math.random() * 90000) + 10000; // 5 dígitos
  const y = new Date().getFullYear().toString().slice(-2);
  return `TB${y}-${n}`;
}

function enableSubmitIfReady() {
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

// Formulario
$("#email").addEventListener("input", (e) => {
  state.email = e.target.value.trim();
  enableSubmitIfReady();
});
$("#consent").addEventListener("change", (e) => {
  state.consent = !!e.target.checked;
  enableSubmitIfReady();
});

// ==============================================
// PASO 5 — Envío de voto a SUPABASE
// ==============================================
async function saveVoteToSupabase(payload) {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/votes`;

  const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/NOMBRE_DE_TU_TABLA`, {
    method: "POST",
    headers: {
      "apikey": CONFIG.SUPABASE_KEY,
      "Authorization": `Bearer ${CONFIG.SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify([payload]) // se puede enviar un array de objetos o un objeto único
  });

  return res.ok;
}

// ==============================================
// Envío del formulario principal
// ==============================================
$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  enableSubmitIfReady();
  if ($("#submit").disabled) return;

  state.voteId = genVoteId();
  const payload = {
    email: state.email,
    burger: state.burger,
    vote_id: state.voteId,
    navegador: navigator.userAgent
  };

  // Guardar en Supabase
  let saved = false;
  try {
    saved = await saveVoteToSupabase(payload);
  } catch (err) {
    console.error("Error Supabase:", err);
    alert("No pudimos registrar el voto. Intentá de nuevo en 1 minuto.");
    return;
  }

  // Enviar e-mail con EmailJS
  let mailed = false;
  try {
    if (emailjs && CONFIG.EMAILJS_TEMPLATE_ID !== "TU_TEMPLATE_ID_EMAILJS") {
      await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, {
        to_email: state.email,
        burger: state.burger,
        voteId: state.voteId
      });
      mailed = true;
    }
  } catch (err) {
    console.error(err);
  }

  // UI éxito
  if (saved) {
    $("#voted-burger").textContent = state.burger;
    $("#vote-id").textContent = state.voteId;
    $("#success").classList.remove("hidden");
    $("#vote-form").classList.add("hidden");
    $("#choices").classList.add("hidden");
    $("#success").scrollIntoView({ behavior: "smooth", block: "start" });
    if (!mailed) {
      alert("Tu voto está registrado. No pudimos enviar el e-mail ahora; te llegará en breve o te lo reenviamos manualmente.");
    }
  } else {
    alert("Hubo un problema al guardar tu voto. Intentalo nuevamente.");
  }
});
