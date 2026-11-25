(() => {
  const MAX_TITLE_LENGTH = 120;
  const UNSAFE_HTML_REGEX = /<[^>]*>|javascript:/i;

  const style = document.createElement('style');
  style.textContent = `
    body, main, section, article, li, p, span, td, th, h1, h2, h3 {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    #jdi-edge-stack {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      width: min(680px, calc(100vw - 32px));
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .jdi-edge-alert {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
      font-size: 14px;
      line-height: 1.45;
      border-left: 5px solid;
    }
    .jdi-edge-alert--error {
      background: #fef2f2;
      color: #991b1b;
      border-left-color: #dc2626;
    }
    .jdi-edge-alert--warning {
      background: #fffbeb;
      color: #92400e;
      border-left-color: #d97706;
    }
    .jdi-edge-alert--offline {
      background: #1e293b;
      color: #f8fafc;
      border-left-color: #f59e0b;
    }
    .jdi-edge-alert__title {
      font-weight: 700;
      margin-bottom: 2px;
    }
    .jdi-edge-alert__actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .jdi-edge-btn {
      cursor: pointer;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
    }
    button[data-jdi-loading="true"] {
      opacity: 0.72;
      cursor: not-allowed !important;
    }
    .jdi-spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 6px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      vertical-align: -1px;
      animation: jdi-spin 0.75s linear infinite;
    }
    @keyframes jdi-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  function getStack() {
    let stack = document.getElementById('jdi-edge-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'jdi-edge-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    return stack;
  }

  function removeBanner(id) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
  }

  function showBanner({ id, variant, title, message, showRetry = false, dismissible = true }) {
    const stack = getStack();
    removeBanner(id);

    const box = document.createElement('div');
    box.id = id;
    box.className = `jdi-edge-alert jdi-edge-alert--${variant}`;

    const textWrap = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.className = 'jdi-edge-alert__title';
    titleEl.textContent = title;
    const msgEl = document.createElement('div');
    msgEl.textContent = message;
    textWrap.appendChild(titleEl);
    textWrap.appendChild(msgEl);

    const actions = document.createElement('div');
    actions.className = 'jdi-edge-alert__actions';

    if (showRetry) {
      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'jdi-edge-btn';
      retryBtn.textContent = 'Spróbuj ponownie';
      retryBtn.onclick = () => window.location.reload();
      actions.appendChild(retryBtn);
    }

    if (dismissible) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'jdi-edge-btn';
      closeBtn.textContent = 'Zamknij';
      closeBtn.onclick = () => box.remove();
      actions.appendChild(closeBtn);
    }

    box.appendChild(textWrap);
    box.appendChild(actions);
    stack.appendChild(box);
  }

  function syncOfflineState() {
    if (!navigator.onLine) {
      showBanner({
        id: 'jdi-banner-offline',
        variant: 'offline',
        title: 'Brak połączenia z Internetem (Tryb offline)',
        message: 'Twoje urządzenie jest obecnie w trybie offline. Zapisywanie oraz pobieranie zadań zostanie wznowione po przywróceniu połączenia.',
        showRetry: true,
        dismissible: false
      });
    } else {
      removeBanner('jdi-banner-offline');
    }
  }

  window.addEventListener('offline', syncOfflineState);
  window.addEventListener('online', syncOfflineState);

  let activeSubmitBtn = null;
  let unlockTimer = null;

  function lockSubmitButton(btn) {
    if (!btn || btn.dataset.jdiLoading === 'true') return;
    btn.dataset.jdiLoading = 'true';
    btn.dataset.jdiOriginalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="jdi-spinner"></span>Zapisywanie...';
    activeSubmitBtn = btn;
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(unlockSubmitButton, 4000);
  }

  function unlockSubmitButton() {
    clearTimeout(unlockTimer);
    if (!activeSubmitBtn) return;
    const btn = activeSubmitBtn;
    activeSubmitBtn = null;
    if (btn.dataset.jdiOriginalHtml !== undefined) {
      btn.innerHTML = btn.dataset.jdiOriginalHtml;
      delete btn.dataset.jdiOriginalHtml;
    }
    delete btn.dataset.jdiLoading;
    btn.disabled = false;
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const isApiCall = url.includes('/api/') || url.includes('/health');
    try {
      const response = await originalFetch(input, init);
      if (isApiCall) {
        if (response.status >= 500) {
          showBanner({
            id: 'jdi-banner-server',
            variant: 'error',
            title: `Awaria serwera lub bazy danych (HTTP ${response.status})`,
            message: 'Backend aplikacji jest chwilowo niedostępny lub nie może połączyć się z bazą PostgreSQL. Spróbuj ponownie za chwilę.',
            showRetry: true
          });
        } else if (response.status === 400) {
          try {
            const payload = await response.clone().json();
            if (payload && payload.error) {
              showBanner({
                id: 'jdi-banner-validation',
                variant: 'warning',
                title: 'Nieprawidłowe dane formularza',
                message: payload.error
              });
            }
          } catch (_) {
            // ignore non-JSON 400 body
          }
        } else if (response.ok) {
          removeBanner('jdi-banner-server');
        }
      }
      return response;
    } catch (err) {
      if (isApiCall) {
        showBanner({
          id: 'jdi-banner-network',
          variant: 'offline',
          title: 'Utracono połączenie z serwerem API',
          message: 'Nie udało się wysłać żądania do chmury Azure. Sprawdź połączenie sieciowe (tryb samolotowy / Wi-Fi) i spróbuj ponownie.',
          showRetry: true
        });
      }
      throw err;
    } finally {
      if (isApiCall && init && ['POST', 'PUT', 'PATCH'].includes((init.method || '').toUpperCase())) {
        unlockSubmitButton();
      }
    }
  };

  function disableNativeValidation() {
    document.querySelectorAll('form').forEach((form) => {
      form.noValidate = true;
    });
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    removeBanner('jdi-banner-validation');

    if (!navigator.onLine) {
      event.preventDefault();
      event.stopImmediatePropagation();
      syncOfflineState();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn && submitBtn.dataset.jdiLoading === 'true') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const titleInput = form.querySelector('input[type="text"], input:not([type])');
    if (titleInput) {
      const value = titleInput.value.trim();

      if (value.length === 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showBanner({
          id: 'jdi-banner-validation',
          variant: 'warning',
          title: 'Błąd walidacji formularza',
          message: 'Tytuł zadania jest wymagany i nie może być pusty.'
        });
        titleInput.focus();
        return;
      }

      if (value.length > MAX_TITLE_LENGTH) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showBanner({
          id: 'jdi-banner-validation',
          variant: 'warning',
          title: 'Przekroczono maksymalną długość pola',
          message: `Tytuł zadania ma ${value.length} znaków. Maksymalna dozwolona długość to ${MAX_TITLE_LENGTH} znaków.`
        });
        titleInput.focus();
        return;
      }

      if (UNSAFE_HTML_REGEX.test(value)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showBanner({
          id: 'jdi-banner-validation',
          variant: 'warning',
          title: 'Wykryto niedozwolone znaki specjalne',
          message: 'Usuń znaczniki HTML (np. <script>) z treści zadania i spróbuj ponownie.'
        });
        titleInput.focus();
        return;
      }
    }

    if (submitBtn) {
      lockSubmitButton(submitBtn);
    }
  }, true);

  window.addEventListener('error', () => {
    showBanner({
      id: 'jdi-banner-runtime',
      variant: 'error',
      title: 'Wystąpił nieoczekiwany błąd interfejsu',
      message: 'Aplikacja napotkała problem podczas renderowania widoku. Odśwież stronę, aby przywrócić stan.',
      showRetry: true
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    disableNativeValidation();
    syncOfflineState();
    const observer = new MutationObserver(disableNativeValidation);
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
