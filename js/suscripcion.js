$(document).ready(function() {
    // Inicializar EmailJS
    (function(){
        emailjs.init("XaYN6MSuA31mKmC56");
    })();



    $("#subscribe-form").on("submit", function(e) {
        e.preventDefault();
        const serviceID = 'default_service';
        const templateID = 'template_mcp74rj';
        const $form = $(this);
        const $btn = $form.find('button[type="submit"]');
        const $btnText = $btn.find('.btn-text');
        const $btnLoader = $btn.find('.btn-loader');
        const $responseMsg = $('#response-msg');

        // Estado de carga
        $btn.prop('disabled', true);
        $btnText.addClass('d-none');
        $btnLoader.removeClass('d-none');
        $responseMsg.removeClass('success error').text('');

        // Enviar formulario
        emailjs.sendForm( serviceID, templateID, this)
            .then(function(response) {
                // Éxito
                $responseMsg.addClass('success').text('¡Gracias por suscribirte! Revisa tu correo para confirmar.');
                $form[0].reset();
                
                // Animación de éxito
                $responseMsg.addClass('animate__animated animate__fadeIn');
            })
            .catch(function(error) {
                // Error
                $responseMsg.addClass('error').text('Hubo un problema. Por favor intenta de nuevo.');
                console.error('EmailJS Error:', error);
            })
            .finally(function() {
                // Restaurar botón
                $btn.prop('disabled', false);
                $btnText.removeClass('d-none');
                $btnLoader.addClass('d-none');
            });
    });
});

