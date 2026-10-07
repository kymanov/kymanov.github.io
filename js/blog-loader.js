// Medium blog yazılarını RSS feed'den yükle
async function loadMediumBlogs() {
    const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@yildiz-kerem';
    
    try {
        const response = await fetch(rssUrl);
        const data = await response.json();
        
        if (data.status === 'ok') {
            const blogContainer = document.querySelector('.blog-posts-container');
            if (blogContainer) {
                blogContainer.innerHTML = ''; // Mevcut içeriği temizle
                
                data.items.forEach((item, index) => {
                    const blogPost = createBlogPostElement(item, index);
                    blogContainer.appendChild(blogPost);
                });
            }
        }
    } catch (error) {
        console.error('Blog yükleme hatası:', error);
        // Hata durumunda mevcut statik içeriği korumak için hiçbir şey yapmıyoruz
    }
}

function createBlogPostElement(blogData, delay) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    article.setAttribute('data-aos', 'fade-up');
    article.setAttribute('data-aos-delay', delay * 100);
    
    // Medium'un thumbnail resmi yoksa varsayılan resmi kullan
    const thumbnail = blogData.thumbnail || '/assets/images/blog/default.svg';
    
    // Tarih formatını Türkçe'ye çevir
    const date = new Date(blogData.pubDate);
    const formattedDate = date.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    article.innerHTML = `
        <div class="blog-image">
            <img src="${thumbnail}" alt="${blogData.title}">
        </div>
        <div class="blog-content">
            <h3 class="blog-title">${blogData.title}</h3>
            <div class="blog-meta">
                <span class="blog-date"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                <span class="blog-category"><i class="fas fa-tag"></i> ${blogData.categories[0] || 'Teknoloji'}</span>
            </div>
            <p class="blog-excerpt">${stripHtml(blogData.description).substring(0, 200)}...</p>
            <a href="${blogData.link}" target="_blank" class="read-more">Devamını Oku <i class="fas fa-arrow-right"></i></a>
        </div>
    `;
    
    return article;
}

function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Sayfa yüklendiğinde blogları yükle
document.addEventListener('DOMContentLoaded', loadMediumBlogs);
