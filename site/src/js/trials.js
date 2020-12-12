const $modalTrialFailure = $('#modal-trial-failure');
const $modalTrialFailureMessage = $('#modal-trial-failure-message');

const showTrialRegistrationError = () => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('error');
    if (result == 'existent_student') {
        $modalTrialFailureMessage.html('There is a Student registered with this e-mail!');
        $modalTrialFailure.modal('show');
        setTimeout(() => $modalTrialFailure.modal('hide'), 5000);
    }
};

$(function() {
    showTrialRegistrationError();

    $('#trial-set-level-modal').on('show.bs.modal', (event) => {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var name = button.data('name');
        var modal = $(this)
        modal.find('#trial-level-student-id').val(id);
        modal.find('#trial-level-student-name').val(name);
    });
});