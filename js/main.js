/*$(document).ready(function() {
    const n8nWebhookUrl = 'https://eduardocordova.app.n8n.cloud/webhook/4711ee21-b0fd-4081-a2ee-4254edc2d451/chat';

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

        const userMsgHtml = `
            <div class="chat-message user-message animate__animated animate__fadeIn">
                <div class="message-bubble you">
                    ${escapeHtml(message)}
                </div>
            </div>
        `;
        $('#chat-messages').append(userMsgHtml);
        $('#user-input').val('');
        
        scrollToBottom();

        showTypingIndicator();

        //aqui llama a n8n para llamar al bot xd
        $.ajax({
            url: n8nWebhookUrl,
            method: 'POST',
            data: JSON.stringify({ message: message }),
            contentType: 'application/json',
            success: function(response) {
                // Remove typing indicator
                $('.typing-indicator').remove();
                
                // Bot reply with animation
                const botReply = response.output || response[0].output;
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
                            <i class="bi bi-exclamation-triangle me-1"></i>
                            No pude conectar. Por favor intenta de nuevo.
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

*/
//AL FINAL OCURRIO UN ERROR CON ESTA COENXION AL FLUJO DE TRABAJO PRINCIPAL QUE USE CON N8N
//La verdad preferi utilizar la forma de agregar el chatbot que permite usar n8n, este codigo queda comentado ya que en la implementacion final se usara.
//tampoco borre el contenedor del chatbot, aqui me humillo n8n, pero volvere...