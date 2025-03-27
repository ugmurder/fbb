// netlify/functions/news-proxy.js
exports.handler = async (event, context) => {
    const { type = "top", page = "1", page_size = "10" } = event.queryStringParameters;
    
    // 从环境变量读取 API 密钥
    const apiKey = process.env.JUHE_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key not configured" }),
        };
    }

    try {
        const apiUrl = `https://v.juhe.cn/toutiao/index?key=${apiKey}&type=${type}&page=${page}&page_size=${page_size}`;
        
        // 注意：Node.js 18+ 可以直接用 `fetch`，旧版本需安装 `node-fetch`
        const response = await fetch(apiUrl);
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // 允许跨域
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch news" }),
        };
    }
};