// ===========================================
// CONFIGURACIÓN
// ===========================================
const CONFIG = {
  EMAILJS_PUBLIC_KEY: "TU_PUBLIC_KEY_DE_EMAILJS",
  EMAILJS_SERVICE_ID: "TU_SERVICE_ID_EMAILJS",
  EMAILJS_TEMPLATE_ID: "TU_TEMPLATE_ID_EMAILJS",
  SHEET_WEBAPP_URL: "https://v1.nocodeapi.com/terrys/google_sheets/uDagEZxEUFBxCNuz"
};

// Inicializar EmailJS
emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);

// ===========================================
// VARIABLES GLOBALES
// ===========================================
const form = document.getElementById("vote-form");
const emailInput = document.getElementById("email");
const consentInput = document.getElementById("consent");
const confirmBtn = document.getElementById("confirm");
let selectedBurger = null;

// ===========================================
// MANEJO DE SELECCIÓN DE HAMBURGUESA
// ===========================================
document.querySelectorAll(".burger-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".burger-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedBurger = card.dataset.burger;
    document.getElementById("vote-form").classList.remove("hidden");
    document.getElementById("vote-form").scrollIntoView({ behavior: "smooth" });
  });
});

// ===========================================
// ENVÍO DEL FORMULARIO
// ===========================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const consent = consentInput.checked;

  if (!selectedBurger) {
    alert("Por favor elegí una hamburguesa antes de confirmar tu voto.");
    return;
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    alert("Por favor ingresá un e-mail válido.");
    return;
  }

  const voteId = "TB" + Date.now().toString().slice(-6);

  // Datos que se envían al Sheet (en una nueva fila)
  const payload = {
    data: [[
      new Date().toISOString(),
      email,
      selectedBurger,
      voteId,
      navigator.userAgent
    ]]
  };

  try {
    // Enviar datos al Google Sheet usando NoCodeAPI
    const res = await fetch(CONFIG.SHEET_WEBAPP_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    data: [
      [
        new Date().toISOString(),
        email,
        selectedBurger,
        voteId,
        navigator.userAgent
      ]
    ]
  })
});

    if (!res.ok) throw new Error("Error al enviar datos a Sheets");
    const data = await res.json();

    // Enviar mail con EmailJS (si marcó consentimiento)
    if (consent) {
      await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, {
        to_email: email,
        burger: selectedBurger,
        voteId: voteId
      });
    }

    alert(`¡Gracias por votar por ${selectedBurger}! 🍔\nTu número de participación es ${voteId}.`);
    form.reset();
    document.querySelectorAll(".burger-card").forEach(c => c.classList.remove("active"));
    document.getElementById("vote-form").classList.add("hidden");
    selectedBurger = null;

  } catch (err) {
    console.error("Error:", err);
    alert("No pudimos registrar el voto. Intentá de nuevo en unos minutos.");
  }
});
