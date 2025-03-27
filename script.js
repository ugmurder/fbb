// 配置信息
const config = {
    apiKey: '232857405175b5a3303b8f5755d19aa0', // 替换为你的聚合数据API Key
    apiUrl: 'http://v.juhe.cn/toutiao/index',
    defaultType: 'top' // 默认新闻类型
};

// DOM元素
const newsContainer = document.getElementById('news-container');
const loadingElement = document.getElementById('loading');
const navLinks = document.querySelectorAll('.nav a');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// 当前新闻类型
let currentType = config.defaultType;
let newsData = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    fetchNews(currentType);
    
    // 为导航链接添加点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 更新活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // 获取新闻类型并获取新闻
            currentType = link.dataset.type;
            fetchNews(currentType);
        });
    });
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            searchNews(keyword);
        }
    });
    
    // 搜索框回车事件
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            if (keyword) {
                searchNews(keyword);
            }
        }
    });
});

// 获取新闻数据
async function fetchNews(type) {
    try {
        showLoading();
        
        const response = await fetch(`${config.apiUrl}?type=${type}&key=${config.apiKey}`);
        const data = await response.json();
        
        if (data.error_code === 0) {
            newsData = data.result.data;
            renderNews(newsData);
        } else {
            showError(data.reason || '获取新闻失败');
        }
    } catch (error) {
        showError('网络请求失败，请稍后重试');
        console.error('获取新闻失败:', error);
    }
}

// 搜索新闻
function searchNews(keyword) {
    if (!newsData.length) return;
    
    const filteredNews = newsData.filter(news => 
        news.title.includes(keyword) || 
        (news.author && news.author.includes(keyword)) || 
        (news.category && news.category.includes(keyword))
    );
    
    if (filteredNews.length) {
        renderNews(filteredNews);
    } else {
        showError('没有找到相关新闻');
    }
}

// 渲染新闻列表
function renderNews(newsItems) {
    hideLoading();
    
    if (!newsItems || newsItems.length === 0) {
        newsContainer.innerHTML = '<div class="no-news">暂无新闻数据</div>';
        return;
    }
    
    newsContainer.innerHTML = newsItems.map(news => `
        <div class="news-card">
            <img src="${news.thumbnail_pic_s || 'https://via.placeholder.com/300x180?text=No+Image'}" 
                 alt="${news.title}" 
                 class="news-image"
                 onerror="this.src='https://via.placeholder.com/300x180?text=Image+Error'">
            <div class="news-content">
                <h3 class="news-title">${news.title}</h3>
                <p class="news-desc">${news.author || '未知作者'} | ${formatDate(news.date)}</p>
                <div class="news-meta">
                    <span>${news.category || '未分类'}</span>
                    <span class="news-source">${news.realtype || '未知来源'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知日期';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 显示加载状态
function showLoading() {
    loadingElement.style.display = 'block';
    newsContainer.innerHTML = '';
}

// 隐藏加载状态
function hideLoading() {
    loadingElement.style.display = 'none';
}

// 显示错误信息
function showError(message) {
    hideLoading();
    newsContainer.innerHTML = `<div class="error">${message}</div>`;
}