const fs = require('fs');

async function testNIM() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const match = envFile.match(/NVIDIA_NIM_API_KEY="?(.*?)"?$/m);
    if (!match) return;
    const key = match[1];

    const model = "mistralai/mistral-large-3-675b-instruct-2512";
    console.log(`Testing ${model}...`);
    try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: "Hi" }],
                max_tokens: 5
            })
        });
        console.log(`  -> Status: ${res.status}`);
        if(res.status === 200) {
           const json = await res.json();
           console.log(json.choices[0].message.content);
        } else {
           console.log(await res.text());
        }
    } catch(e) {
        console.log(`  -> Error: ${e.message}`);
    }
}

testNIM();
