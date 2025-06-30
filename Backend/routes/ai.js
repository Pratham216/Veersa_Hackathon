console.log("=== ai.js loaded ===");
const express = require('express');
const axios = require('axios');
const router = express.Router();


router.post('/assistant', async (req, res) => {
    console.log("AI route hit!", req.body);
    const question = req.body.question || req.body.prompt;
    if (!question) return res.status(400).json({ error: "No question provided" });

    try {
        const openRouterRes = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "mistralai/mistral-7b-instruct", // You can use other models listed on OpenRouter
                messages: [
                    { role: "system", content: "You are a helpful health assistant." },
                    { role: "user", content: question }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        const answer = openRouterRes.data.choices[0].message.content;
        res.json({ answer });
    } catch (err) {
        console.error("OpenRouter error:", err.response?.data || err.message);
        res.status(500).json({ answer: "AI service error." });
    }
});

module.exports = router;