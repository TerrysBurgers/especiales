# Terry’s Burgers — Landing de Votación (QR)

Este paquete incluye la landing para votar entre 5 hamburguesas, registrar e‑mail en Google Sheets y enviar por e‑mail el número de participación.

## 📁 Archivos
- `index.html` — Estructura de la página.
- `style.css` — Estilo retro en blanco y negro, responsive.
- `script.js` — Lógica de selección, validación, envío a Sheets y e‑mail.
- `assets/logo.png` — Reemplazalo por tu logo.
- `google_apps_script.js` — Backend sin servidor para registrar votos en Google Sheets.

---

## 🚀 Pasos para ponerlo a funcionar

### 1) Subí los archivos a tu hosting o GitHub Pages
- Podés usar Netlify, Vercel, Cloudflare Pages o GitHub Pages.
- La URL resultante será la que vas a poner en el QR.

### 2) Configurar Google Sheets (base de datos de votos)
1. En tu Google Drive, creá una Hoja llamada por ejemplo **TERRYS_VOTES**.
2. En la fila 1 poné estas columnas: `Timestamp | Email | Burger | VoteId | UserAgent | IP`.
3. Menú **Extensiones → Apps Script**. Pegá el contenido de `google_apps_script.js` y guardá.
4. **Deploy → New deployment → Web app**.
   - **Execute as:** *Me*.
   - **Who has access:** *Anyone* (o *Anyone with the link*).
5. Copiá la **URL del Web App** y en `script.js` reemplazá `SHEET_WEBAPP_URL` con esa URL.

> El backend valida e‑mail, evita votos duplicados por e‑mail y guarda cada entrada con fecha y número de participación.

### 3) Configurar EmailJS (envío del e‑mail al votante)
1. Creá una cuenta en **EmailJS** (gratuito para volumen bajo).
2. Agregá un **Email Service** (Gmail/SMTP).
3. Creá un **Email Template** con variables: `to_email`, `burger`, `voteId`.
   - Asunto sugerido: `Tu voto en Terry’s Burgers — {{voteId}}`.
   - Cuerpo sugerido:
     ```
     ¡Gracias por votar por la {{burger}}! 
     Tu número de participación es {{voteId}}.
     Seguí el sorteo en Instagram: @terrysburgersbarcelona
     ```
4. Copiá **Public Key**, **Service ID** y **Template ID**.
5. En `script.js` reemplazá `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID` y `EMAILJS_TEMPLATE_ID`.

### 4) Personalizar hamburguesas y estética
- En `index.html`, dentro de `<ul class="list">`, cambiá los nombres si querés.
- Reemplazá `assets/logo.png` por tu logo (mismo nombre de archivo).
- Estilos en `style.css`. Mantiene estética BN y funciona en modo oscuro.

### 5) Generar el código QR
- Usá cualquier generador de QR y apuntalo a la URL pública de tu landing.
- Consejo: activá **corrección de errores** alta para que escanee bien desde carteles.

### 6) Ver el ganador / exportar
- En Google Sheets: **Insertar → Tabla dinámica** para contar votos por *Burger*.
- O usá fórmula en una hoja nueva:
  ```
  =QUERY(TERRYS_VOTES!B2:D, "select C, count(C) group by C order by count(C) desc", 0)
  ```
  La columna C es *Burger*; ajustá si cambiaste columnas.

---

## 🔐 Privacidad / anti‑abuso
- Un voto por e‑mail. Si alguien intenta repetir, devuelve “duplicate”.
- Podés resetear duplicados borrando filas manualmente.
- Si querés permitir múltiples votos por e‑mail, quitá el chequeo en `google_apps_script.js`.

## ❓ Soporte rápido
- Si al enviar muestra error de Sheets: verificá que el **Web App URL** esté bien y con acceso “Anyone”.
- Si no llega el e‑mail: revisá las **credenciales de EmailJS** y la plantilla.
- Si el botón no se habilita: se necesita 1) elegir burger, 2) e‑mail válido, 3) tildar consentimiento.

¡Éxitos con la campaña! 🍔
