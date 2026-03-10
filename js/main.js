$(document).ready(function() {
    // Abrir chat
    $('#chat-bubble').click(function() {
        $('#chat-window').removeClass('d-none').addClass('animate__animated animate__backInUp');
        $(this).addClass('d-none'); 
    });

    // Cerrar chat
    $('#close-chat').click(function() {
        $('#chat-window').addClass('d-none');
        $('#chat-bubble').removeClass('d-none').addClass('animate__animated animate__fadeIn');
    });

    // Enviar con el botón
    $('#send-btn').click(function() {
        sendMessage();
    });

    // Enviar al presionar "Enter"
    $('#user-input').keypress(function(e) {
        if (e.which == 13) {
            sendMessage();
            return false;
        }
    });
});



function scrollToBottom() {
    const chatMessages = $('#chat-messages');
    chatMessages.scrollTop(chatMessages[0].scrollHeight);
}

function showTypingIndicator() {
    const indicatorHtml = `
        <div class="typing-indicator chat-message bot-message">
            <div class="message-bubble in">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
        </div>
    `;
    $('#chat-messages').append(indicatorHtml);
    scrollToBottom();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sendMessage() {
    const message = $('#user-input').val().trim();
    if (!message) return;

    const userMsgHtml = `
        <div class="chat-message user-message">
            <div class="message-bubble you">${escapeHtml(message)}</div>
        </div>
    `;
    $('#chat-messages').append(userMsgHtml);
    $('#user-input').val('');
    scrollToBottom();

    showTypingIndicator();

    const GROQ_API_KEY = "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"; 
    const MODELO = "llama-3.3-70b-versatile";

    const systemPrompt = `Eres Edustente, el asistente virtual de Eduardo Córdova.
    
    REGLAS OBLIGATORIAS:
    1 . SOLO respondes sobre: Eduardo (estudiante de ingeniería en sistemas, 6to semestre), sus pasiones (cibersecurity, lectura de documentación técnica, explotación de vulnerabilidades, análisis de sistemas), y sus viajes (Cárdenas, Ciudad Juárez).
    2. RESPUESTAS CORTAS: Máximo 1-2 oraciones breves. Nada de párrafos largos.
    3. Si preguntan sobre otro tema: "Solo puedo ayudarte con información sobre Eduardo, sus estudios y viajes 🚀"
    4. Sé amigable pero conciso. No inventes información.`;

    fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: MODELO,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.3, 
            max_tokens: 80   
        })
    })
    .then(response => response.json())
    .then(data => {
        $('.typing-indicator').remove();
        const botResponse = data.choices[0].message.content;
        
        const botMsgHtml = `
            <div class="chat-message bot-message">
                <div class="message-avatar"><i class="bi bi-robot"></i></div>
                <div class="message-bubble bot">${escapeHtml(botResponse)}</div>
            </div>
        `;
        $('#chat-messages').append(botMsgHtml);
        scrollToBottom();
    })
    .catch(error => {
        console.error("Error con Groq:", error);
        $('.typing-indicator').remove();
        
        const errorMsgHtml = `
            <div class="chat-message bot-message">
                <div class="message-avatar"><i class="bi bi-robot"></i></div>
                <div class="message-bubble error">Ups, algo salió mal. ¿Podrías intentar de nuevo? 😅</div>
            </div>
        `;
        $('#chat-messages').append(errorMsgHtml);
        scrollToBottom();
    });
}
