const $joinClassModal = $('div[data-dialog="join_class"]');

$(function() {
    $('.classes_by_date__article>.card-header').on('click', function() {
        const $elem = $(this);
        const $article = $elem.parent();
        const shown = $article.attr('data-show');

        if (shown == 'true') {
            $article.find('.classes__section').slideUp(400, function() {
                $article.attr('data-show', 'false');
            });
        } else {
            $article.find('.classes__section').slideDown(400, function() {
                $article.attr('data-show', 'true');
            });
        }
    });

    $('a[data-join-class]').on('click', function() {
        $joinClassModal.modal('show');
    });
});