const $iptContactName = $('#ipt-contact-name');
const $iptContactEmail = $('#ipt-contact-email');
const $iptContactText = $('#ipt-contact-text');
const $iptContactToken = $('#ipt-contact-token');
const $btnContactSubmit = $('#btn-contact-submit');
const $formContact = $('#form-contact')[0];

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

$(function() {
    getContactFormToken();

    $iptContactName.on('keyup', toggleContactSubmitButton);
    $iptContactEmail.on('keyup', toggleContactSubmitButton);
    $iptContactText.on('keyup', toggleContactSubmitButton);
    $btnContactSubmit.on('click', submitContact);
});