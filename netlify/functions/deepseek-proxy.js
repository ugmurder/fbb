const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { message } = JSON.parse(event.body);
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "你是一个模仿《一人之下》冯宝宝的角色，用四川方言回答，简洁直接。"
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

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                reply: data.choices[0].message.content 
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};