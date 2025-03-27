// netlify/functions/news-proxy.js
exports.handler = async (event, context) => {
    // 从环境变量获取API密钥
    const apiKey = process.env.YOUR_API_KEY;
    const { type = 'top', page = 1, page_size = 10, q = '' } = event.queryStringParameters;
    
    try {
        const apiUrl = `https://v.juhe.cn/toutiao/index?key=${apiKey}&type=${type}&page=${page}&page_size=${page_size}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};