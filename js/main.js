$(document).ready(function() {
    const n8nWebhookUrl = 'https://eduardocordova.app.n8n.cloud/webhook/chatbot-blog';

    // Toggle chat window with animation
    $('#chat-bubble').click(function() {
        $('#chat-window').toggleClass('d-none');
        if (!$('#chat-window').hasClass('d-none')) {
            $('#chat-window').addClass('animate__animated animate__fadeInUp');
            setTimeout(() => $('#chat-window').removeClass('animate__animated animate__fadeInUp'), 500);
        }
    });
    
    $('#close-chat').click(function() {
        $('#chat-window').addClass('animate__animated animate__fadeOutDown');
        setTimeout(() => {
            $('#chat-window').addClass('d-none').removeClass('animate__animated animate__fadeOutDown');
        }, 300);
    });

    $('#send-btn').click(sendMessage);
    $('#user-input').keypress(function(e) { 
        if(e.which == 13) sendMessage(); 
    });

    function sendMessage() {
        const message = $('#user-input').val();
        if (!message) return;

        // Add user message with animation
        const userMsgHtml = `
            <div class="chat-message user-message animate__animated animate__fadeIn">
                <div class="message-bubble you">
                    ${escapeHtml(message)}
                </div>
            </div>
        `;
        $('#chat-messages').append(userMsgHtml);
        $('#user-input').val('');
        
        // Scroll to bottom
        scrollToBottom();

        // Show typing indicator
        showTypingIndicator();

        // Call n8n
$.ajax({
    url: n8nWebhookUrl,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
        message: message
    }),
    success: function(response) {
        $('.typing-indicator').remove();
        
        const botReply = response.output;

        const botMsgHtml = `
            <div class="chat-message bot-message animate__animated animate__fadeIn">
                <div class="message-avatar">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-bubble bot">
                    ${escapeHtml(botReply)}
                </div>
            </div>
        `;
        $('#chat-messages').append(botMsgHtml);
        scrollToBottom();
    },
    error: function(xhr) {
        console.log(xhr.responseText);
        $('.typing-indicator').remove();
        $('#chat-messages').append(`
            <div class="chat-message error-message animate__animated animate__fadeIn">
                <div class="message-bubble error">
                    Error de conexión con el servidor.
                </div>
            </div>
        `);
    }
});
    }

    function showTypingIndicator() {
        const typingHtml = `
            <div class="typing-indicator animate__animated animate__fadeIn">
                <div class="message-avatar">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        $('#chat-messages').append(typingHtml);
        scrollToBottom();
    }

    function scrollToBottom() {
        $('#chat-messages').animate({
            scrollTop: $('#chat-messages')[0].scrollHeight
        }, 300);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

