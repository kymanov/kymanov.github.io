/* Site geneli: menü, kaydırma efektleri, sayaçlar, filtre, pencereler, yazılar, iletişim formu.
   Her parça sayfada ilgili öğe varsa çalışır; ana sayfa ve oto-elektronik sayfası aynı dosyayı kullanır. */

(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    /* Mobil menü */
    const toggle = $('.nav-toggle');
    const nav = $('#siteNav');
    if (toggle && nav) {
        const setOpen = (open) => {
            nav.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
        };
        toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
        nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }

    /* Başlığı kelimelere böl (kelime kelime yukarı kayarak gelir) */
    $$('[data-split]').forEach((el) => {
        let i = 0;
        const walk = (node) => {
            [...node.childNodes].forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.append(part); return; }
                        const word = document.createElement('span');
                        word.className = 'word';
                        const inner = document.createElement('span');
                        inner.style.setProperty('--i', i++);
                        inner.textContent = part;
                        word.append(inner);
                        frag.append(word);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    walk(child);
                }
            });
        };
        el.setAttribute('aria-label', el.textContent.trim());
        walk(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    });

    /* Grupta sırayla belirme için sıra numarası */
    $$('[data-stagger]').forEach((group) => {
        $$(':scope > [data-reveal]', group).forEach((el, i) => el.style.setProperty('--i', i % 8));
    });

    /* Sayaçlar */
    const runCounter = (el) => {
        const target = Number(el.dataset.count);
        if (reduceMotion) { el.textContent = target; return; }
        const start = performance.now();
        const dur = 1400;
        const tick = (now) => {
            const t = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
            if (t < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
    };

    /* Kaydırınca belirme */
    const revealEls = $$('[data-reveal]');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add('in');
                $$('[data-count]', el).forEach(runCounter);
                // Belirme bitince öğe kendi hover/filtre geçişlerine dönsün
                const done = () => el.removeAttribute('data-reveal');
                el.addEventListener('transitionend', done, { once: true });
                setTimeout(done, 2500);
                io.unobserve(el);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('in'));
    }

    /* Kaydırmaya bağlı efektler: header, ilerleme çubuğu, zaman çizelgesi, paralaks */
    const header = $('.site-header');
    const bar = $('.progress span');
    const timeline = $('.timeline');
    const parallax = $$('[data-parallax]');
    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (header) header.classList.toggle('scrolled', y > 12);
        if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

        if (timeline) {
            const r = timeline.getBoundingClientRect();
            const p = (window.innerHeight * 0.65 - r.top) / r.height;
            timeline.style.setProperty('--tl', Math.max(0, Math.min(1, p)).toFixed(3));
        }

        if (!reduceMotion) {
            parallax.forEach((img) => {
                const r = img.parentElement.getBoundingClientRect();
                const center = r.top + r.height / 2 - window.innerHeight / 2;
                img.style.setProperty('--py', `${(-center * 0.08 - r.height * 0.07).toFixed(1)}px`);
            });
        }
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    /* Menüde aktif bölüm */
    const links = nav ? $$('a[href^="#"]', nav) : [];
    if (links.length && 'IntersectionObserver' in window) {
        const sectionIo = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        links.forEach((a) => {
            const target = document.getElementById(a.getAttribute('href').slice(1));
            if (target) sectionIo.observe(target);
        });
    }

    /* Hero fotoğraf yığını: fareyle hafif derinlik */
    const stack = $('.hero-stack');
    if (stack && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        const photos = $$('.stack-photo', stack);
        document.addEventListener('pointermove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            photos.forEach((p) => { p.style.setProperty('--x', x.toFixed(3)); p.style.setProperty('--y', y.toFixed(3)); });
        }, { passive: true });
    }

    /* Proje filtresi */
    const filters = $$('.filter');
    const cards = $$('.project-grid .card');
    filters.forEach((btn) => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.filter;
            filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
            cards.forEach((card) => {
                const show = value === 'all' || card.dataset.category.split(' ').includes(value);
                if (show) {
                    card.hidden = false;
                    card.classList.add('in');
                    requestAnimationFrame(() => card.classList.remove('is-hiding'));
                } else if (!card.hidden) {
                    card.classList.add('is-hiding');
                    setTimeout(() => { if (card.classList.contains('is-hiding')) card.hidden = true; }, reduceMotion ? 0 : 320);
                }
            });
        });
    });

    /* Proje detay penceresi */
    const modal = $('#projectModal');
    if (modal) {
        const body = $('#modalContent');
        const details = window.PROJECT_DETAILS || {};
        $$('[data-project]').forEach((btn) => {
            btn.addEventListener('click', () => {
                // İçerik kendi dosyamızdan (project-data.js) geliyor, dış kaynak değil
                body.innerHTML = details[btn.dataset.project] || '<p>Proje detayları mevcut değil.</p>';
                const title = $('h2', body);
                if (title) title.id = 'modalTitle';
                modal.showModal();
                modal.scrollTop = 0;
            });
        });
        $('#modalClose').addEventListener('click', () => modal.close());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
    }

    /* Galeri ışık kutusu */
    const lightbox = $('#lightbox');
    if (lightbox) {
        const img = $('img', lightbox);
        const cap = $('p', lightbox);
        $$('.gallery button').forEach((btn) => {
            btn.addEventListener('click', () => {
                const src = $('img', btn);
                img.src = src.currentSrc || src.src;
                img.alt = src.alt;
                cap.textContent = $('.cap', btn)?.textContent || '';
                lightbox.showModal();
            });
        });
        $('.modal-close', lightbox).addEventListener('click', () => lightbox.close());
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
    }

    /* Medium yazıları: erişilirse statik listenin yerine canlı liste */
    const posts = $('#posts');
    if (posts) {
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@yildiz-kerem')
            .then((r) => r.json())
            .then((data) => {
                if (data.status !== 'ok' || !data.items || !data.items.length) return;
                posts.textContent = '';
                data.items.slice(0, 6).forEach((item) => {
                    const li = document.createElement('li');
                    li.className = 'in';
                    const a = document.createElement('a');
                    a.href = item.link;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    const time = document.createElement('time');
                    time.textContent = new Date(item.pubDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
                    const title = document.createElement('span');
                    title.className = 'post-title';
                    title.textContent = item.title;
                    const arrow = document.createElement('span');
                    arrow.className = 'post-arrow';
                    arrow.setAttribute('aria-hidden', 'true');
                    arrow.textContent = '↗';
                    a.append(time, title, arrow);
                    li.append(a);
                    posts.append(li);
                });
            })
            .catch(() => { /* statik liste kalır */ });
    }

    /* İletişim formu */
    const form = $('#contactForm');
    if (form) {
        const status = $('#formStatus');
        const say = (text, kind) => { status.textContent = text; status.className = 'form-status ' + (kind || ''); };
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let firstBad = null;
            $$('[required]', form).forEach((field) => {
                const bad = !field.value.trim() || (field.type === 'email' && !field.checkValidity());
                field.setAttribute('aria-invalid', String(bad));
                if (bad && !firstBad) firstBad = field;
            });
            if (firstBad) {
                say('Eksik veya hatalı alan var.', 'err');
                firstBad.focus();
                return;
            }
            const button = $('button[type="submit"]', form);
            button.disabled = true;
            say('Gönderiliyor...');
            try {
                const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
                if (!res.ok) throw new Error(String(res.status));
                form.reset();
                say('Mesajın gönderildi, en kısa sürede dönüş yapacağım.', 'ok');
            } catch (err) {
                say('Gönderilemedi. Doğrudan e-posta ile yazabilirsin.', 'err');
            } finally {
                button.disabled = false;
            }
        });
    }
})();
