
        function openTab(tabName) {
            document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            event.currentTarget.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function switchSkill(type) {
            document.getElementById('list-tech').classList.remove('show');
            document.getElementById('list-soft').classList.remove('show');
            document.getElementById('btn-tech').classList.remove('active');
            document.getElementById('btn-soft').classList.remove('active');
            document.getElementById('list-' + type).classList.add('show');
            document.getElementById('btn-' + type).classList.add('active');
        }
        // --- GEMINI AI INTEGRATION ---
    async function askGemini() {
        const inputField = document.getElementById('user-input');
        const chatBox = document.getElementById('chat-container');
        const userText = inputField.value;

        if (!userText) return;

        // 1. Add User Message to Chat
        chatBox.innerHTML += `<div style="text-align: right; margin: 10px 0;"><span style="background: #e8f0fe; padding: 8px 12px; border-radius: 12px; display: inline-block; font-size: 0.9rem;">${userText}</span></div>`;
        inputField.value = "Thinking...";
        inputField.disabled = true;

        // 2. The Prompt Engineering (The "Secret Sauce")
        // We tell Gemini how to behave so it acts like a teacher, not a generic bot.
        const systemPrompt = "You are a strict but helpful Engineering Tutor for rural students. " +
                             "Keep answers short (max 3 sentences). " +
                             "If the user asks for a question, generate a coding problem based on their input. " +
                             "If they answer wrong, correct them gently. " +
                             "User Input: ";

        const finalPrompt = systemPrompt + userText;

        try {
            // 3. Call Google Gemini API (Direct Fetch)
            const API_KEY = "YOUR_API_KEY_HERE"; // <--- PASTE YOUR KEY HERE
            const url = `https://generativelanguage.googleapis.com/v1beta/...models/gemini-pro:generateContent...?key=${API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: finalPrompt }] }]
                })
            });

            const data = await response.json();
            const botReply = data.candidates[0].content.parts[0].text;

            // 4. Clean up formatting (Markdown to HTML basic) and display
            const cleanReply = botReply.replace(/\*\*/g, '<b>').replace(/\*/g, ''); 
            
            chatBox.innerHTML += `<div style="text-align: left; margin: 10px 0;"><span style="background: #f3f4f6; padding: 8px 12px; border-radius: 12px; display: inline-block; font-size: 0.9rem; border-left: 4px solid #9333ea;">${cleanReply}</span></div>`;
            
        } catch (error) {
            chatBox.innerHTML += `<div style="color: red; font-size: 0.8rem;">Error: Could not reach Gemini. Check API Key.</div>`;
            console.error(error);
        }

        // 5. Reset
        inputField.value = "";
        inputField.disabled = false;
        chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to bottom
    }
    // --- 1. TOGGLE CHAT VISIBILITY ---
    function toggleChat() {
        const box = document.getElementById('chat-box');
        const btn = document.getElementById('chat-fab');
        
        if (box.style.display === 'none' || box.style.display === '') {
            box.style.display = 'flex';
            btn.innerHTML = '<span class="material-icons" style="font-size: 30px;">keyboard_arrow_down</span>';
        } else {
            box.style.display = 'none';
            btn.innerHTML = '<span class="material-icons" style="font-size: 30px;">smart_toy</span>';
        }
    }

    // --- 2. DRAGGABLE LOGIC (So it "keeps changing positions") ---
    // User can drag the chat header to move the widget
    const wrapper = document.getElementById('chat-wrapper');
    const header = document.getElementById('chat-header');
    
    let isDragging = false;
    let startX, startY, initialRight, initialBottom;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = wrapper.getBoundingClientRect();
        // Calculate offsets from the right/bottom edge
        initialRight = document.documentElement.clientWidth - rect.right;
        initialBottom = document.documentElement.clientHeight - rect.bottom;
        
        header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const dx = startX - e.clientX;
        const dy = startY - e.clientY;

        wrapper.style.right = `${initialRight + dx}px`;
        wrapper.style.bottom = `${initialBottom + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'move';
    });

    // --- 3. GEMINI API LOGIC FOR WIDGET ---
    async function askGeminiWidget() {
        const input = document.getElementById('chat-input');
        const msgs = document.getElementById('chat-messages');
        const userText = input.value.trim();
        const API_KEY = "YOUR_API_KEY_HERE"; // <--- PASTE KEY HERE

        if (!userText) return;

        // User Bubble
        msgs.innerHTML += `<div style="text-align: right; margin-bottom: 10px;"><span style="background: #4285F4; color: white; padding: 8px 12px; border-radius: 12px 12px 0 12px; display: inline-block; max-width: 85%; font-size: 0.9rem;">${userText}</span></div>`;
        input.value = "";
        msgs.scrollTop = msgs.scrollHeight;

        // Loading Bubble
        const loadId = "load-" + Date.now();
        msgs.innerHTML += `<div id="${loadId}" style="text-align: left; margin-bottom: 10px;"><span style="background: #f3f4f6; color: #555; padding: 8px 12px; border-radius: 12px 12px 12px 0; display: inline-block; font-size: 0.8rem;">Thinking...</span></div>`;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Keep answer very short (max 20 words). Act as a coding tutor. Query: " + userText }] }]
                })
            });
            
            const data = await response.json();
            const reply = data.candidates[0].content.parts[0].text;
            
            // Remove loader and add reply
            document.getElementById(loadId).remove();
            
            // Format bold text
            const cleanReply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            msgs.innerHTML += `<div style="text-align: left; margin-bottom: 10px;"><span style="background: #e0e7ff; color: #333; padding: 8px 12px; border-radius: 12px 12px 12px 0; display: inline-block; max-width: 85%; font-size: 0.9rem;">${cleanReply}</span></div>`;
            
        } catch (e) {
            document.getElementById(loadId).innerHTML = "<span style='color:red'>Error. Try again.</span>";
        }
        msgs.scrollTop = msgs.scrollHeight;
    }
    
    // Allow pressing "Enter" to send
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            askGeminiWidget();
        }
    });
