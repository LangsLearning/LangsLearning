$(function() {
    $("form").on('submit', () => {
        console.log("Submit")
            // prevent duplicate form submissions
        $(this).find(":submit").attr('disabled', 'disabled');
    });
});