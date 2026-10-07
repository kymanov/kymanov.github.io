// Bülten sayfası: tema değiştirici ve abonelik formu

document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.theme-switch input[type="checkbox"]');
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}

    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        toggle.checked = saved === 'dark';
    }

    toggle.addEventListener('change', function (e) {
        var theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('theme', theme); } catch (err) {}
    });

    var form = document.getElementById('newsletterForm');
    var status = document.getElementById('nlStatus');
    var button = form.querySelector('button[type="submit"]');

    function show(message, ok) {
        status.textContent = message;
        status.className = 'nl-status ' + (ok ? 'ok' : 'err');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var email = form.elements['email'].value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            show('Lütfen geçerli bir e-posta adresi gir.', false);
            return;
        }
        if (!form.querySelector('#nl-consent').checked) {
            show('Devam etmek için onay kutusunu işaretle.', false);
            return;
        }

        button.disabled = true;
        show('Gönderiliyor...', true);

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        }).then(function (res) {
            if (!res.ok) throw new Error('http ' + res.status);
            form.reset();
            show('Teşekkürler! Aboneliğin alındı.', true);
        }).catch(function () {
            show('Bir sorun oluştu, lütfen daha sonra tekrar dene.', false);
        }).finally(function () {
            button.disabled = false;
        });
    });
});
