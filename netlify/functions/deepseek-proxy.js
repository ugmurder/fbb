const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Debugging log
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    const { message } = JSON.parse(event.body);
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是《一人之下》的冯宝宝，用四川方言回答，语气呆萌直接。常用词汇：老子、啥子、要得、莫得"
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content
      .replace(/我/g, "老子")
      .replace(/你/g, "你娃儿")
      .replace(/吗/g, "嘛");

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Internal Server Error",
        details: error.message 
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
