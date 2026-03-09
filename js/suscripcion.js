$(document).ready(function() {
    // Inicializar EmailJS
    (function(){
        emailjs.init("EMAILJS_PUBLIC_KEY");
    })();



    $("#subscribe-form").on("submit", function(e) {
        e.preventDefault();
        const serviceID = 'EMAILJS_SERVICE_ID';
        const templateID = 'EMAILJS_TEMPLATE_ID';
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
                $responseMsg.addClass('success').text('¡Gracias por suscribirte! Revisa tu correo para confirmar.');
                $form[0].reset();
                $responseMsg.addClass('animate__animated animate__fadeIn');
            })
            .catch(function(error) {
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

