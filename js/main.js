/* Ana JavaScript Dosyası */

// DOM yüklendikten sonra çalıştır
document.addEventListener('DOMContentLoaded', function() {
    // AOS (Animate On Scroll) kütüphanesini başlat
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        disable: 'mobile' // Mobil cihazlarda performans için devre dışı bırak
    });

    // Tema değiştirici işlevselliği
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    
    // Kullanıcı tercihini localStorage'dan al
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    
    // Kayıtlı tema varsa uygula
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }
    
    // Tema değişikliği fonksiyonu
    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }
    
    // Tema değiştirme olayını dinle
    toggleSwitch.addEventListener('change', switchTheme, false);

    // Scroll to top butonu 
    const scrollTopBtn = document.querySelector('.scroll-to-top');
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('active');
        } else {
            scrollTopBtn.classList.remove('active');
        }
    });

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Navbar scroll efekti
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobil menu düğmesi işlevselliği
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Menü açıkken body scroll'unu kapat
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Menü linklerine tıklandığında menüyü kapat
    const menuLinks = document.querySelectorAll('.nav-links a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenuBtn && mobileMenuBtn.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Bağlantılar için smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Mobil cihazlarda farklı offset kullan
                const headerOffset = window.innerWidth <= 768 ? 60 : 70;
                
                window.scrollTo({
                    top: targetElement.offsetTop - headerOffset,
                    behavior: 'smooth'
                });
            }
            
            // Menü zıplamasını önlemek için kısa gecikme ekle
            setTimeout(() => {
                document.body.style.overflow = 'auto';
            }, 100);
        });
    });

    // Form gönderimi
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Form gönderimi Formspree tarafından işlenecek,
            // bu nedenle burada form gönderimini engellemiyoruz
            // Formspree başarılı/başarısız sayfaya yönlendirecek
            
            // Form gönderiminden sonra sayfa değiştirmeden önce 'Gönderiliyor...' mesajı göster
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.innerText;
                submitButton.innerText = 'Gönderiliyor...';
                submitButton.disabled = true;
                
                // 3 saniye sonra butonu sıfırla (form gönderimini engellemeyeceğiz)
                setTimeout(() => {
                    submitButton.innerText = originalText;
                    submitButton.disabled = false;
                }, 3000);
            }
        });
    }

    // Sayfa içi navigasyon linki aktifleştirme
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(navItem => {
            navItem.classList.remove('active');
            if (navItem.getAttribute('href') === `#${current}`) {
                navItem.classList.add('active');
            }
        });
    });

    // Typing effect için
    function setupTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-effect');
        
        typingElements.forEach(element => {
            // Animasyonu sıfırla
            element.style.animation = 'none';
            void element.offsetWidth; // Reflow
            const text = element.textContent;
            const duration = text.length * 0.1; // Uzunluğa göre süre hesaplama
            element.style.animation = `typing ${duration}s steps(${text.length}, end), blink-caret .75s step-end infinite`;
        });
    }
    
    // Typing efektini başlat
    setupTypingEffect();
    
    // Sayfa yüklendiğinde skill barlarını animasyona sokma
    function animateSkillBars() {
        const skillLevels = document.querySelectorAll('.skill-level');
        
        skillLevels.forEach(level => {
            const width = level.style.width;
            level.style.width = '0';
            
            setTimeout(() => {
                level.style.transition = 'width 1s ease-in-out';
                level.style.width = width;
            }, 500);
        });
    }
    
    // Skill bar animasyonlarını başlat
    animateSkillBars();

    // 3D kart efekti için proje kartlarına event listener ekle
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            // Kart üzerindeki fare pozisyonunu hesapla
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // X pozisyonu
            const y = e.clientY - rect.top;  // Y pozisyonu
            
            // Hareket açısı hesaplama
            const xRotation = ((y - rect.height / 2) / rect.height) * 10;
            const yRotation = ((x - rect.width / 2) / rect.width) * -10;
            
            // 3D efektini uygula
            this.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            // Kart üzerinden çıkınca normal haline dön
            this.style.transform = 'translateY(-10px)';
        });
    });
});

// Proje detay modal fonksiyonları
function setupProjectModals() {
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close-modal');
    const viewButtons = document.querySelectorAll('.view-button');
    
    // Her "Detayları Gör" butonuna tıklandığında
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            
            // Proje ID'sine göre içerik belirle
            let content = '';
            
            switch(projectId) {
                case 'autoelectronics':
                    content = `
                        <h2>Oto-Elektronik & ECU Programlama</h2>
                        <div class="modal-image">
                            <img src="/assets/images/borusan.jpg" alt="Oto-Elektronik Projesi" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>Otomobil elektronik sistemleri, ECU arıza tespiti, programlama ve araç yazılımı geliştirme alanlarındaki deneyimlerim.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Oto-elektronik alanında yaptığım çalışmalar:</p>
                        <ul>
                            <li>ECU (Motor Kontrol Ünitesi) arıza tespiti ve onarımı</li>
                            <li>Çeşitli araç elektronik sistemlerinin diagnostiği</li>
                            <li>Performans ve yakıt optimizasyonu için ECU programlama</li>
                            <li>Araç sensör sistemleri kalibrasyonu ve onarımı</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>Gocen Oto Elektronik'te Elektronik Teknisyeni olarak görev aldım. Sorumluluklarım:</p>
                        <ul>
                            <li>Arıza tespiti ve elektronik sistem analizi</li>
                            <li>Yazılım güncellemeleri ve programlama</li>
                            <li>Sorun giderme ve müşteri çözümleri</li>
                            <li>Elektronik komponentlerin onarımı</li>
                        </ul>
                        
                        <div class="modal-cta">
                            <a href="/auto-electronics.html" class="btn btn-primary">Detaylı Sayfaya Git</a>
                        </div>
                    `;
                    break;
                
                case 'asifin':
                    content = `
                        <h2>AsiFin - Finansal Strateji Platformu</h2>
                        <div class="modal-image">
                            <img src="/assets/images/girisim2.jpeg" alt="AsiFin Projesi" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>AsiFin, finansal stratejilerin test edilmesini sağlayan web tabanlı bir SaaS girişimidir. Teknofest Deneyap Girişim Programı'nda "En İyi Girişim" ödülünü kazanmıştır.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler:</p>
                        <ul>
                            <li>Python backend ile finansal algoritmaların geliştirilmesi</li>
                            <li>Django web framework ile kullanıcı arayüzü</li>
                            <li>JavaScript ile interaktif grafiklerin oluşturulması</li>
                            <li>Finansal veri analizi için özel algoritmalar</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>Bu projede Django ve Finans Yazılımı Geliştirici olarak görev aldım. Sorumluluklarım:</p>
                        <ul>
                            <li>Backtest algoritmaları geliştirme</li>
                            <li>Finansal verileri analiz etme</li>
                            <li>Dashboard ve kullanıcı arayüzü tasarımı</li>
                            <li>Gerçek zamanlı veri işleme sistemleri</li>
                        </ul>
                    `;
                    break;
                case 'sorucan':
                    content = `
                        <h2>SoruCan - LLM Projesi</h2>
                        <div class="modal-image">
                            <img src="/assets/images/Uluslararası Gençlik Zirvesi.jpg" alt="SoruCan Projesi" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>SoruCan, Büyük Dil Modeli kullanan akıllı bir soru-cevap platformudur. GSB - Uluslarası Gençlik Bilgilendirme Servisi Hackathonu'nda birincilik ödülü kazanmıştır.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler:</p>
                        <ul>
                            <li>LLM (Large Language Model) entegrasyonu</li>
                            <li>Doğal dil işleme</li>
                            <li>Django web framework</li>
                            <li>Semantik arama algoritmaları</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>Projede LLM ve Django Geliştirici olarak çalıştım ve şu sorumluluklarım vardı:</p>
                        <ul>
                            <li>LLM API entegrasyonu</li>
                            <li>Prompt mühendisliği</li>
                            <li>Backend sistemlerin geliştirilmesi</li>
                            <li>Kullanıcı deneyimi optimizasyonu</li>
                        </ul>
                    `;
                    break;
                case 'asimed':
                    content = `
                        <h2>Asimed - Sağlık Teknolojisi Çözümü</h2>
                        <div class="modal-image">
                            <img src="/assets/images/asimed.png" alt="Asimed Projesi" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>Asimed, yapay zeka destekli ön teşhis, online anamnez, doktor destek ekranları ve tedavi takibini birleştiren yenilikçi bir sağlık teknolojisi çözümüdür. Bulutklinik 23' Hackathon'unda birincilik ödülü kazanmıştır.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler:</p>
                        <ul>
                            <li>Tıbbi görüntü işleme algoritmaları</li>
                            <li>Yapay zeka destekli tanı sistemleri</li>
                            <li>Hasta veri analizi</li>
                            <li>Web tabanlı doktor-hasta platformu</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>Bu projede Görüntü İşleme ve AI Geliştirici olarak görev aldım. Sorumluluklarım:</p>
                        <ul>
                            <li>Medikal görüntüleri işleme algoritmaları geliştirme</li>
                            <li>AI tabanlı ön tanı sistemleri oluşturma</li>
                            <li>Veri analizi ve görselleştirme</li>
                            <li>Model eğitimi ve optimizasyonu</li>
                        </ul>
                    `;
                    break;
                case 'mtrcbeta':
                    content = `
                        <h2>MTRC-Beta Sualtı Aracı</h2>
                        <div class="modal-image">
                            <img src="/assets/images/beta.jpg" alt="MTRC-Beta Sualtı Aracı" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>MTRC-Beta, Teknofest yarışması için Matiricie takımı tarafından geliştirilen gelişmiş otonom sualtı aracıdır.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler:</p>
                        <ul>
                            <li>Robot Operating System (ROS) tabanlı kontrol yazılımı</li>
                            <li>Gelişmiş görüntü işleme algoritmaları</li>
                            <li>Sualtı sensör entegrasyonu</li>
                            <li>Özel PCB tasarımı ve elektronik</li>
                            <li>Algoritma optimizasyonu</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>MTRC-Beta projesinde Yazılım Ekip Lideri olarak görev aldım. Sorumluluklarım:</p>
                        <ul>
                            <li>ROS tabanlı kontrol sistemleri mimarisi</li>
                            <li>Görüntü işleme algoritmalarının geliştirilmesi</li>
                            <li>Kontrolör ayarlarının optimizasyonu</li>
                            <li>Takım koordinasyonu</li>
                            <li>Simülasyon ortamı geliştirme</li>
                        </ul>
                    `;
                    break;
                case 'mtrcalpha':
                    content = `
                        <h2>MTRC-Alpha Sualtı Aracı</h2>
                        <div class="modal-image">
                            <img src="/assets/images/alpha.jpg" alt="MTRC-Alpha Sualtı Aracı" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>MTRC-Alpha, Matiricie takımının ilk otonom sualtı aracı projesidir.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler:</p>
                        <ul>
                            <li>Arduino tabanlı kontrol sistemleri</li>
                            <li>Python ile görüntü işleme</li>
                            <li>OpenCV kütüphanesi</li>
                            <li>Motor kontrol sistemleri</li>
                            <li>Temel mekanik tasarım</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>MTRC-Alpha projesinde Elektronik ve Yazılım Geliştiricisi olarak görev aldım. Sorumluluklarım:</p>
                        <ul>
                            <li>Arduino programlama</li>
                            <li>Sensör entegrasyonu</li>
                            <li>Python ile basit görüntü işleme</li>
                            <li>Elektronik devre tasarımı</li>
                            <li>Gömülü sistem mimarisi</li>
                        </ul>
                    `;
                    break;
                case 'poseidon':
                    content = `
                        <h2>Poseidon Sualtı Aracı</h2>
                        <div class="modal-image">
                            <img src="/assets/images/poseidon.jpg" alt="Poseidon Sualtı Aracı" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>Poseidon, RoboNation Robosub yarışması için geliştirilen uluslararası rekabet düzeyinde sualtı aracı projesidir.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler:</p>
                        <ul>
                            <li>ROS (Robot Operating System)</li>
                            <li>Yapay Zeka tabanlı nesne tanıma</li>
                            <li>Sensör füzyonu</li>
                            <li>3D modelleme ve simülasyon</li>
                            <li>Görev planlama algoritmaları</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>Poseidon projesinde Yazılım Geliştiricisi olarak görev aldım. Sorumluluklarım:</p>
                        <ul>
                            <li>ROS paketleri geliştirme</li>
                            <li>Yapay zeka algoritmaları entegrasyonu</li>
                            <li>Gömülü sistem kontrolü</li>
                            <li>Simülasyon ortamında test</li>
                            <li>Görev planlayıcı algoritmalar</li>
                        </ul>
                    `;
                    break;
                case 'maikong':
                    content = `
                        <h2>Maikong Sualtı Aracı</h2>
                        <div class="modal-image">
                            <img src="/assets/images/maikong.jpg" alt="Maikong Sualtı Aracı" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>Maikong, denizaltı haritalandırma ve keşif için geliştirilen özel bir sualtı robotik platform projesidir.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler:</p>
                        <ul>
                            <li>SLAM (Eşzamanlı Haritalandırma ve Konumlandırma)</li>
                            <li>Lidar ve Sonar sensör entegrasyonu</li>
                            <li>GPS destekli navigasyon</li>
                            <li>Veri kaydı ve analizi</li>
                            <li>Gelişmiş haritalandırma algoritması</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>Maikong projesinde Robotik Yazılım Mühendisi olarak görev aldım. Sorumluluklarım:</p>
                        <ul>
                            <li>SLAM algoritmalarının geliştirilmesi</li>
                            <li>Lidar ve sonar verilerinin işlenmesi</li>
                            <li>Haritalandırma yöntemlerinin iyileştirilmesi</li>
                            <li>3D harita oluşturma</li>
                            <li>Otonom navigasyon algoritmaları</li>
                        </ul>
                    `;
                    break;
                    
                case 'bmw320d':
                    content = `
                        <h2>BMW 3.20D Fiyat Tahmin Modeli</h2>
                        <div class="modal-image">
                            <img src="/assets/images/borusan.jpg" alt="BMW 3.20D Fiyat Tahmin Modeli" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <p>Borusan AutoHack yarışmasında Üçüncü olan bu projede, Sahibinden.com üzerinden topladığımız BMW 3.20D comfort paket ilanlarından aldığımız veriler ile hazırladığımız dataset üzerinden bir model eğittik.</p>
                        
                        <h3>Proje Detayları</h3>
                        <p>Bu projede kullanılan temel teknolojiler ve yöntemler:</p>
                        <ul>
                            <li>Random Forest algoritması (en yüksek doğruluğu veren algoritma)</li>
                            <li>SVM (Support Vector Machine)</li>
                            <li>Polinomiyal ve Lineer Regresyon</li>
                            <li>K-En Yakın Komşu (KNN) yöntemi</li>
                            <li>Web scraping ile veri toplama</li>
                            <li>Veri temizleme ve ön işleme</li>
                        </ul>
                        
                        <h3>Buluşlarımız</h3>
                        <ul>
                            <li>Aracın fiyatına etki eden en önemli faktörler: Konum, değişen/boyalı parçalar, hasar kaydı</li>
                            <li>Batı şehirlerinde (İstanbul, İzmir, Edirne) araç fiyatları daha yüksek</li>
                            <li>Doğuya gidildikçe araç fiyatlarında düşüş gözlemlendi</li>
                            <li>Random Forest algoritması en doğru sonuçları verdi</li>
                        </ul>
                        
                        <h3>Benim Rolüm</h3>
                        <p>Bu projede temel olarak aşağıdaki alanlarda çalıştım:</p>
                        <ul>
                            <li>Web scraping ile veri madenciliği</li>
                            <li>Veri temizleme ve ön işleme</li>
                            <li>Makine öğrenmesi modellerinin geliştirilmesi</li>
                            <li>Farklı algoritmalarda performans karşılaştırma</li>
                            <li>Sonuçların analizi ve görselleştirilmesi</li>
                        </ul>
                        
                        <h3>Proje Linkleri</h3>
                        <ul>
                            <li><a href="https://github.com/kymanov/Borusan_autohack_bmw320prediction_model" target="_blank">GitHub Reposu</a></li>
                            <li><a href="https://www.canva.com/design/DAGXfUNa6Hs/KYzuO4uwgD35DdxvT8NlVw/edit" target="_blank">Yarışma Sunumu</a></li>
                        </ul>
                    `;
                    break;
                default:
                    content = '<p>Proje detayları mevcut değil.</p>';
            }
            
            // Modal içeriğini güncelle ve göster
            modalContent.innerHTML = content;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Scroll'u devre dışı bırak
            
            // Modal fade-in animasyonu
            modal.classList.add('modal-fade-in');
        });
    });
    
    // Modal'ı kapatma (X butonuna tıklama)
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Scroll'u tekrar etkinleştir
        });
    }
    
    // Modal dışına tıklayınca da kapat
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Sayfa yüklendiğinde proje modallarını ayarla
document.addEventListener('DOMContentLoaded', setupProjectModals);
