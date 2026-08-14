(function () {
    const SUPPORTED = ['en', 'es', 'vi', 'ar'];
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'usa-lang';
    const RTL_LANGS = ['ar'];
    const LANG_META = {
        en: { flagClass: 'lang-flag-en', code: 'EN' },
        es: { flagClass: 'lang-flag-es', code: 'ES' },
        vi: { flagClass: 'lang-flag-vi', code: 'VI' },
        ar: { flagClass: 'lang-flag-ar', code: 'AR' },
    };

    function getStoredLang() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return SUPPORTED.includes(stored) ? stored : DEFAULT_LANG;
    }

    async function loadDictionary(lang) {
        if (lang === DEFAULT_LANG) return null; // English is already the DOM's baseline text
        const res = await fetch(`i18n/${lang}.json`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`i18n: failed to load ${lang}.json`);
        return res.json();
    }

    function applyDictionary(dict) {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const value = dict && dict[el.getAttribute('data-i18n')];
            if (!value) return; // no entry -> leave existing English text as-is
            if (value.indexOf('<') !== -1 || value.indexOf('&') !== -1) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });
    }

    function applyDirection(lang) {
        const isRtl = RTL_LANGS.includes(lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    }

    function updateSwitcherState(lang) {
        document.querySelectorAll('.lang-switcher-option').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
        });
        const meta = LANG_META[lang] || LANG_META[DEFAULT_LANG];
        document.querySelectorAll('.lang-switcher-toggle').forEach((toggle) => {
            const flagEl = toggle.querySelector('.lang-switcher-flag');
            const codeEl = toggle.querySelector('.lang-switcher-code');
            if (flagEl) {
                Object.values(LANG_META).forEach((m) => flagEl.classList.remove(m.flagClass));
                flagEl.classList.add(meta.flagClass);
            }
            if (codeEl) codeEl.textContent = meta.code;
        });
    }

    async function setLanguage(lang, { persist = true } = {}) {
        if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
        applyDirection(lang);
        try {
            applyDictionary(await loadDictionary(lang));
        } catch (err) {
            console.error(err);
            applyDirection(DEFAULT_LANG); // fail safe to English/LTR on fetch error
        }
        updateSwitcherState(lang);
        if (persist) localStorage.setItem(STORAGE_KEY, lang);
    }

    window.usaI18n = { setLanguage, getStoredLang, SUPPORTED };

    document.addEventListener('DOMContentLoaded', () => {
        setLanguage(getStoredLang(), { persist: false });

        document.querySelectorAll('.lang-switcher-option').forEach((btn) => {
            btn.addEventListener('click', () => {
                const scrollY = window.scrollY;
                setLanguage(btn.dataset.lang).then(() => window.scrollTo({ top: scrollY }));
                btn.blur();
                const dropdown = btn.closest('.lang-switcher');
                if (dropdown) dropdown.classList.remove('active');
            });
        });
    });
})();
