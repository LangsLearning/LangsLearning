$(function() {
    $("form").on('submit', () => {
            // prevent duplicate form submissions
        $(this).find(":submit").attr('disabled', 'disabled');
    });
});
