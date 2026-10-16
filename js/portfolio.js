/* Portfolyo ana sayfası: menü, filtre, proje penceresi, yazılar, iletişim formu */

(function () {
    'use strict';

    // Mobil menü
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('siteNav');
    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Aktif bölümü menüde işaretle
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach((s) => s && io.observe(s));
    }

    // Proje filtresi
    const filters = document.querySelectorAll('.filter');
    const projects = document.querySelectorAll('.project');
    filters.forEach((btn) => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.filter;
            filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
            projects.forEach((p) => {
                const cats = p.dataset.category.split(' ');
                p.hidden = !(value === 'all' || cats.includes(value));
            });
        });
    });

    // Proje detay penceresi
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const details = window.PROJECT_DETAILS || {};

    document.querySelectorAll('[data-project]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const html = details[btn.dataset.project];
            // İçerik kendi dosyamızdan (project-data.js) geliyor, dış kaynak değil
            modalContent.innerHTML = html || '<p>Proje detayları mevcut değil.</p>';
            const title = modalContent.querySelector('h2');
            if (title) title.id = 'modalTitle';
            modal.showModal();
            modal.scrollTop = 0;
        });
    });
    document.getElementById('modalClose').addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

    // Medium yazıları: erişilirse statik listenin yerine canlı liste
    const posts = document.getElementById('posts');
    const feed = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@yildiz-kerem';
    fetch(feed)
        .then((r) => r.json())
        .then((data) => {
            if (data.status !== 'ok' || !data.items || !data.items.length) return;
            posts.textContent = '';
            data.items.slice(0, 6).forEach((item) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = item.link;
                a.target = '_blank';
                a.rel = 'noopener';

                const date = document.createElement('time');
                date.className = 'meta';
                date.textContent = new Date(item.pubDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

                const title = document.createElement('span');
                title.textContent = item.title;

                const tag = document.createElement('span');
                tag.className = 'meta';
                tag.textContent = ((item.categories && item.categories[0]) || 'Medium') + ' ↗';

                a.append(date, title, tag);
                li.append(a);
                posts.append(li);
            });
        })
        .catch(() => { /* statik liste kalır */ });

    // İletişim formu
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const say = (text, kind) => { status.textContent = text; status.className = 'form-status meta ' + (kind || ''); };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let firstBad = null;
        form.querySelectorAll('[required]').forEach((field) => {
            const bad = !field.value.trim() || (field.type === 'email' && !field.checkValidity());
            field.setAttribute('aria-invalid', String(bad));
            if (bad && !firstBad) firstBad = field;
        });
        if (firstBad) {
            say('Eksik veya hatalı alan var.', 'err');
            firstBad.focus();
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        say('Gönderiliyor...');
        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (!res.ok) throw new Error(String(res.status));
            form.reset();
            say('Mesaj gönderildi.', 'ok');
        } catch (err) {
            say('Gönderilemedi. Doğrudan e-posta ile yazabilirsin.', 'err');
        } finally {
            button.disabled = false;
        }
    });
})();
