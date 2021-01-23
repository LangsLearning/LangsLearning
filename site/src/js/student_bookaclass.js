const $joinClassModal = $('div[data-dialog="join_class"]');
const $bookClassIdInput = $('input[data-id="class-id-to-schedule"]');
const $classesAvailableToSchedule = $(
  'b[data-id="classes-available-to-schedule"]'
);

$(function () {
  $(".classes_by_date__article>.card-header").on("click", function () {
    const $elem = $(this);
    const $article = $elem.parent();
    const shown = $article.attr("data-show");

    if (shown == "true") {
      $article.find(".classes__section").slideUp(400, function () {
        $article.attr("data-show", "false");
      });
    } else {
      $article.find(".classes__section").slideDown(400, function () {
        $article.attr("data-show", "true");
      });
    }
  });

  $("a[data-join-class]").on("click", function () {
    $bookClassIdInput.val($(this).attr("data-class-id"));
    $joinClassModal.modal("show");
  });

  $joinClassModal.on("hidden.bs.modal", function () {
    $bookClassIdInput.val("");
  });
});
