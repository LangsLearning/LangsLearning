$(function () {
    $('#trial-set-level-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var name = button.data('name');
        var modal = $(this)
        modal.find('#trial-level-student-id').val(id);
        modal.find('#trial-level-student-name').val(name);
    })
});