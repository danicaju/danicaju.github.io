/* danicaju.github.io — motion y UX sin dependencias.
   Mejora progresiva: sin JS la página es completa (el estimador viene calculado y la FAQ abierta).
   Todo se inicializa una sola vez; los IntersectionObserver se desconectan cuando terminan. */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionOn = root.classList.contains('js-motion');
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hasIO = 'IntersectionObserver' in window;
  function reduced() { return reduceMQ.matches; }

  var WA_PHONE = '34637621315';

  // ------------------------------------------------------------------
  // Estimador: cálculo (misma configuración y fórmulas que la versión anterior)
  // ------------------------------------------------------------------
  var MODALITIES = {
    'presencial':     { rate: 15, name: 'Presencial a Domicilio', duo: false },
    'online':         { rate: 13, name: 'Online Interactiva',      duo: false },
    'duo-presencial': { rate: 12, name: 'Dúo Presencial',          duo: true  },
    'duo-online':     { rate: 10, name: 'Dúo Online',              duo: true  }
  };
  var NBSP = ' ';

  function eurMsg(n) { return n.toFixed(2).replace('.', ',') + '€'; }
  function eurScreen(n) { return n.toFixed(2).replace('.', ',') + NBSP + '€'; }
  function fmtHoursWeek(h) {
    var s = h.toFixed(1).replace('.0', '').replace('.', ',');
    return s + ' ' + (h === 1 ? 'hora' : 'horas') + ' / semana';
  }

  function compute(modality, days, duration, level) {
    var mod = MODALITIES[modality] || MODALITIES.presencial;
    var hours = Math.round(days * duration * 10) / 10;
    var weekly = mod.rate * hours;
    var monthly = weekly * 4;
    var hDisp = hours.toFixed(1).replace('.0', '').replace('.', ',');
    var durDisp = duration.toFixed(1).replace('.0', '').replace('.', ',');
    var isBach = level.indexOf('Bachillerato') !== -1;
    var dayWord = days === 1 ? 'día' : 'días';
    var duoText = mod.duo ? ' (por alumno)' : '';
    var extra = isBach
      ? ' Me gustaría consultar disponibilidad de temario y horarios.'
      : ' ¿Qué horarios tendrías libres?';
    var message = '¡Hola Daniel! He visto tu web de clases de matemáticas. ' +
      'Me gustaría consultar disponibilidad para ' + level + ' en modalidad ' + mod.name + ', ' +
      'con ' + days + ' ' + dayWord + ' a la semana (' + durDisp + 'h por sesión, total ' + hDisp +
      'h/semana; estimado mensual: ' + eurMsg(monthly) + duoText + ').' + extra;
    return {
      mod: mod, hours: hours, weekly: weekly, monthly: monthly, durDisp: durDisp,
      isBach: isBach, dayWord: dayWord, message: message,
      url: 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(message)
    };
  }
  window.__estimador = { compute: compute };

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function initEstimator() {
    var form = document.getElementById('est-form');
    if (!form) return;

    var out = {
      mod: document.getElementById('o-mod'),
      freq: document.getElementById('o-freq'),
      hours: document.getElementById('o-hours'),
      week: document.getElementById('o-week'),
      month: document.getElementById('o-month'),
      msg: document.getElementById('o-msg'),
      wa: document.getElementById('est-wa'),
      bach: document.getElementById('bach-notice')
    };
    var shown = 120;        // importe mensual mostrado (coincide con el HTML por defecto)
    var rafId = 0;
    var currentMessage = '';

    // Interpolación rápida del importe (solo texto; no cambia el layout gracias a tabular-nums)
    function tweenMonthly(to) {
      if (rafId) cancelAnimationFrame(rafId);
      if (reduced() || shown === to) { shown = to; out.month.textContent = eurScreen(to); return; }
      var from = shown, start = null, dur = 220;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        shown = from + (to - from) * easeOut(t);
        out.month.textContent = eurScreen(t < 1 ? shown : to);
        if (t < 1) rafId = requestAnimationFrame(step);
        else { shown = to; rafId = 0; }
      }
      rafId = requestAnimationFrame(step);
    }

    // Pulso sutil de confirmación sobre el mensaje (Web Animations API, solo opacidad)
    function pulse(el) {
      if (reduced() || !el.animate) return;
      el.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    }

    function render(animate) {
      var level = form.elements.nivel.value;
      var days = parseInt(form.elements.dias.value, 10);
      var r = compute(form.elements.modalidad.value, days, parseFloat(form.elements.duracion.value), level);
      out.mod.textContent = r.mod.name;
      out.freq.textContent = days + ' ' + r.dayWord + ' / semana (' + r.durDisp + ' h por clase)';
      out.hours.textContent = fmtHoursWeek(r.hours);
      out.week.textContent = eurScreen(r.weekly) + ' / semana' + (r.mod.duo ? ' por alumno' : '');
      currentMessage = r.message;
      out.msg.textContent = '«' + r.message + '»';
      out.wa.href = r.url;
      out.bach.hidden = !r.isBach;
      if (animate) { tweenMonthly(r.monthly); pulse(out.msg); }
      else { shown = r.monthly; out.month.textContent = eurScreen(r.monthly); }
    }

    form.addEventListener('change', function () { render(true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    // "Calcular cuota mensual" de las tarifas preselecciona la modalidad.
    document.querySelectorAll('[data-modalidad]').forEach(function (a) {
      a.addEventListener('click', function () {
        var radio = form.querySelector('input[name="modalidad"][value="' + a.dataset.modalidad + '"]');
        if (radio) { radio.checked = true; render(true); }
      });
    });

    // Copiar mensaje con confirmación inline
    var copyBtn = document.getElementById('est-copy');
    var copyLabel = document.getElementById('est-copy-label');
    var copyIcon = document.getElementById('est-copy-icon');
    var copyStatus = document.getElementById('est-copy-status');
    var copyTimer = 0;

    function legacyCopy(t) {
      return new Promise(function (resolve, reject) {
        var ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      });
    }
    function copyText(t) {
      if (navigator.clipboard && window.isSecureContext) {
        // Si el portapapeles asíncrono se rechaza (permisos, foco), se prueba el método clásico.
        return navigator.clipboard.writeText(t).catch(function () { return legacyCopy(t); });
      }
      return legacyCopy(t);
    }
    function feedback(text, status, icon) {
      copyLabel.textContent = text;
      copyStatus.textContent = status;
      copyIcon.setAttribute('href', icon);
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () {
        copyLabel.textContent = 'Copiar mensaje';
        copyStatus.textContent = '';
        copyIcon.setAttribute('href', '#i-copy');
      }, 1600);
    }
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyText(currentMessage).then(
          function () { feedback('Copiado', 'Mensaje copiado al portapapeles', '#i-check'); },
          function () { feedback('No se pudo copiar', 'No se pudo copiar el mensaje', '#i-copy'); }
        );
      });
    }

    render(false);
  }

  // ------------------------------------------------------------------
  // Scroll reveal (una sola vez por bloque; el hero queda fuera)
  // ------------------------------------------------------------------
  function revealEl(el) {
    if (el.hasAttribute('data-reveal-group')) {
      Array.prototype.forEach.call(el.children, function (c, i) {
        c.style.setProperty('--reveal-delay', Math.min(i * 60, 240) + 'ms');
        c.classList.add('is-in');
      });
    } else {
      el.classList.add('is-in');
    }
  }

  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal],[data-reveal-group]'));
    if (!els.length) return;
    if (!motionOn || reduced() || !hasIO) { els.forEach(revealEl); return; }
    var pending = els.length;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        revealEl(en.target);
        io.unobserve(en.target);
        pending--;
      });
      if (pending <= 0) io.disconnect();
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ------------------------------------------------------------------
  // Header reactivo (centinela de 12 px) y scrollspy
  // ------------------------------------------------------------------
  function initHeader() {
    var header = document.querySelector('.site-header');
    var sentinel = document.getElementById('top-sentinel');
    if (header && sentinel && hasIO) {
      new IntersectionObserver(function (entries) {
        header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
      }).observe(sentinel);
    }

    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-desktop a[href^="#"], .menu-panel a[href^="#"]'));
    if (!hasIO || !sections.length || !links.length) return;
    var visible = [];
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = visible.indexOf(en.target);
        if (en.isIntersecting && i === -1) visible.push(en.target);
        if (!en.isIntersecting && i !== -1) visible.splice(i, 1);
      });
      var active = null;
      sections.forEach(function (s) { if (visible.indexOf(s) !== -1) active = s.id; });
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ------------------------------------------------------------------
  // Acordeón de preguntas frecuentes (botones + regiones, WAI-ARIA)
  // ------------------------------------------------------------------
  function initAccordion() {
    var list = document.querySelector('.faq-list');
    if (!list) return;
    var triggers = Array.prototype.slice.call(list.querySelectorAll('.acc-trigger'));
    function panelOf(t) { return document.getElementById(t.getAttribute('aria-controls')); }
    function set(t, open) {
      var p = panelOf(t);
      t.setAttribute('aria-expanded', String(open));
      p.classList.toggle('is-open', open);
      if (open) p.removeAttribute('inert'); else p.setAttribute('inert', '');
    }
    triggers.forEach(function (t) { set(t, false); });

    list.addEventListener('click', function (e) {
      var t = e.target.closest('.acc-trigger');
      if (t) set(t, t.getAttribute('aria-expanded') !== 'true');
    });
    list.addEventListener('keydown', function (e) {
      var t = e.target.closest('.acc-trigger');
      if (!t) return;
      var i = triggers.indexOf(t), n = triggers.length, to = -1;
      if (e.key === 'ArrowDown') to = (i + 1) % n;
      else if (e.key === 'ArrowUp') to = (i - 1 + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to !== -1) { e.preventDefault(); triggers[to].focus(); }
    });
  }

  // ------------------------------------------------------------------
  // Menú móvil
  // ------------------------------------------------------------------
  function initMenu() {
    var menu = document.querySelector('.menu');
    if (!menu) return;
    var summary = menu.querySelector('summary');
    summary.setAttribute('aria-expanded', 'false');
    menu.addEventListener('toggle', function () { summary.setAttribute('aria-expanded', String(menu.open)); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.menu-panel a')) menu.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    menu.addEventListener('focusout', function (e) {
      if (menu.open && e.relatedTarget && !menu.contains(e.relatedTarget)) menu.open = false;
    });
    window.matchMedia('(min-width: 48rem)').addEventListener('change', function (mq) {
      if (mq.matches) menu.open = false;
    });
  }

  // ------------------------------------------------------------------
  // Lightbox de apuntes
  // ------------------------------------------------------------------
  function initNotes() {
    var dlg = document.getElementById('lightbox');
    var links = Array.prototype.slice.call(document.querySelectorAll('.sheet-open'));
    if (!dlg || typeof dlg.showModal !== 'function' || !links.length) return; // sin <dialog>: el enlace abre la imagen

    var img = document.getElementById('lb-img');
    var title = document.getElementById('lb-title');
    var count = document.getElementById('lb-count');
    var caption = document.getElementById('lb-caption');
    var stage = document.getElementById('lb-stage');
    var zoomBtn = document.getElementById('lb-zoom');
    var open = document.getElementById('lb-open');
    var prev = document.getElementById('lb-prev');
    var next = document.getElementById('lb-next');
    var index = 0;
    var opener = null;

    function setZoom(on) {
      stage.classList.toggle('is-zoom', on);
      zoomBtn.setAttribute('aria-pressed', String(on));
      zoomBtn.textContent = on ? 'Ajustar' : 'Ampliar';
      if (on) { stage.scrollTop = 0; stage.scrollLeft = 0; }
    }
    function show(i) {
      index = (i + links.length) % links.length;
      var a = links[index];
      var thumb = a.querySelector('img');
      img.src = a.getAttribute('href');
      img.alt = thumb ? thumb.alt : '';
      title.textContent = a.dataset.title || 'Apuntes';
      caption.textContent = a.dataset.caption || '';
      count.textContent = (index + 1) + ' / ' + links.length;
      open.href = a.getAttribute('href');
      setZoom(false);
    }

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        opener = a;
        show(i);
        dlg.showModal();
      });
    });
    prev.addEventListener('click', function () { show(index - 1); });
    next.addEventListener('click', function () { show(index + 1); });
    zoomBtn.addEventListener('click', function () { setZoom(!stage.classList.contains('is-zoom')); });
    img.addEventListener('click', function () { setZoom(!stage.classList.contains('is-zoom')); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  // ------------------------------------------------------------------
  // WhatsApp flotante (móvil): aparece al salir el CTA del hero, se oculta ante otros CTA y el footer
  // ------------------------------------------------------------------
  function initFab() {
    var fab = document.getElementById('fab');
    var heroCta = document.querySelector('.hero .btn-primary');
    if (!fab || !heroCta || !hasIO) return;
    var mq = window.matchMedia('(max-width: 47.99rem)');
    var heroGone = false;
    var blockers = [];

    function update() {
      var show = mq.matches && heroGone && blockers.length === 0;
      fab.classList.toggle('is-visible', show);
      if (show) fab.removeAttribute('inert'); else fab.setAttribute('inert', '');
    }
    new IntersectionObserver(function (entries) {
      var en = entries[entries.length - 1];
      heroGone = !en.isIntersecting && en.boundingClientRect.top < 0;
      update();
    }).observe(heroCta);

    var others = [document.getElementById('est-wa'), document.querySelector('.contact .btn-primary'), document.querySelector('.site-footer')];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = blockers.indexOf(en.target);
        if (en.isIntersecting && i === -1) blockers.push(en.target);
        if (!en.isIntersecting && i !== -1) blockers.splice(i, 1);
      });
      update();
    });
    others.forEach(function (el) { if (el) io.observe(el); });
    mq.addEventListener('change', update);
  }

  function init() {
    // iOS Safari solo activa :active si hay algún listener táctil en el documento.
    document.addEventListener('touchstart', function () {}, { passive: true });
    root.classList.add('js-ready');
    initEstimator();
    initReveal();
    initHeader();
    initAccordion();
    initMenu();
    initNotes();
    initFab();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
