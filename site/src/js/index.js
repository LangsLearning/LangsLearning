const $window = $(window);
const $navbar = $('nav.navbar');
const $iptContactName = $('#ipt-contact-name');
const $iptContactEmail = $('#ipt-contact-email');
const $iptContactText = $('#ipt-contact-text');
const $iptContactToken = $('#ipt-contact-token');
const $btnContactSubmit = $('#btn-contact-submit');
const $formContact = $('#form-contact')[0];

const $iptTrialEmail = $('#ipt-trial-email');
const $btnTrialSubmit = $('#btn-trial-submit');
const $modalTrialSuccess = $('#modal-trial-success');
const $modalTrialFailure = $('#modal-trial-failure');

const $contactAlertSuccess = $('#contact-alert-sucess');
const $contactAlertError = $('#contact-alert-error');

const apiUrl = "http://localhost:3000";

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const isValidEmail = (email) => emailRegex.test(email);

const getContactData = () => {
    return {
        name: $iptContactName.val(),
        email: $iptContactEmail.val(),
        text: $iptContactText.val(),
        token: $iptContactToken.val()
    }
};

const contactDataIsValid = () => {
    const {name, email, text, token} = getContactData();
    return name && email && isValidEmail(email) && text && token;
};

const cleanContactForm = () => {
    $formContact.reset();
    getContactFormToken();
    $btnContactSubmit.prop('disabled', true);
};

const toggleContactSubmitButton = () => {
    if (contactDataIsValid()) {
        $btnContactSubmit.prop('disabled', false);
    } else {
        $btnContactSubmit.prop('disabled', true);
    }
};

const showContactSentMessage = () => {
    $contactAlertError.hide();
    $contactAlertSuccess.show("slow");
    setTimeout(() => $contactAlertSuccess.hide("slow"), 5000);
};

const showContactNotSentMessage = () => {
    $contactAlertSuccess.hide();
    $contactAlertError.show("slow");
    setTimeout(() => $contactAlertError.hide("slow"), 5000);
};

const submitContact = () => {
    const {name, email, text, token} = getContactData();
    $.ajax({
        type: "POST",
        url: `${apiUrl}/contact`,
        data: JSON.stringify({name, email, text, token}),
        success: (response, textStatus, jqXHR) => {
            console.log("E-mail sent!");
            cleanContactForm();
            showContactSentMessage();
        },
        error: (jqXHR, textStatus, error) => {
            console.log(error);
            cleanContactForm();
            showContactNotSentMessage();
        },
        dataType: "json",
        contentType: 'application/json'
      });
};

const getContactFormToken = () => {
    $.getJSON(`${apiUrl}/contact`, (data) => {
        const {token} = data;
        $iptContactToken.val(token);
      });
};

const listenOnWindowScroll = () => {
    $window.scroll((event) => {
        setNavbarClass();
    });
};

const setNavbarClass = () => {
    const scroll = $window.scrollTop();
    if (scroll > 60) {
        $navbar.removeClass('nav__invisible');
        $navbar.addClass('nav__visible', 1000);
        $navbar.removeClass('navbar-dark');
        $navbar.addClass('navbar-light', 1000);
    } else {
        $navbar.removeClass('nav__visible');
        $navbar.addClass('nav__invisible', 1000);
        $navbar.removeClass('navbar-light');
        $navbar.addClass('navbar-dark', 1000);
    }
};

const trialDataIsValid = () => {
    const email = $iptTrialEmail.val();
    return isValidEmail(email);
};

const toggleTrialSubmitButton = () => {
    if (trialDataIsValid()) {
        $btnTrialSubmit.prop('disabled', false);
    } else {
        $btnTrialSubmit.prop('disabled', true);
    }
};

const showTrialRequestResponse = () => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('trial_class');
    if (result == 'success') {
        $modalTrialSuccess.modal('show');
        setTimeout(() => $modalTrialSuccess.modal('hide'), 5000);
    } else if (result == 'failure') {
        $modalTrialFailure.modal('show');
        setTimeout(() => $modalTrialFailure.modal('hide'), 5000);
    }
};

$(function() {
    setNavbarClass();
    getContactFormToken();
    listenOnWindowScroll();

    $iptContactName.on('keyup', toggleContactSubmitButton);
    $iptContactEmail.on('keyup', toggleContactSubmitButton);
    $iptContactText.on('keyup', toggleContactSubmitButton);
    $iptTrialEmail.on('keyup', toggleTrialSubmitButton);
    $btnContactSubmit.on('click', submitContact);

    showTrialRequestResponse();
});