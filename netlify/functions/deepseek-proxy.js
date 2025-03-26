// netlify/functions/deepseek-proxy.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 调试日志
  console.log('收到请求体:', event.body);
  
  try {
    // 验证请求方法
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: '只支持POST请求' })
      };
    }

    // 解析请求体
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '无效的JSON格式' })
      };
    }

    // 验证必需字段
    if (!parsedBody.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '缺少message字段' })
      };
    }

    // 调用DeepSeek API
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是《一人之下》的冯宝宝，用四川方言回答，语气呆萌直接。常用词汇：老子、啥子、要得、莫得'
          },
          {
            role: 'user',
            content: parsedBody.message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
      timeout: 10000 // 10秒超时
    });

    // 处理API响应
    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error('DeepSeek API错误:', apiResponse.status, errorData);
      throw new Error(`DeepSeek API返回错误: ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();
    console.log('API响应:', JSON.stringify(responseData, null, 2));

    // 转换回复为冯宝宝风格
    const reply = responseData.choices[0].message.content
      .replace(/我/g, '老子')
      .replace(/你/g, '你娃儿')
      .replace(/吗/g, '嘛');

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('全局捕获错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: '服务器开小差了',
        details: error.message 
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
