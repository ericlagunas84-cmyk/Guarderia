/**
 * Aplica el nombre, logo y colores de marca guardados en `school_settings` (ver ajustes.html)
 * a los elementos marcados con data-brand-name / data-brand-logo, y reconfigura los tokens
 * de color "primary"/"secondary" de Tailwind en tiempo real.
 *
 * Nota honesta: esto recolorea los elementos que usan directamente los tokens `primary`/
 * `secondary` (botones, títulos, estados activos), no toda la paleta tonal de Material
 * (containers, variantes "on-*", etc.), que se generó a mano para el verde/azul originales.
 * Regenerar esa paleta completa a partir de un solo color requiere el algoritmo de color de
 * Material Design 3 — queda fuera de este cambio.
 *
 * Requiere que la página ya haya creado el cliente de Supabase en una variable global `sb`,
 * y que el <script id="tailwind-config"> de la página guarde su configuración en
 * `window.TAILWIND_CONFIG` (no solo en `tailwind.config`) para poder reasignarla después.
 */
(function () {
  function applyBrandName(name) {
    if (!name) return;
    document.querySelectorAll('[data-brand-name]').forEach(function (el) {
      el.textContent = name;
    });
  }

  function applyBrandLogo(url) {
    if (!url) return;
    document.querySelectorAll('[data-brand-logo]').forEach(function (img) {
      img.src = url;
    });
  }

  function applyBrandColors(primary, secondary) {
    if (!window.tailwind || !window.TAILWIND_CONFIG) return;
    if (!primary && !secondary) return;
    try {
      if (primary) window.TAILWIND_CONFIG.theme.extend.colors.primary = primary;
      if (secondary) window.TAILWIND_CONFIG.theme.extend.colors.secondary = secondary;
      // Reasignar (no solo mutar) es lo que hace que el Tailwind Play CDN recompile los
      // estilos ya presentes en la página con los nuevos valores.
      window.tailwind.config = window.TAILWIND_CONFIG;
    } catch (e) {
      console.warn('No se pudo aplicar el color de marca:', e);
    }
  }

  function loadSchoolBranding() {
    if (typeof sb === 'undefined' || !sb) return;
    sb.from('school_settings')
      .select('school_name, logo_url, primary_color, secondary_color')
      .eq('id', true)
      .maybeSingle()
      .then(function (res) {
        if (!res || res.error || !res.data) return;
        applyBrandName(res.data.school_name);
        applyBrandLogo(res.data.logo_url);
        applyBrandColors(res.data.primary_color, res.data.secondary_color);
      })
      .catch(function () {
        // Sin conexión o sin la tabla todavía: la página se queda con la marca fija por defecto.
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSchoolBranding);
  } else {
    loadSchoolBranding();
  }
})();
