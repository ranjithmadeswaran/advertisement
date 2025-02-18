var pageValue = $('body').data('page');

var frontendValue = $('body').data('frontend');
const languageId = $('#language-settings').data('language-id');
var datatableLang = {
    "lengthMenu": $('#datatable_data').data('length_menu'),
    "info": $('#datatable_data').data('info'),
    "infoEmpty": $('#datatable_data').data('info_empty'),
    "infoFiltered": $('#datatable_data').data('info_filter'),
    "search": $('#datatable_data').data('search'),
    "zeroRecords": $('#datatable_data').data('zero_records'),
    "paginate": {
        "first": $('#datatable_data').data('first'),
        "last": $('#datatable_data').data('last'),
        "next": $('#datatable_data').data('next'),
        "previous": $('#datatable_data').data('prev'),
    }
}
function updateAuthId(callback) {
    $.ajax({
        url: "/api/get-session-user-id",
        type: "GET",
        success: function (response) {
            if (response.user_id) {
                const userId = response.user_id;
                localStorage.setItem("auth_admin_id", userId);
                if (typeof callback === "function") {
                    callback(userId); // Pass the updated userId to the callback
                }
            }
        },
        error: function () {
            toastr.error("Unable to fetch session data. Please try again.");
        },
    });
}
updateAuthId(function (updatedUserId) {
    const auth_id = updatedUserId;

});
$(document).ready(function () {
    $('.copy-admin-details').on('click', function (event) {
        event.preventDefault(); // Prevent default anchor behavior

        const email = $(this).data('email');
        const password = $(this).data('password');

        $('#adminLoginForm input[name="email"]').val(email);
        $('#adminLoginForm input[name="password"]').val(password);
    });
});

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "30000",
    "hideDuration": "10000",
    "timeOut": "50000",
    "extendedTimeOut": "10000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

function initTooltip() {
    $('[data-tooltip="tooltip"]').tooltip({
        trigger: 'hover',
    });
}

if (pageValue === 'login' || pageValue === 'adminlogin') {
    document.addEventListener('DOMContentLoaded', function () {
        const token = localStorage.getItem('admin_token');

        if (token) {
           // window.location.href = '/admin/dashboard';
        }
    });

    $('#adminLoginForm').on('submit', function(event) {
        event.preventDefault();

        const email = $('#email').val().trim();
        const password = $('#password').val().trim();
        const rememberMe = $('#rememberMe').is(':checked');
        const errorMessageContainer = $('#error-message');

        errorMessageContainer.empty();
        $('#email').siblings('.error-message').remove();
        $('#password').siblings('.error-message').remove();

        let hasError = false;
        if (!email) {
            $('#email').after('<div class="error-message" style="color: red;">Email is required.</div>');
            hasError = true;
        }

        if (!password) {
            $('#password').after('<div class="error-message" style="color: red;">Password is required.</div>');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        $.ajax({
            url: '/admin/login-process',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'Accept': 'application/json',
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            data: JSON.stringify({
                email: email,
                password: password,
                remember: rememberMe
            }),
            beforeSend: function () {
                $("#signInBtn").attr("disabled", true);
                $("#signInBtn").html('<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>');
            },
            success: function(response) {
                $("#signInBtn").removeAttr("disabled").html('Sign In');
                localStorage.setItem('admin_token', response.token);
                localStorage.setItem('user_id', response.user_id);
                window.location.href = '/admin/dashboard';
            },
            error: function(xhr) {
                $("#signInBtn").removeAttr("disabled").html('Sign In');
                errorMessageContainer.empty();
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    if (Array.isArray(xhr.responseJSON.message)) {
                        xhr.responseJSON.message.forEach(function(error) {
                            errorMessageContainer.append('<div>' + error + '</div>');
                        });
                    } else {
                        errorMessageContainer.append('<div>' + xhr.responseJSON.message + '</div>');
                    }
                } else {
                    errorMessageContainer.text('An error occurred. Please try again.');
                }
            }
        });
    });
}

if (pageValue === 'admin.dashboard') {
    fetchDashboardData();
       // Request permission and retrieve the token on page load
    document.addEventListener('DOMContentLoaded', requestPermissionAndGetToken);
    function fetchDashboardData() {
        $.ajax({
            url: '/api/admin/dashboard-data',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function(response) {
            },
            error: function(xhr) {
            }
        });
    }
    applyBookingStatusStyles();
    function applyBookingStatusStyles() {
        $(".booking-status").each(function () {
            const status = $(this).data("status");
            let statusClass = "";
            let statusText = "";

            switch (status) {
                case 1:
                    statusClass = "badge badge-primary ms-2";
                    statusText = "Open";
                    break;
                case 2:
                    statusClass = "badge badge-soft-info ms-2";
                    statusText = "In progress";
                    break;
                case 3:
                    statusClass = "badge badge-soft-danger ms-2";
                    statusText = "Provider Cancelled";
                    break;
                case 4:
                    statusClass = "badge badge-soft-warning ms-2";
                    statusText = "Refund Initiated";
                    break;
                case 5:
                    statusClass = "badge badge-soft-success ms-2";
                    statusText = "Completed";
                    break;
                    case 6:
                    statusClass = "badge badge-soft-success ms-2";
                        statusText = "Order Completed";
                        break;
                case 7:
                        statusClass = "badge badge-soft-success ms-2";
                        statusText = "Refund Completed";
                        break;
                case 8:
                        statusClass = "badge badge-soft-danger ms-2";
                        statusText = "Customer Cancelled";
                        break;

                default:
                    statusClass = "status-unknown";
                    statusText = "Unknown";
            }

            $(this).addClass(statusClass).text(statusText);
        });
    }
}

if (pageValue != 'login') {
    $(document).on('click', '#logout-button', function(event) {
        event.preventDefault();
        $.ajax({
            url: '/admin/logout',
            type: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code === 200) {
                    toastr.success(response.message);
                    localStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_token');
                    localStorage.removeItem('user_id');
                    sessionStorage.removeItem('user_id');
                    window.location.href = '/admin/login';
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr) {
                toastr.error('An error occurred while logging out.');
            }
        });
    });
}
/* Currency settings */
if (pageValue === 'admin.currency-settings') {

    $(document).ready(function() {
        var langCode = $('body').data('lang');
        languageTranslate(langCode);
        loadCurrencies();
    });

    function loadCurrencies() {
        $.ajax({
            url: '/api/currencies/list',
            type: 'POST',
            data: {
                'order_by': 'asc',
                'count_per_page' : 10,
                'sort_by' : '',
                'search' : ''
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function(response) {
                if (response.code == 200) {
                    var currency_data = response.data;
                    var currency_table_body = $('.currency_list');
                    var response_data;
                    if (currency_data.length === 0) {
                        $('#currency_table').DataTable().destroy();
                        response_data += `
                            <tr>
                                <td colspan="6" class="text-center">${lg_currency_empty_info}</td>
                            </tr>`;

                    } else {
                        $.each(currency_data, (index,val) => {
                            response_data += `
                                <tr>
                                    <td>${val.name}</td>
                                    <td>${val.code}</td>
                                    <td>${val.symbol}</td>
                                     <td>${formatCurrency(val.currency_value)}</td>
                                     <td>
                                        <span
                                            class="badge ${(val.status == 1)? 'badge-soft-success' : 'badge-soft-danger'} d-inline-flex align-items-center"><i
                                                class="ti ti-circle-filled fs-5 me-1"></i>${(val.status == 1)? 'Active' : 'In-active'}</span>
                                    </td>
                                     ${
                                        $('#has_permission').data('edit') == 1 ?
                                        `<td>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input currency_default" ${(val.is_default == 1)? 'checked' : ''} type="checkbox"
                                                    role="switch" id="switch-sm" data-id="${val.id}">
                                            </div>
                                        </td>` : ''
                                      }
                                      ${
                                        $('#has_permission').data('visible') == 1 ?
                                    `<td>
                                        <li style="list-style: none;">
                                         ${
                                                $('#has_permission').data('edit') == 1 ?
                                                `<a class="save_currency_modal"
                                                href="#"
                                                data-id="${val.id}" data-name="${val.name}" data-code="${val.code}" data-status="${val.status}" data-isDefault="${val.is_default}" data-symbol="${val.symbol}" data-currencyValue="${val.currency_value}">
                                                <i class="ti ti-pencil fs-20" data-tooltip="tooltip" title="${$('.currency_save_btn').data('edit')}"></i>
                                                </a>` : ''
                                            }

                                            ${
                                                $('#has_permission').data('delete') == 1 ?
                                                `<a class="delete delete_currency_modal" href="#" data-bs-toggle="modal" data-bs-target="#currency_delete" data-id="${val.id}">
                                                <i class="ti ti-trash m-3 fs-20" data-tooltip="tooltip" title="${$('.currency_save_btn').data('delete')}"></i>
                                                </a>` : ''
                                            }

                                        </li>
                                    </td>` : ''
                                    }
                                </tr>`;
                            });
                        }
                        currency_table_body.html(response_data);
                        initTooltip();

                    if ((currency_data.length != 0) && !$.fn.dataTable.isDataTable('#currency_table')) {
                        $('#currency_table').DataTable({
                            "ordering": true,
                            "language": datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.responseJSON.code === 500) {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });

    }

    $(document).on('change', '.currency_default', function(e) {
        e.preventDefault();

        var currencyId = $(this).attr('data-id');

        var formData = {
            'id': currencyId,
        };

        $.ajax({
            url: '/api/currencies/set-default',
            type: 'POST',
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.success) {
                    loadCurrencies();
                    toastr.success(response.message);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr) {
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    toastr.error(xhr.responseJSON.message);
                } else {
                    toastr.error('Failed to set default currency. Please try again.');
                }
            }
        });
    });

    $(document).on('click', '.delete_currency_modal', function(e) {
        e.preventDefault();
        var id = $(this).data('id');
        $('.currency_delete_btn').data('id', id);
    });

    $(document).on('click', '.currency_delete_btn', function (e) {
        e.preventDefault();
        var delete_id = $(this).data('id');

        $.ajax({
            url: '/api/currencies/delete',
            type: 'POST',
            data : {
                'id' : delete_id
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                $('#currency_table').DataTable().destroy();
                if (response.code === 200) {
                    loadCurrencies();
                    $("#currency_delete").modal("hide");
                    toastr.success(response.message);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr) {
                toastr.error('An error occurred while deleting currency.');
            }
        });
    });

    $(document).on('click', '.save_currency_modal', function (e) {
        e.preventDefault();
        var data_id = $(this).data('id');
        $(".error-text").text("");
        $(".form-control").removeClass('is-invalid is-valid');
        if (data_id == '') {
            $('#name').val('').removeClass('is-valid is-invalid').next('.error-message').remove();
            $('#save_currency_id').val('');
            $('#code').val('').removeClass('is-valid is-invalid').next('.error-message').remove();
            $('#symbol').val('').removeClass('is-valid is-invalid').next('.error-message').remove();
            $('#currency_value').val('1').removeClass('is-valid is-invalid').next('.error-message').remove();
            $('#save_currency_status').prop('checked', false);
            $('#save_currency_default').prop('checked', false);
            $('.currency_modal_title').html($('.currency_modal_title').data('add-title'));
            $('#save_currency').modal('show');
        } else {
            var currency_name = $(this).attr('data-name');
            var currency_id = $(this).attr('data-id');
            var currency_code = $(this).attr('data-code');
            var currency_status = $(this).attr('data-status');
            var currency_is_default = $(this).attr('data-isDefault');
            currency_status = (currency_status == 1)? true : false;
            currency_is_default = (currency_is_default == 1)? true : false;
            var symbol = $(this).attr('data-symbol');
            var currency_value = $(this).attr('data-currencyValue');
            $('.currency_modal_title').html($('.currency_modal_title').data('edit-title'));
            $('#name').val(currency_name);
            $('#save_currency_id').val(currency_id);
            $('#code').val(currency_code);
            $('#save_currency_status').prop('checked', currency_status);
            $('#save_currency_default').prop('checked', currency_is_default);
            $('#symbol').val(symbol);
            $('#currency_value').val(currency_value);
             // Disable currency_value if USD is being edited
            if (currency_code === '$') {
                $('#currency_value').prop('disabled', true);
            } else {
                $('#currency_value').prop('disabled', false);
            }
            $('#save_currency').modal('show');
        }
    });

    $('#currencyForm').validate({
        rules: {
            name: {
                required: true,
            },
            code: {
                required: true,
            },
            symbol: {
                required: true,
            },
            currency_value: {
                required: true,
            }
        },
        messages: {
            name: {
                required: "Currency name is required.",
            },
            code: {
                required: "Code is required.",
            },
            symbol: {
                required: "Symbol is required.",
            },
            currency_value: {
                required: "Value is required.",
            }
        },
        errorPlacement: function (error, element) {
            var errorId = element.attr("id") + "_error";
            $("#" + errorId).text(error.text());
        },
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).removeClass("is-invalid").addClass("is-valid");
            var errorId = element.id + "_error";
            $("#" + errorId).text("");
        },
        onkeyup: function (element) {
            $(element).valid();
        },
        onchange: function (element) {
            $(element).valid();
        },
        submitHandler: function (form) {
            var formData = {
                'name' : $('#name').val(),
                'code' : $('#code').val(),
                'status' : $('#save_currency_status').is(':checked')? 1 : 0,
                'is_default' : $('#save_currency_default').is(':checked')? 1 : 0,
                'id' : $('#save_currency_id').val(),
                'symbol': $('#symbol').val(),
                'currency_value': $('#currency_value').val()
            };

            $.ajax({
                url: '/api/currencies/save',
                type: 'POST',
                data : formData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                beforeSend: function () {
                    $(".currency_save_btn").attr("disabled", true);
                    $(".currency_save_btn").html(
                        '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                    );
                },
                success: function(response) {
                    if ($.fn.DataTable.isDataTable('#currency_table')) {
                        $('#currency_table').DataTable().destroy();
                    }
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".currency_save_btn").removeAttr("disabled");
                    $('.currency_save_btn').html(lg_save);
                    if (response.code === 200) {
                        $('#save_currency').modal('hide');
                        loadCurrencies();
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(error) {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".currency_save_btn").removeAttr("disabled");
                    $('.currency_save_btn').html(lg_save);
                    var errors = error.responseJSON.message;
                    if (errors) {
                        $.each(errors, function (key, message) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(message[0]);
                        });
                    } else {
                        toastr.error('An error occurred while creating currency.');
                    }
                }
            });
        }
    });

    function languageTranslate(langCode = '') {
        $.ajax({
            url: "/api/translate",
            type: "POST",
            dataType: "json",
            data: {
                language_code: langCode,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                const trans = response.translated_values;

                $('.form-control').removeClass('is-invalid').removeClass('is-valid');
                $('.invalid-feedback').text('');

                if (response.code === 200 && Object.keys(trans).length > 0) {

                    lg_currency_empty_info = trans.no_curency_available;

                    $('#currencyForm').validate().settings.messages = {
                        name: {
                            required: trans.currency_name_required,
                        },
                        code: {
                            required: trans.code_required,
                        },
                        symbol: {
                            required: trans.symbol_required,
                        },
                        currency_value: {
                            required: trans.currency_value_required,
                        }
                    };
                }

            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }


}

if (pageValue === 'settings.email-settings') {
    $(document).ready(function () {
        getemailsettingsdata();
    });
    function getemailsettingsdata() {
        $.ajax({
           url: '/api/settings/getsettingsdata',
           type: 'POST',
           data: { type: 1 },
           headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
               'Accept': 'application/json'
           },
           success: function (response) {
            if (response.code==200) {
                var settingsdata=response.data.settings;
                $.each(settingsdata, function(index, item) {
                    if(settingsdata[index].key=='phpmail_status' && settingsdata[index].value=='1'){
                        $("#phpmail").prop('checked', true);
                    }else  if(settingsdata[index].key=='smtp_status' && settingsdata[index].value=='1'){
                        $("#smtp").prop('checked', true);
                    }else  if(settingsdata[index].key=='sendgrid_status' && settingsdata[index].value=='1'){
                        $("#sendgrid").prop('checked', true);
                    }
                });
            } else {
                toastr.error(response.message);
            }
        },
        error: function (error) {
            toastr.error('An error occurred while get the Email Settings.');
        }
       });
   }
  //add
    $(document).ready(function () {

        $('#phpemailform').on('submit', function (event) {
            event.preventDefault();
            let formData = {
                phpmail_from_name: $('input[name="name"]').val(),
                phpmail_from_email: $('input[name="from_email"]').val(),
                phpmail_password: $('input[name="password"]').val(),
                type: $('#type1').val(),
                phpmail_status: $('#statusToggle').is(':checked') ? 1 : 0,
            };

            $.ajax({
                url: '/api/settings/communication/storesettings',
                type: 'POST',
                data: formData,
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                success: function (response) {
                    if (response.code=='200') {
                        toastr.success(response.message);
                        $('#connect_php').modal('hide');
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    toastr.error('An error occurred while adding the Email Settings.');
                }
            });
        });
        $('#smtpform').on('submit', function (event) {
            event.preventDefault();
            let isValid = true;

            // Clear previous error messages
            $('.error-text').text('');

            // Email validation
            const email = $('#smtp_from_email').val().trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) {
                if (languageId === 2) {
                    loadJsonFile('email_required', function (langtst) {
                        $('#smtp_from_email_error').text(langtst);
                    });
                }else{
                    $('#smtp_from_email_error').text('Email is required.');
                }
                isValid = false;
            } else if (!emailPattern.test(email)) {
                if (languageId === 2) {
                    loadJsonFile('email_format', function (langtst) {
                        $('#smtp_from_email_error').text(langtst);
                    });
                }else{
                    $('#smtp_from_email_error').text('Enter a valid email address.');
                }
                isValid = false;
            }
            const emailname = $('#smtp_from_name').val().trim();
            if (!emailname) {
                $('#smtp_from_name_error').show();
                if (languageId === 2) {
                    loadJsonFile('From_Name_required', function (langtst) {
                        $('#smtp_from_name_error').text(langtst);
                    });
                }else{
                    $('#smtp_from_name_error').text('From Name is required.');
                }
                isValid = false;
            }

            // Port validation
            const port = $('#port').val().trim();
            const portPattern = /^[0-9]+$/;
            if (!port) {
                $('#port_error').show();
                if (languageId === 2) {
                    loadJsonFile('Port_required', function (langtst) {
                        $('#port_error').text(langtst);
                    });
                }else{
                    $('#port_error').text('Port is required.');
                }
                isValid = false;
            } else if (!portPattern.test(port) || port < 1 || port > 65535) {
                if (languageId === 2) {
                    loadJsonFile('valid_port_number', function (langtst) {
                        $('#port_error').text(langtst);
                    });
                }else{
                    $('#port_error').text('Enter a valid port number (1-65535).');
                }
                isValid = false;
            }

            // Host validation
            const host = $('#host').val().trim();
            if (!host) {
                $('#host_error').show();
                if (languageId === 2) {
                    loadJsonFile('Host is required', function (langtst) {
                        $('#host_error').text(langtst);
                    });
                }else{
                    $('#host_error').text('Host is required.');
                }
                isValid = false;
            }

            // Password validation
            const password = $('#smtp_password').val().trim();
            if (!password) {
                $('#smtp_password_error').show();
                if (languageId === 2) {
                    loadJsonFile('password_required', function (langtst) {
                        $('#smtp_password_error').text(langtst);
                    });
                }else{
                    $('#smtp_password_error').text('Password is required.');
                }
                isValid = false;
            } else if (password.length < 6) {
                $('#smtp_password_error').show();
                if (languageId === 2) {
                    loadJsonFile('Password_characters', function (langtst) {
                        $('#smtp_password_error').text(langtst);
                    });
                }else{
                    $('#smtp_password_error').text('Password must be at least 6 characters long.');
                }
                isValid = false;
            }
            if (isValid) {
                let formData = {
                    smtp_from_email: $('#smtp_from_email').val(),
                    smtp_password: $('#smtp_password').val(),
                    smtp_from_name: $('#smtp_from_name').val(),
                    host: $('input[name="host"]').val(),
                    port: $('input[name="port"]').val(),
                    type: $('#type2').val(),
                    smtp_status: $('#statusToggle').is(':checked') ? 1 : 0,
                };

                $.ajax({
                    url: '/api/settings/communication/storesettings',
                    type: 'POST',
                    data: formData,
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $(".smtp_btn").attr("disabled", true).html('<div class="spinner-border text-light" role="status"></div>');
                    }
                })
                .done((response) => {
                    $(".smtp_btn").removeAttr("disabled").html($('.smtp_btn').data('save'));
                    if (response.code=='200') {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $('#connect_smtp').modal('hide');
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".smtp_btn").removeAttr("disabled").html($('.smtp_btn').data('save'));
                    if (error.status === 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                            $("#" + key + "_error").show();
                        });
                    } else {
                        toastr.error('An error occurred while adding the Smtp Settings.');
                    }
                });
            }
        });
        $('#sendgridform').on('submit', function (event) {
            event.preventDefault();
            let isValid = true;

            // Clear previous error messages
            $('.error-text').text('');

            // Email validation
            const email = $('#sendgrid_from_email').val().trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) {
                if (languageId === 2) {
                    loadJsonFile('email_required', function (langtst) {
                        $('#sendgrid_from_email_error').text(langtst);
                    });
                }else{
                    $('#sendgrid_from_email_error').text('Email is required.');
                }
                isValid = false;
            } else if (!emailPattern.test(email)) {
                if (languageId === 2) {
                    loadJsonFile('email_format', function (langtst) {
                        $('#sendgrid_from_email_error').text(langtst);
                    });
                }else{
                    $('#sendgrid_from_email_error').text('Enter a valid email address.');
                }
                isValid = false;
            }
            const sendgrid = $('#sendgrid_key').val().trim();
            if (!sendgrid) {
                $('#sendgrid_key_error').show();
                if (languageId === 2) {
                    loadJsonFile('Sendgrid_Key_required', function (langtst) {
                        $('#sendgrid_key_error').text(langtst);
                    });
                }else{
                    $('#sendgrid_key_error').text('Sendgrid Key is required.');
                }
                isValid = false;
            }
            if(isValid == true){
                let formData = {
                    sendgrid_from_email: $('#sendgrid_from_email').val(),
                    sendgrid_key: $('#sendgrid_key').val(),
                    type: $('#type3').val(),
                };

                $.ajax({
                    url: '/api/settings/communication/storesettings',
                    type: 'POST',
                    data: formData,
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $(".sendgrid_btn").attr("disabled", true).html('<div class="spinner-border text-light" role="status"></div>');
                    }
                })
                .done((response) => {
                    $(".sendgrid_btn").removeAttr("disabled").html($('.sendgrid_btn').data('save'));
                    if (response.code=='200') {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $('#connect_sendgrid').modal('hide');
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".sendgrid_btn").removeAttr("disabled").html($('.sendgrid_btn').data('save'));
                    if (error.status === 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                            $("#" + key + "_error").show();
                        });
                    } else {
                        toastr.error('An error occurred while adding the Sendgrid Settings.');
                    }
                });
            }
        });
    });
    $(document).on('click', '.integrate', function(e) {
        e.preventDefault();
        var Id = $(this).data('id');
        var type = $(this).data('type');
        $.ajax({
            url: '/api/settings/getemailsettings',
            type: 'POST',
            data: {
                id: Id,
                type: type,
           },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code==200) {
                    var settingsdata=response.data;
                    $(settingsdata).each(function( index, val) {
                       if(val.type=='phpmail'){
                            $("#"+val.key).val(val.value);
                            $('#status_toggle').prop('checked', val.phpmail_status == 1);
                        }else  if(val.type=='smtp'){
                            $("#"+val.key).val(val.value);
                            $('#status_toggle').prop('checked', val.smtp_status == 1);
                        } if(val.type=='sendgrid'){
                            $("#"+val.key).val(val.value);
                       }
                });
                } else {
                    toastr.error('Error: ' + response.message);
                }
            },
            error: function(xhr) {
                toastr.error('Failed to set mail settings. Please try again.');
            }
        });

    });
   //Make Default
    $(document).ready(function() {
        $(document).on('click', '.make_default', function(e) {
            e.preventDefault();
            var type = $(this).data('type');
            var checkbox=$(this);
            var isChecked = checkbox.is(':checked');
            var toggleText = $('#'+ type +'toggletext');
            $.ajax({
                url: "/api/settings/sms/storesmsstatus",
                type: 'POST',
                data: {
                    type: type,
                    status: isChecked ? 1 : 0
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        if (response.data[0].value === '1' && response.data[0].type === type) {
                            $("#"+type).prop('checked', true);
                            if(type=='phpmail'){
                                $("#smtp,#sendgrid").prop('checked', false);
                            }
                            else if(type=='smtp'){
                                $("#phpmail,#sendgrid").prop('checked', false);
                            }else if(type=='sendgrid'){
                                $("#phpmail,#smtp").prop('checked', false);
                            }
                        } else {
                            checkbox.prop('checked', false);
                        }
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }

                    } else {
                        toastr.error('Error: ' + response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error('Failed to set default Mail. Please try again.');
                }
            });
        });
    });
}

if (pageValue === 'settings.email-templates') {
    $(document).ready(function () {
        template_table();
        $('.otherdiv').hide();
        // Initialize Summernote editor
        $('#summernote').summernote();
        $('#add_template').on('show.bs.modal', function () {
            $('#templateform')[0].reset(); // Reset the form data
            $('#templatetype').select2('val',['']);
            $('#notification_type').select2('val',['']);
            $('#summernote').summernote('code', "");
        });

        $('.placeholder_value').on('click', function() {
            var selectedContent = $(this).data('value');
            var templateType = $("#templatetype").val();

            if (templateType == 1) {
                var summernoteEditor = $('#summernote');
                summernoteEditor.summernote('focus');
                summernoteEditor.summernote('editor.restoreRange');
                summernoteEditor.summernote('editor.insertText', selectedContent);
                summernoteEditor.summernote('editor.saveRange');
            } else {
                var otherContent = $('#othercontent');
                var cursorPos = otherContent.prop('selectionStart');
                var textBefore = otherContent.val().substring(0, cursorPos);
                var textAfter = otherContent.val().substring(cursorPos);
                otherContent.val(textBefore + selectedContent + textAfter);
            }
        });


        // Handle search input
        $('#searchLanguage').on('input', function () {
            template_table(1); // Reset to the first page on new search
        });

        $("#templatetype").on('change',function(){
           var tempval= $(this).val();
           if(tempval=="1"){
              $('.subjectfield').show();
              $('.maildiv').show();
              $('.otherdiv').hide();
           }else{
            $('.subjectfield').hide();
            $('.maildiv').hide();
            $('.otherdiv').show();
           }
        });
    });
    function template_table(page) {
        $.ajax({
            url: '/api/settings/gettemplatelist',
            type: 'POST',
            dataType: 'json',
            data: {
                order_by: 'desc',
                sort_by: 'id',
                page: page,
                search: $('#searchLanguage').val()
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
                if (response.code === '200') {
                    templatesTable(response.data, response.meta);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error('An error occurred while fetching templates.');
                    }
                } else {
                    toastr.error('An error occurred while fetching templates.');
                }
                toastr.error('Error fetching templates:', error);
            }
        });
    }

    function templatesTable(templates, meta) {
        let tableBody = '';

        if (templates.length > 0) {
            templates.forEach(template => {
                tableBody += `
                    <tr>
                        <td>${template.type=='1' ? 'Email' : template.type=='2' ? 'SMS' : 'Notifications'}</td>
                        <td>${template.notification_type_name}</td>
                         <td>${template.title}</td>
                        <td>
                            <span class="badge ${template.status == '1' ? 'badge-soft-success' : 'badge-soft-danger'} d-inline-flex align-items-center">
                                <i class="ti ti-circle-filled fs-5 me-1"></i>${template.status == '1' ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        ${
                            $('#has_permission').data('visible') == 1 ?
                        `<td>
                                ${
                                    $('#has_permission').data('delete') == 1 ?
                                        `<a class="edit_data icon-only" href="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#add_template"
                                            data-id="${template.id}"
                                            data-type="${template.type}"
                                            data-notificationtype="${template.notification_type}"
                                            data-title="${template.title}"
                                            data-subject="${template.subject}"
                                            data-status="${template.status}">
                                            <i class="ti ti-pencil fs-20"></i>
                                        </a>` : ''
                                }
                                ${
                                    $('#has_permission').data('delete') == 1 ?
                                        `<a class="icon-only" href="#" data-bs-toggle="modal" data-bs-target="#delete-modal" data-id="${template.id}">
                                            <i class="ti ti-trash m-3 fs-20"></i>
                                        </a>` : ''
                                }
                        </td>` : ''
                        }
                    </tr>
                `;
            });
        } else {
            if (languageId === 2) {
                loadJsonFile('No Data Found', function (langtst) {
                    tableBody = `
                <tr>
                    <td colspan="6" class="text-center">`+langtst+`</td>
                </tr>
            `;
                });
            }else{
                tableBody = `
                <tr>
                    <td colspan="6" class="text-center">No Data Found</td>
                </tr>
            `;
            }

        }

        $('#TemplateTable tbody').html(tableBody);
        if (!$.fn.dataTable.isDataTable('#TemplateTable')) {
            $('#TemplateTable').DataTable({
                "ordering": true,
                language: datatableLang
            });
        }
    }

    function setupPagination(meta) {
        let paginationHtml = '';
        for (let i = 1; i <= meta.last_page; i++) {
            paginationHtml += `<li class="page-item ${meta.current_page === i ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`;
        }

        $('#pagination').html(paginationHtml);

        // Handle click event for pagination
        $('#pagination').on('click', '.page-link', function (e) {
            e.preventDefault();
            const page = $(this).text();
            template_table(page); // Fetch languages for the selected page
        });
    }

    //add
    $(document).ready(function () {
        $('#templateform').on('submit', function (event) {
            event.preventDefault();
              // validation
              isValid = true;
              const apikey = $('#templatetype').val();
              if (!apikey) {
                  $('#type_error').show();
                  if (languageId === 2) {
                    loadJsonFile('Template_Type_required', function (langtst) {
                        $('#type_error').text(langtst);
                    });
                }else{
                    $('#type_error').text('Template Type is required.');
                }
                  isValid = false;
              }
              const secretkey = $('#notification_type').val().trim();
              if (!secretkey) {
                  $('#notification_type_error').show();
                  if (languageId === 2) {
                    loadJsonFile('Notification_Type_required', function (langtst) {
                        $('#notification_type_error').text(langtst);
                    });
                }else{
                    $('#notification_type_error').text('Notification Type is required.');
                }
                  isValid = false;
              }
              const senderid = $('#title').val().trim();
              if (!senderid) {
                  $('#title_error').show();
                  if (languageId === 2) {
                    loadJsonFile('title_required', function (langtst) {
                        $('#title_error').text(langtst);
                    });
                }else{
                    $('#title_error').text('Title is required.');
                }
                  isValid = false;
              }
              if (apikey==1) {
                const senderid = $('#subject').val().trim();
                if (!senderid) {
                    $('#subject_error').show();
                    if (languageId === 2) {
                        loadJsonFile('Subject_required', function (langtst) {
                            $('#subject_error').text(langtst);
                        });
                    }else{
                        $('#subject_error').text('Subject is required.');
                    }
                    isValid = false;
                }
              }
            if(isValid==true){
                var summernoteContent = $('#summernote').summernote('code');
                // Set the content to the target field
                $('.content').val(summernoteContent);
                let formData = {
                    id: $('input[name="id"]').val(),
                    type: $('#templatetype').val(),
                    notification_type: $('#notification_type').val(),
                    title: $('input[name="title"]').val(),
                    subject: $('input[name="subject"]').val(),
                    content: summernoteContent,
                    othercontent: $("#othercontent").val(),
                    status: $('#status').is(':checked') ? 1 : 0,
                    user_id: localStorage.getItem('user_id')
                };
                $.ajax({
                    url: '/api/settings/templates/store',
                    type: 'POST',
                    data:formData,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $(".add_template_btn").attr("disabled", true).html('<div class="spinner-border text-light" role="status"></div>');
                    }
                })
                .done((response) => {
                    $(".add_template_btn").removeAttr("disabled").html("Add Template");

                    if (response.success) {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $('#add_template').modal('hide');
                        template_table();
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".add_template_btn").removeAttr("disabled").html("Add Template");

                    if (error.status === 422) {
                        $.each(error.responseJSON.errors, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr.error('An error occurred while adding the template.');
                    }
                });
            }
        });

        $('#notification_type,#templatetype').on('change', function() {
            // Remove the 'is-invalid' class to update field styling
            $(this).removeClass('is-invalid');

            // Hide the associated error message
            $(this).siblings('.error-text').hide();
        });
    });

    $(document).on('click', '.edit_data', function(e) {
        e.preventDefault();

        var templateId = $(this).data('id');
        var type = $(this).data('type');
        var notificationtype = $(this).data('notificationtype');
        var title = $(this).data('title');
        var subject = $(this).data('subject');
        var status = $(this).data('status');
        if(type=="1"){
            $('.subjectfield').show();
         }else{
            $('.subjectfield').hide();
         }
        $('#template_id').val(templateId);
        $('#templatetype').val(type).trigger('change').select2();
        $('#notification_type').val(notificationtype).trigger('change').select2();
        $('#title').val(title);
        $('#subject').val(subject);
        $('#status_toggle').prop('checked', status == 1);
        $.ajax({
            url: '/api/settings/edittemplate',
            type: 'POST',
            data: {id:templateId},
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
                if (response.code=='200') {
                    var content=response.data[0].content;
                    $('#content').val(content);
                    if(type!=1){
                        $('#othercontent').val(content);
                    }
                    $('#summernote').summernote('code', content);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error('An error occurred while edit the template.');
                    }
                } else {
                    toastr.error('An error occurred while edit the template.');
                }
                toastr.error('Error edit template:', error);
            }
        });
    });

    $(document).on('click', '.dropdown-item[data-bs-toggle="modal"]', function(e) {
        e.preventDefault();

        var templateId = $(this).data('id');
        $('#confirmDelete').data('id', templateId);
    });

    $(document).on('click', '#confirmDelete', function(e) {
        e.preventDefault();

        var templateId = $(this).data('id');
        $.ajax({
            url: '/api/settings/templates/deletetemplate',
            type: 'POST',
            data: {
                id: templateId,
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.success) {
                    if (languageId === 2) {
                        loadJsonFile(response.message, function (langtst) {
                            toastr.success(langtst);
                        });
                    }else{
                        toastr.success(response.message);
                    }
                    $('#delete-modal').modal('hide');
                    template_table(); // Refresh the templateId table
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while trying to delete the template.');
            }
        });
    });

}

if (pageValue === 'settings.sms-settings') {

    $(document).ready(function () {
        loadSMSSetting();
    });

    function loadSMSSetting() {
        $.ajax({
            url: "/api/settings/getsettingsdata",
            type: "POST",
            data: { type: 2 },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    const requiredKeys = [
                        "nexmo_api_key",
                        "nexmo_secret_key",
                        "nexmo_sender_id",
                        "nexmo_status",
                        "twofactor_api_key",
                        "twofactor_secret_key",
                        "twofactor_sender_id",
                        "twofactor_status",
                        "twilio_api_key",
                        "twilio_secret_key",
                        "twilio_sender_id",
                        "twilio_status",
                    ];

                    const filteredSettings = response.data.settings.filter(
                        (setting) => requiredKeys.includes(setting.key)
                    );

                    filteredSettings.forEach((setting) => {
                        if (setting.key === "nexmo_status") {
                            if (setting.value === "1") {
                                $("#nexmo").prop("checked", true);
                            } else {
                                $("#nexmo").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });

                    filteredSettings.forEach((setting) => {
                        if (setting.key === "twofactor_status") {
                            if (setting.value === "1") {
                                $("#twofactor").prop("checked", true);
                            } else {
                                $("#twofactor").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });
                    filteredSettings.forEach((setting) => {
                        if (setting.key === "twilio_status") {
                            if (setting.value === "1") {
                                $("#twilio").prop("checked", true);
                            } else {
                                $("#twilio").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON.code === 404) {
                    toastr.error(xhr.responseJSON.message);
                }
            },
        });
    }

    $(document).ready(function () {
        $(document).on('click', '.make_default', function(e) {
            e.preventDefault();
            var type = $(this).data('type');
            var checkbox=$(this);
            var isChecked = checkbox.is(':checked');
            var toggleText = $('#'+ type +'toggletext');
            $.ajax({
                url: "/api/settings/sms/storesmsstatus",
                type: 'POST',
                data: {
                    type: type,
                    status: isChecked ? 1 : 0
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        if (response.data[0].value === '1' && response.data[0].type === type) {
                            $("#"+type).prop('checked', true);
                            if(type=='nexmo'){
                                $("#twofactor,#twilio").prop('checked', false);
                            }
                            else if(type=='twofactor'){
                                $("#nexmo,#twilio").prop('checked', false);
                            }else if(type=='twilio'){
                                $("#nexmo,#twofactor").prop('checked', false);
                            }
                        } else {
                            checkbox.prop('checked', false);
                        }
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                    } else {
                        toastr.error('Error: ' + response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error('Failed to set default sms. Please try again.');
                }
            });
        });
        $("#addNexmoForm").submit(function (event) {
            event.preventDefault();
             // validation
             isValid = true;
             const apikey = $('#nexmo_api_key').val().trim();
             if (!apikey) {
                 $('#nexmo_api_key_error').show();
                 if (languageId === 2) {
                    loadJsonFile('ApiKey_required', function (langtst) {
                        $('#nexmo_api_key_error').text(langtst);
                    });
                }else{
                    $('#nexmo_api_key_error').text('Api Key is required.');
                }
                 isValid = false;
             }
             const secretkey = $('#nexmo_secret_key').val().trim();
             if (!secretkey) {
                 $('#nexmo_secret_key_error').show();
                 if (languageId === 2) {
                    loadJsonFile('SecretKey_required', function (langtst) {
                        $('#nexmo_secret_key_error').text(langtst);
                    });
                }else{
                    $('#nexmo_secret_key_error').text('Secret Key is required.');
                }
                 isValid = false;
             }
             const senderid = $('#nexmo_sender_id').val().trim();
             if (!senderid) {
                 $('#nexmo_sender_id_error').show();
                 if (languageId === 2) {
                    loadJsonFile('SenderID_required', function (langtst) {
                        $('#nexmo_sender_id_error').text(langtst);
                    });
                }else{
                    $('#nexmo_sender_id_error').text('Sender ID is required.');
                }
                 isValid = false;
             }

            if(isValid==true){
               var formData = new FormData(this);
                $.ajax({
                    url: "/api/settings/communication/storesettings",
                    method: "POST",
                    data: formData,
                    dataType: "json",
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $(".nexmo_btn").attr("disabled", true);
                        $(".nexmo_btn").html(
                            '<div class="spinner-border text-light" role="status"></div>'
                        );
                    },
                })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".nexmo_btn").removeAttr("disabled");
                    $(".nexmo_btn").html($('.nexmo_btn').data('save'));
                    if (response.code === 200) {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $("#connect_nexmo").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".nexmo_btn").removeAttr("disabled");
                    $(".nexmo_btn").html($('.nexmo_btn').data('save'));

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                            $("#" + key + "_error").show();
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
            }
        });

       $("#addfactorForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/settings/communication/storesettings",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                beforeSend: function () {
                    $(".nexmo_btn").attr("disabled", true);
                    $(".nexmo_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".nexmo_btn").removeAttr("disabled");
                    $(".nexmo_btn").html("Save");
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#connect_factor").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".nexmo_btn").removeAttr("disabled");
                    $(".nexmo_btn").html("Save");

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });

        $("#addtwilioForm").submit(function (event) {
            event.preventDefault();
             // validation
             isValid = true;
             const apikey = $('#twilio_api_key').val().trim();
             if (!apikey) {
                 $('#twilio_api_key_error').show();
                 if (languageId === 2) {
                    loadJsonFile('ApiKey_required', function (langtst) {
                        $('#twilio_api_key_error').text(langtst);
                    });
                }else{
                    $('#twilio_api_key_error').text('Api Key is required.');
                }
                 isValid = false;
             }
             const secretkey = $('#twilio_secret_key').val().trim();
             if (!secretkey) {
                 $('#twilio_secret_key_error').show();
                 if (languageId === 2) {
                    loadJsonFile('SecretKey_required', function (langtst) {
                        $('#twilio_secret_key_error').text(langtst);
                    });
                }else{
                    $('#twilio_secret_key_error').text('Secret Key is required.');
                }
                 isValid = false;
             }
             const senderid = $('#twilio_sender_id').val().trim();
             if (!senderid) {
                 $('#twilio_sender_id_error').show();
                 if (languageId === 2) {
                    loadJsonFile('SenderID_required', function (langtst) {
                        $('#twilio_sender_id_error').text(langtst);
                    });
                }else{
                    $('#twilio_sender_id_error').text('Sender ID is required.');
                }
                 isValid = false;
             }

            if(isValid==true){
                var formData = new FormData(this);

                $.ajax({
                    url: "/api/settings/communication/storesettings",
                    method: "POST",
                    data: formData,
                    dataType: "json",
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $(".twilio_btn").attr("disabled", true);
                        $(".twilio_btn").html(
                            '<div class="spinner-border text-light" role="status"></div>'
                        );
                    },
                })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".twilio_btn").removeAttr("disabled");
                    $(".twilio_btn").html($('.twilio_btn').data('save'));
                    if (response.code === 200) {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $("#connect_twilio").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".twilio_btn").removeAttr("disabled");
                    $(".twilio_btn").html($('.twilio_btn').data('save'));

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                            $("#" + key + "_error").show();
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
            }
        });
    });
}

if(pageValue === 'settings.notification-settings') {
    $(document).ready(function () {
        getnotificationsettingsdata();
        $('.savesettings').click(function(e){
            e.preventDefault();

            let formData = {
                type: $('input[name="type"]').val(),
            };
            $('input[type="checkbox"]:checked').each(function() {
                formData[$(this).attr('name')] = $(this).val(); // Add checked checkboxes to formData
            });
            $.ajax({
                url: "/api/settings/communication/storesettings",
                method: "POST",
                data: formData,
                dataType: "json",
                cache: false,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                beforeSend: function () {
                    $(".nexmo_btn").attr("disabled", true);
                    $(".nexmo_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".nexmo_btn").removeAttr("disabled");
                    $(".nexmo_btn").html("submit");
                    if (response.code === 200) {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $("#connect_nexmo").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".nexmo_btn").removeAttr("disabled");
                    $(".nexmo_btn").html("submit");

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });
    function getnotificationsettingsdata() {
        $.ajax({
           url: '/api/settings/getsettingsdata',
           type: 'POST',
           data: { type: 3 },
           headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
               'Accept': 'application/json'
           },
           success: function (response) {
            if (response.code==200) {
                var settingsdata=response.data.settings;
                $.each(settingsdata, function(index, item) {
                    if(settingsdata[index].key=='emailNotifications' && settingsdata[index].value=='1'){
                        $("#emailNotifications").prop('checked', true);
                    }else  if(settingsdata[index].key=='pushNotifications' && settingsdata[index].value=='1'){
                        $("#pushNotifications").prop('checked', true);
                    }else  if(settingsdata[index].key=='smsNotifications' && settingsdata[index].value=='1'){
                        $("#smsNotifications").prop('checked', true);
                    }
                });
            } else {
                toastr.error(response.message);
            }
        },
        error: function (error) {
            toastr.error('An error occurred while get the Notification Settings.');
        }
       });
   }

   $("#configurationForm").validate({
        rules: {
            project_id: {
                required: true,
            },
            client_email: {
                email: true,
                required: true,
            },
            private_key: {
                required: true,
            }
        },
        messages: {
            project_id: {
                required: $('#project_id_error').data('required')
            },
            client_email: {
                email: $('#client_email_error').data('required'),
                required: $('#client_email_error').data('email_format')
            },
            private_key: {
                required: $('#private_key_error').data('required')
            }
        },
        errorPlacement: function (error, element) {
            var errorId = element.attr("id") + "_error";
            $("#" + errorId).text(error.text());
        },
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).removeClass("is-invalid").addClass("is-valid");
            var errorId = element.id + "_error";
            $("#" + errorId).text("");
        },
        onkeyup: function (element) {
            $(element).valid();
        },
        onchange: function (element) {
            $(element).valid();
        },
        submitHandler: function (form) {
            $.ajax({
                url: "/api/settings/communication/storesettings",
                type: "POST",
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
                },
                data: {
                    type: 'fcm',
                    project_id: $('#project_id').val(),
                    client_email: $('#client_email').val(),
                    private_key: $('#private_key').val()
                },
                beforeSend: function () {
                    $("#configurationSaveBtn").attr("disabled", true).html(
                        '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                    );
                },
                success: function (response) {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $("#configurationSaveBtn").removeAttr("disabled").html($('#configurationSaveBtn').data('save'));
                    $('#del-account').modal('hide');
                    if (response.code === 200) {
                        $('#configuration_modal').modal('hide');
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        getFcmCongfiguration();
                    }
                },
                error: function (error) {
                    $(".error-text").text("");
                    $("#configurationSaveBtn").removeAttr("disabled").html($('#configurationSaveBtn').data('save'));
                    $(".form-control").removeClass("is-invalid is-valid");
                    if (error.responseJSON.code === 422) {
                        $.each(error.responseJSON.errors, function (key, val) {
                            $("#" + key + "_del").addClass("is-invalid");
                            $("#" + key + "_del_error").text(val[0]);
                        });
                    } else {
                        toastr.error(error.responseJSON.message);
                    }
                },
            });
        },
    });

    function getFcmCongfiguration() {
        $.ajax({
            url: '/api/settings/getsettingsdata',
            type: 'POST',
            data: { type: 3 },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
             if (response.code==200) {
                 var settingsdata=response.data.settings;
                 $.each(settingsdata, function(index, item) {
                     if(settingsdata[index].key=='project_id'){
                        $('#project_id').val(settingsdata[index].value);
                     }else  if(settingsdata[index].key=='client_email'){
                        $('#client_email').val(settingsdata[index].value);
                     }else  if(settingsdata[index].key=='private_key'){
                        $('#private_key').val(settingsdata[index].value);
                     }
                 });
             } else {
                 toastr.error(response.message);
             }
         },
         error: function (error) {
             toastr.error('An error occurred while get the Notification Settings.');
         }
        });
    }

    $(document).on('click', '#viewFcm', function() {
        $(".error-text").text("");
        $(".form-control").removeClass("is-invalid is-valid");
        getFcmCongfiguration();
    });

}

if (pageValue === 'admin.commission') {

    $(document).ready(function () {
        adminCommissionList();
    });

    function adminCommissionList() {
        $.ajax({
            url: '/api/admin/general-setting/list',
            type: 'POST',
            data: { 'group_id': 2 },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {

                if (response.code === 200) {
                    const requiredKeys = ['commission_type', 'commission_rate_percentage', 'commission_rate_fixed'];
                    const filteredSettings = response.data.settings.filter(setting => requiredKeys.includes(setting.key));
                    var selectedType = '';

                    filteredSettings.forEach(setting => {
                        if (setting.value == 'percentage') {
                            $('#' + setting.key).val(setting.value);
                            selectedType = setting.value;
                        }
                        else if (setting.value == 'fixed') {
                            $('#' + setting.key).val(setting.value);
                            selectedType = setting.value;
                        }

                        if (setting.key == ('commission_rate_' + selectedType)) {
                            $('#commission_rate').val(setting.value);
                        }
                    });
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON.code === 404) {
                    toastr.error(xhr.responseJSON.message);
                }
            }
        });
    }

    $(document).on('change', '#commission_type', function () {
        var selectedType = $(this).val();
        $.ajax({
            url: '/api/admin/general-setting/list',
            type: 'POST',
            data: { 'group_id': 2 },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
                if (response.code === 200) {
                    const requiredKeys = ['commission_rate_percentage', 'commission_rate_fixed'];
                    const filteredSettings = response.data.settings.filter(setting => requiredKeys.includes(setting.key));

                    filteredSettings.forEach(setting => {
                        if (('commission_rate_' + selectedType) == setting.key) {
                            $('#commission_rate').val(setting.value);
                        }
                    });
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON.code === 404) {
                    toastr.error(xhr.responseJSON.message);
                }
            }
        });

    });

    $("#adminCommissionForm").on('submit', function (event) {
        event.preventDefault();
        var formData = $(this).serialize();

        $.ajax({
            url: "/api/admin/update-admin-commission",
            method: "POST",
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
            },
            beforeSend: function () {
                $(".admin_commission_btn").attr("disabled", true);
                $(".admin_commission_btn").html(
                    '<div class="spinner-border text-light" role="status"></div>'
                );
            },
            success: function (response) {
                $('.admin_commission_btn').attr('disabled', false);
                $('.admin_commission_btn').html($('.admin_commission_btn').data('save_text'));
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid");
                $(".form-select").removeClass("is-invalid");

                if (response.code === 200) {
                    toastr.success(response.message);
                    adminCommissionList();
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr) {
                $('.admin_commission_btn').removeAttr('disabled');
                $('.admin_commission_btn').html($('.admin_commission_btn').data('save_text'));
                if (xhr.status === 422){
                    $.each(xhr.responseJSON.message, function (key, val) {
                        $("#" + key + "_error").text(val);
                        $("#" + key).addClass("is-invalid");
                    });
                }
                else {
                    toastr.error(xhr.responseJSON.message, "bg-danger");
                }
            }
        });
    });
}

if (pageValue === 'admin.tax-options') {

    function taxOptionsList() {
        $.ajax({
            url: '/api/admin/general-setting/list',
            type: 'POST',
            data: { 'group_id': 3 },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
                if (response.code === 200) {
                    $('.tax_option_list').empty();
                    if (response.data.taxCount > 5) {
                        $('#add_tax_btn').css("pointer-events", "none");
                    } else {
                        $('#add_tax_btn').css("pointer-events", "auto");
                    }

                    let settings = response.data.settings;
                    if (settings.length === 0) {
                        $('.tax_option_list').append(`
                            <tr>
                                <td colspan="5" class="text-center">No data found</td>
                            </tr>
                        `);
                    } else {

                        for (let i = 0; i < settings.length; i += 3) {
                            let taxType = settings[i].value;
                            let taxRate = settings[i + 1].value;
                            let taxTypeKey = settings[i].key;
                            let taxRateKey = settings[i + 1].key;
                            let taxStatusKey = settings[i + 2].key;
                            let taxTypeId = settings[i].id;
                            let taxRateId = settings[i + 1].id;
                            let taxStatus = settings[i + 2].value;
                            let checkedVal = taxStatus == 1 ? 'checked' : '';

                            const row = `
                                <tr>
                                    <td>${taxType}</td>
                                    <td>${taxRate}</td>
                                     ${
                                        $('#has_permission').data('edit') == 1 ?
                                        `<td>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input tax_status" ${checkedVal} type="checkbox" role="switch" id="switch-sm" data-tax-type-status="${taxStatusKey}">
                                            </div>
                                         </td>` : ''
                                      }
                                    ${
                                        $('#has_permission').data('visible') == 1 ?
                                    `<td>
                                    ${
                                        $('#has_permission').data('edit') == 1 ?
                                        `<a href="#" class="btn btn-outline-light bg-white btn-icon me-2 edit-tax-rate"
                                        data-bs-toggle="modal" data-bs-target="#add_tax_rate"
                                        data-tax-type="${taxType}" data-tax-rate="${taxRate}"
                                        data-tax-type-key="${taxTypeKey}" data-tax-rate-key="${taxRateKey}"
                                        data-tax-type-id="${taxTypeId}" data-tax-rate-id="${taxRateId}">
                                            <i class="ti ti-edit"></i>
                                        </a>` : ''
                                    }

                                    ${
                                        $('#has_permission').data('delete') == 1 ?
                                        `<a href="#" class="btn btn-outline-light bg-white btn-icon me-2 delete-tax-rate"
                                        data-bs-toggle="modal" data-bs-target="#tax_delete_modal"
                                        data-del-tax-type-key="${taxTypeKey}" data-del-tax-rate-key="${taxRateKey}"
                                        data-del-tax-status="${taxStatusKey}">
                                            <i class="ti ti-trash"></i>
                                        </a>` : ''
                                    }
                                    </td>` : ''
                                    }
                                </tr>
                            `;
                            $('.tax_option_list').append(row);
                        }
                        // Attach event handler to edit buttons
                        $('.edit-tax-rate').on('click', function () {
                            const taxType = $(this).data('tax-type');
                            const taxRate = $(this).data('tax-rate');
                            const taxTypeKey = $(this).data('tax-type-key');
                            const taxRateKey = $(this).data('tax-rate-key');
                            const taxTypeId = $(this).data('tax-type-id');
                            const taxRateId = $(this).data('tax-rate-id');

                            $('.tax_modal_title').html($('.tax_modal_title').data('edit_tax_rate'));
                            $('#method').val('update');
                            $('#tax_type').val(taxType);
                            $('#tax_rate').val(taxRate);
                            $('#tax_type_id').val(taxTypeId);
                            $('#tax_rate_id').val(taxRateId);

                            $(".error-text").text("");
                            $(".form-control").removeClass("is-invalid");
                        });

                        $('.delete-tax-rate').on('click', function() {
                            const taxType = $(this).data('del-tax-type-key');
                            const taxRate = $(this).data('del-tax-rate-key');
                            const taxStatus = $(this).data('del-tax-status');
                            $('#del_tax_type').val(taxType);
                            $('#del_tax_rate').val(taxRate);
                            $('#del_tax_status').val(taxStatus);
                        });

                        $('.tax_status').on('change', function () {
                            let taxType = $(this).data('tax-type-status');
                            let newStatus = $(this).is(':checked') ? 1 : 0;

                            var data = {
                                'tax_type_staus': taxType,
                                'status': newStatus
                            };

                            $.ajax({
                                url: '/api/admin/tax-status-change',
                                type: 'POST',
                                data: data,
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                                    'Accept': 'application/json'
                                },
                                success: function (response) {
                                    if (response.code === 200) {
                                        toastr.success(response.message);
                                    }
                                },
                                error: function () {
                                    toastr.error('An error occurred while updating status');
                                }
                            });
                        });

                    }
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON && xhr.responseJSON.code === 404) {
                    toastr.error(xhr.responseJSON.message);
                }
            }
        });
    }

    $(document).ready(function () {

        taxOptionsList();

        $('#add_tax_btn').on('click', function() {
            $('.tax_modal_title').html($('.tax_modal_title').data('add_tax_rate'));
            $('#method').val('add');
            $('#addTaxRateForm').trigger('reset');
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid");
        });

        $("#addTaxRateForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/admin/save-tax-options",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                beforeSend: function () {
                    $(".tax_options_btn").attr("disabled", true);
                    $(".tax_options_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
            .done((response, statusText, xhr) => {
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid");
                $(".tax_options_btn").removeAttr("disabled");
                $(".tax_options_btn").html($('.tax_options_btn').data('save_text'));
                if (response.code === 200) {
                    toastr.success(response.message);
                    $("#add_tax_rate").modal('hide');
                    taxOptionsList();
                } else {
                    toastr.error(response.message);
                }
            })
            .fail((error) => {
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid");
                $(".tax_options_btn").removeAttr("disabled");
                $(".tax_options_btn").html($('.tax_options_btn').data('save_text'));
                if (error.status == 422) {
                    $.each(error.responseJSON.errors, function (key, val) {
                        $("#" + key).addClass("is-invalid");
                        $("#" + key + "_error").text(val[0]);
                    });
                } else {
                    toastr(error.responseJSON.message, "bg-danger");
                }
            });
        });

        $('.delete_tax_option').on('click', function (e) {
            e.preventDefault();

            var formData = {
                'tax_type' : $('#del_tax_type').val(),
                'tax_rate' : $('#del_tax_rate').val(),
                'tax_status' : $('#del_tax_status').val()
            };

            $.ajax({
                url: '/api/admin/delete-tax-options',
                type: 'POST',
                data : formData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                },
                success: function(response) {
                    if (response.code === 200) {
                        taxOptionsList();
                        $('#tax_delete_modal').modal('hide');
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error(xhr);
                }
            });
        });

    });
}

/* Cedential settings */
if (pageValue === "admin.credential-settings") {
    $(document).ready(function () {
        loadMapSettings();
        loadCredentialSetting();
    });

    function loadMapSettings() {
        $.ajax({
            url: '/api/admin/index-invoice-setting',
            type: 'POST',
            data: {'group_id': 32},
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function(response) {
                if (response.code === 200) {
                    const requiredKeys = ['milesradious', 'goglemapkey', 'google_map_status'];
                    const filteredSettings = response.data.settings.filter(setting => requiredKeys.includes(setting.key));

                    filteredSettings.forEach(setting => {
                        const element = $('#' + setting.key);
                        if (setting.key === 'milesradious') {
                            $('#milesradius').val(setting.value);
                        }  else if (setting.key === 'goglemapkey') {
                            $('#goe_key').val(setting.value);
                        } else if (setting.key === "google_map_status") {
                            if (setting.value === "1") {
                                $("#google_map_status").prop("checked", true);
                            } else {
                                $("#google_map_status").prop("checked", false);
                            }
                        } else {
                            element.val(setting.value);
                        }
                    });
                }
            },
            error: function(xhr) {
                if (xhr.responseJSON && xhr.responseJSON.code === 404) {
                    toastr.error(xhr.responseJSON.message);
                }
            }
        });
    }

    $('#googleMapForm').submit(function(event) {
        event.preventDefault();

        $(".error-text").text("");
        $(".form-control").removeClass("is-invalid");

        let isValid = true;
        let formData = new FormData();
        formData.append('goe_key', $('#goe_key').val());
        formData.append('milesradius', $('#milesradius').val());
        formData.append('group_id', 32);

        $.ajax({
            url: "/api/admin/update-search-setting",
            method: "POST",
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            dataType: "json",
            contentType: false,
            processData: false,
            cache: false,
            beforeSend: function () {
                $('#googleMapBtn').attr('disabled', true).html('<div class="spinner-border text-light" role="status"></div>');
            },
        }).done((response) => {
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid");
            $("#googleMapBtn").removeAttr("disabled");
            $("#googleMapBtn").html($('#googleMapBtn').data('update'));
            if (response.code === 200) {
                toastr.success(response.message);
                loadOtpSettings();
            } else {
                toastr.error(response.message);
            }
        }).fail((error) => {
            $('#googleMapBtn').removeAttr('disabled').html($('#googleMapBtn').data('update'));
            if (error.status == 422) {
                $.each(error.responseJSON.errors, function (key, val) {
                    $("#" + key).addClass("is-invalid");
                    $("#" + key + "_error").text(val[0]);
                });
            } else {
                toastr.error(error.responseJSON.message, "bg-danger");
            }
        });
    });

    $("#google_map_status").on("change", function () {
        let googleMapStatus = $(this).is(":checked") ? 1 : 0;

        let formData = {
            google_map_status: googleMapStatus,
        };

        $.ajax({
            url: "/api/admin/update-google-map-status",
            type: "POST",
            data: formData,
            dataType: "json",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    toastr.success(response.message);
                } else {
                    toastr.error("Failed to update google map status.");
                }
            },
            error: function (error) {
                toastr.error(
                    "An error occurred while updating the google map status."
                );
            },
        });
    });

    $(".credential-btn").on("click", function (e) {
        e.preventDefault();
        loadCredentialSetting();
    });

    function loadCredentialSetting() {
        $.ajax({
            url: "/api/credential/list",
            type: "POST",
            data: { group_id: 4 },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    const requiredKeys = [
                        "captcha_status",
                        "captcha_site_key",
                        "captcha_secret_key",
                        "google_tag_id",
                        "tag_status",
                        "google_analytics_id",
                        "analytics_status",
                        "chatgpt_status",
                        "chatgpt_api_key",
                    ];

                    const filteredSettings = response.data.settings.filter(
                        (setting) => requiredKeys.includes(setting.key)
                    );

                    filteredSettings.forEach((setting) => {
                        if (setting.key === "captcha_status") {
                            if (setting.value === "1") {
                                $("#captcha_status").prop("checked", true);
                            } else {
                                $("#captcha_status").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });

                    filteredSettings.forEach((setting) => {
                        if (setting.key === "tag_status") {
                            if (setting.value === "1") {
                                $("#tag_status").prop("checked", true);
                            } else {
                                $("#tag_status").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });

                    filteredSettings.forEach((setting) => {
                        if (setting.key === "analytics_status") {
                            if (setting.value === "1") {
                                $("#analytics_status").prop("checked", true);
                            } else {
                                $("#analytics_status").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });
                    filteredSettings.forEach((setting) => {
                        if (setting.key === "chatgpt_status") {
                            if (setting.value === "1") {
                                $("#chatgpt_status").prop("checked", true);
                            } else {
                                $("#chatgpt_status").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON.code === 404) {
                    toastr.error(xhr.responseJSON.message);
                }
            },
        });
    }

    $(document).ready(function () {
        $("#googleRecaptchaForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/credential/save/recaptcha",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".recaptcha_setting_btn").attr("disabled", true);
                    $(".recaptcha_setting_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".recaptcha_setting_btn").removeAttr("disabled");
                    $(".recaptcha_setting_btn").html($('.analytics_setting_btn').data('update'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        loadCredentialSetting();
                        $("#add_google_captacha").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".recaptcha_setting_btn").removeAttr("disabled");
                    $(".recaptcha_setting_btn").html($('.analytics_setting_btn').data('update'));

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    $(document).ready(function () {
        $("#captcha_status").on("change", function () {
            let captchaStatus = $(this).is(":checked") ? 1 : 0;

            let formData = {
                captcha_status: captchaStatus,
            };

            $.ajax({
                url: "/api/credential/status/recaptcha",
                type: "POST",
                data: formData,
                dataType: "json",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error("Failed to update captcha status.");
                    }
                },
                error: function (error) {
                    toastr.error(
                        "An error occurred while updating the captcha status."
                    );
                },
            });
        });
    });

    $(document).ready(function () {
        $("#googleTagForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/credential/save/tag-manager",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".tag_setting_btn").attr("disabled", true);
                    $(".tag_setting_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".tag_setting_btn").removeAttr("disabled");
                    $(".tag_setting_btn").html($('.analytics_setting_btn').data('update'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        loadCredentialSetting();
                        $("#add_google_tag").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".tag_setting_btn").removeAttr("disabled");
                    $(".tag_setting_btn").html($('.analytics_setting_btn').data('update'));

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    $(document).ready(function () {
        $("#tag_status").on("change", function () {
            let tagStatus = $(this).is(":checked") ? 1 : 0;

            let formData = {
                tag_status: tagStatus,
            };

            $.ajax({
                url: "/api/credential/status/tag-manager",
                type: "POST",
                data: formData,
                dataType: "json",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error("Failed to update captcha status.");
                    }
                },
                error: function (error) {
                    toastr.error(
                        "An error occurred while updating the captcha status."
                    );
                },
            });
        });
    });

    $(document).ready(function () {
        $("#googleAnalyticsForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/credential/save/analytics",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".analytics_setting_btn").attr("disabled", true);
                    $(".analytics_setting_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".analytics_setting_btn").removeAttr("disabled");
                    $(".analytics_setting_btn").html($('.analytics_setting_btn').data('update'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        loadCredentialSetting();
                        $("#google_analytics").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".analytics_setting_btn").removeAttr("disabled");
                    $(".analytics_setting_btn").html($('.analytics_setting_btn').data('update'));

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    $(document).ready(function () {
        $("#analytics_status").on("change", function () {
            let analyticsStatus = $(this).is(":checked") ? 1 : 0;

            let formData = {
                analytics_status: analyticsStatus,
            };

            $.ajax({
                url: "/api/credential/status/analytics-status",
                type: "POST",
                data: formData,
                dataType: "json",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error("Failed to update captcha status.");
                    }
                },
                error: function (error) {
                    toastr.error(
                        "An error occurred while updating the captcha status."
                    );
                },
            });
        });
         $("#chatgptForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/credential/save/chatgpt",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".chatgpt_setting_btn").attr("disabled", true);
                    $(".chatgpt_setting_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".chatgpt_setting_btn").removeAttr("disabled");
                    $(".chatgpt_setting_btn").html($('.analytics_setting_btn').data('update'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        loadCredentialSetting();
                        $("#google_analytics").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".chatgpt_setting_btn").removeAttr("disabled");
                    $(".chatgpt_setting_btn").html($('.analytics_setting_btn').data('update'));

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
        $("#chatgpt_status").on("change", function () {
            let chatgptStatus = $(this).is(":checked") ? 1 : 0;

            let formData = {
                chatgpt_status: chatgptStatus,
            };

            $.ajax({
                url: "/api/credential/status/chatgpt-status",
                type: "POST",
                data: formData,
                dataType: "json",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error("Failed to update status.");
                    }
                },
                error: function (error) {
                    toastr.error(
                        "An error occurred while updating the status."
                    );
                },
            });
        });
    });
}

if (pageValue === 'admin.testimonials') {

    let langCode = $('body').data('lang');

    function listTestimonial() {
        $.ajax({
            url: "/api/admin/testimonial-list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {

                    let testimonials = response.data;
                    let tableBody = "";

                    if (testimonials.length === 0) {
                        $('#testimonialsTable').DataTable().destroy();
                        tableBody += `
                            <tr>
                                <td colspan="6" class="text-center">${$('#testimonialsTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        testimonials.forEach((testimonial, index) => {
                            tableBody += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <a href="#" class="avatar avatar-md"><img src="${testimonial.client_image}" class="img-fluid rounded-circle" alt="img"></a>
                                            <div class="ms-2">
                                                <p class="text-dark mb-0"><a href="#">${testimonial.client_name}</a>
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${testimonial.position}</td>
                                    <td class="text-wrap text-break w-75" style="text-align: justify;">${
                                        testimonial.description.length > 100
                                            ? testimonial.description.substring(0, 100) + "..."
                                            : testimonial.description
                                    }</td>
                                    ${ $('#has_permission').data('edit') == 1 ?
                                    `<td>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input testimonial_status" ${testimonial.status == 1 ? 'checked' : ''} type="checkbox" role="switch" id="switch-sm" data-id="${testimonial.id}">
                                        </div>
                                    </td>` : ''
                                    }
                                    ${ $('#has_permission').data('visible') == 1 ?
                                    `<td>
                                        <li style="list-style: none;">
                                            ${ $('#has_permission').data('edit') == 1 ?
                                            `<a class="edit_testimonial_btn"
                                                href="#"
                                                data-bs-toggle="modal"
                                                data-bs-target="#add_testimonial_modal"
                                                data-id="${testimonial.id}"
                                                data-client_name="${testimonial.client_name}"
                                                data-client_image="${testimonial.client_image}"
                                                data-position="${testimonial.position}"
                                                data-description="${testimonial.description}"
                                                data-status="${testimonial.status}">
                                                <i class="ti ti-pencil fs-20" data-tooltip="tooltip" title="${$('.testimonial_modal_title').data('edit')}"></i>
                                            </a>` : ''
                                            }
                                            ${ $('#has_permission').data('delete') == 1 ?
                                            `<a class="delete delete_testimonial_btn" href="#" data-bs-toggle="modal" data-bs-target="#delete_testimonial_modal" data-del-id="${testimonial.id}">
                                                <i class="ti ti-trash m-3 fs-20" data-tooltip="tooltip" title="${$('.testimonial_modal_title').data('delete')}"></i>
                                            </a>` : ''
                                            }
                                        </li>
                                    </td>` : ''
                                    }
                                </tr>
                            `;
                        });
                    }

                    $('#testimonialsTable tbody').html(tableBody);
                    initTooltip();

                    if ((testimonials.length != 0) && !$.fn.DataTable.isDataTable('#testimonialsTable')) {
                        $('#testimonialsTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    $(document).on("click", ".edit_testimonial_btn", function (e) {
        e.preventDefault();
        $('.testimonial_modal_title').html($('.testimonial_modal_title').data('edit_title'));
        $('#id').val('id');
        $('#method').val('update');
        $(".error-text").text("");
        $(".form-control").removeClass("is-invalid is-valid");

        var id = $(this).data("id");
        var client_name = $(this).data("client_name");
        var client_image = $(this).data("client_image");
        var position = $(this).data("position");
        var status = $(this).data("status");
        var description = $(this).data("description");


        $("#id").val(id);
        $("#client_name").val(client_name);
        $('#clientImagePreview').show();
        $("#clientImagePreview").attr('src', client_image);
        $(".upload_icon").hide();
        $("#status").prop("checked", status == 1);
        $("#position").val(position);
        $("#description").val(description);

    });

    $(document).ready(function() {

        listTestimonial();

        $('#client_image').on('change', function (event) {
            if ($(this).val() !== '') {
                $(this).valid();
            }
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#clientImagePreview').attr('src', e.target.result).show();
                $('.upload_icon').hide();
            };
            reader.readAsDataURL(event.target.files[0]);
        });

        $(document).on("click", ".delete_testimonial_btn", function () {
            var id = $(this).data("del-id");
            $('#delete_id').val(id);
        });

        $('#add_testimonial_btn').on('click', function() {
            $('.testimonial_modal_title').html($('.testimonial_modal_title').data('add_title'));
            $('#method').val('add');
            $('#clientImagePreview').hide();
            $('.upload_icon').show();
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid is-valid");
            $('#testimonialForm').trigger('reset');
        });

        $(document).on('click', '.delete_testimonial_confirm', function (e) {
            e.preventDefault();

            var delId = $('#delete_id').val();
            $.ajax({
                url: "/api/admin/delete-testimonial",
                type: 'POST',
                data: {
                    id: delId,
                    language_code: langCode
                },
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#delete_testimonial_modal").modal("hide");
                        listTestimonial();
                    }
                    $('#testimonialsTable').DataTable().destroy();
                },
                error: function (xhr, status, error) {
                    toastr.error(xhr.responseJSON.message);
                },
            });
        });

        $('#testimonialForm').validate({
            rules: {
                client_name: {
                    required: true,
                    maxlength: 100
                },
                position: {
                    required: true,
                    maxlength: 100
                },
                client_image: {
                    required: function () {
                        return $("#testimonialForm input[name='method']").val() === 'add';
                    },
                    extension: "jpeg|jpg|png",
                    filesize: 2048
                },
                description: {
                    required: true,
                    maxword: 300
                }
            },
            messages: {
                client_name: {
                    required: $('#client_name_error').data('required'),
                    maxlength: $('#client_name_error').data('max'),
                },
                position: {
                    required: $('#position_error').data('required'),
                    maxlength: $('#position_error').data('max')
                },
                client_image: {
                    required: $('#client_image_error').data('required'),
                    extension: $('#client_image_error').data('extension'),
                    filesize: $('#client_image_error').data('filesize')
                },
                description: {
                    required: $('#description_error').data('required'),
                    maxword: $('#description_error').data('max')
                }
            },
            errorPlacement: function (error, element) {
                var errorId = element.attr("id") + "_error";
                $("#" + errorId).text(error.text());
            },
            highlight: function (element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                var formData = new FormData(form);
                formData.append("status", $("#status").is(":checked") ? 1 : 0);
                formData.append('language_code', langCode);

                $.ajax({
                    url: "/api/admin/save-testimonial",
                    type: "POST",
                    data: formData,
                    enctype: "multipart/form-data",
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $(".save_testimonial_btn").attr("disabled", true).html(
                            '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                        );
                    },
                })
                .done(function (response) {
                    if ($.fn.DataTable.isDataTable('#testimonialsTable')) {
                        $('#testimonialsTable').DataTable().destroy();
                    }
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".save_testimonial_btn").removeAttr("disabled").html($('.save_testimonial_btn').data('save'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#add_testimonial_modal").modal('hide');
                        listTestimonial();
                    }
                })
                .fail(function (error) {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".save_testimonial_btn").removeAttr("disabled").html($('.save_testimonial_btn').data('save'));
                    if (error.status == 422) {
                        $.each(error.responseJSON.errors, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    }
                });
            }
        });

        $.validator.addMethod("maxword", function(value, element, param) {
            return str_word_count(value) <= param;
        }, "Description should contain no more than 300 words.");

        $.validator.addMethod("filesize", function (value, element, param) {
            if (element.files.length === 0) return true;
            return element.files[0].size <= param * 1024;
        }, "File size must be less than {0} KB.");

        function str_word_count(str) {
            return str.trim().split(/\s+/).length;
        }


        $(document).on('change', '.testimonial_status', function () {
            let id = $(this).data('id');
            let status = $(this).is(':checked') ? 1 : 0;

            var data = {
                'id': id,
                'status': status,
                'language_code': langCode
            };

            $.ajax({
                url: '/api/admin/change-status-testimonial',
                type: 'POST',
                data: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                        listTestimonial();
                    }
                },
                error: function (error) {
                    toastr.error(error.responseJSON.message);
                }
            });
        });

    });
}

if (pageValue === 'admin.subscriber-list') {

    function listSubscriber() {
        $.ajax({
            url: "/api/admin/newsletter/list-subscriber",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {

                    let subscribers = response.data;
                    let tableBody = "";

                    if (subscribers.length === 0) {
                        $('#subscriberTable').DataTable().destroy();
                        tableBody += `
                            <tr>
                                <td colspan="5" class="text-center">${$('#subscriberTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        subscribers.forEach((subscriber, index) => {
                            var checkedVal = subscriber.status == 1 ? 'checked' : '';
                            var subscriberStatus = subscriber.status == 1 ? '' : 'disabled';
                            tableBody += `
                                <tr>
                                    ${ $('#has_permission').data('create') == 1 ?
                                    `<td>
                                        <div class="form-check form-check-md">
                                            <input class="form-check-input select-checkbox" ${subscriberStatus} type="checkbox">
                                        </div>
                                    </td>` : ''
                                    }
                                    <td>${subscriber.email}</td>
                                    ${ $('#has_permission').data('edit') == 1 ?
                                    `<td>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input subscriber_status" ${checkedVal} type="checkbox" role="switch" id="switch-sm" data-subscriber-id = ${subscriber.id}>
                                        </div>
                                    </td>` : ''
                                    }
                                    ${ $('#has_permission').data('visible') == 1 ?
                                    `<td>
                                        <li style="list-style: none;">
                                            ${ $('#has_permission').data('delete') == 1 ?
                                            `<a class="delete delete_subscriber_btn" href="#" data-bs-toggle="modal" data-bs-target="#delete_subscriber_modal" data-del-id="${subscriber.id}">
                                                <i class="ti ti-trash m-3 fs-20" data-tooltip="tooltip" title="${$('#subscriberTable').data('delete')}"></i>
                                            </a>` : ''
                                            }
                                        </li>
                                    </td>` : ''
                                    }
                                </tr>
                            `;
                        });
                    }

                    $('#subscriberTable tbody').html(tableBody);
                    initTooltip();

                    if ((subscribers.length != 0) && !$.fn.DataTable.isDataTable('#subscriberTable')) {
                        $('#subscriberTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    $('#selected_email_btn').on('click', function() {
        let selectedEmails = [];

        $('#subscriberTable tbody .select-checkbox:checked').each(function() {
            let row = $(this).closest('tr');
            let email = row.find('td:nth-child(2)').text();
            let status = row.find('.subscriber_status');

            if (status.prop('checked')) {
                selectedEmails.push(email);
            }
        });

        if (selectedEmails.length > 0) {
            sendNewsletter(selectedEmails);
        } else {
            toastr.error($('#subscriberTable').data('empty_select'));
        }
    });

    function sendNewsletter(selectedEmails) {
        $.ajax({
            url: "/api/admin/get-newsletter-template",
            type: 'POST',
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200 && response.data != null) {
                    var subject = response.data.subject;
                    var content = response.data.content;

                    $.ajax({
                        url: "/api/mail/sendmail",
                        type: 'POST',
                        data: {
                            subject: subject,
                            content: content,
                            to_email: selectedEmails
                        },
                        beforeSend: function () {
                            $("#selected_email_btn").attr("disabled", true);
                            $("#selected_email_btn").html(
                                `<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>  ${$('#subscriberTable').data('sending')}..`
                            );
                        },
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("admin_token"),
                            Accept: "application/json",
                        },
                        success: function (response) {
                            if (response.code === 200) {
                                $("#selected_email_btn").removeAttr("disabled").html(`<i class="fas fa-envelope"></i> ${$('#subscriberTable').data('send_email')}`);
                                toastr.success(response.message);
                            }
                        },
                        error: function (xhr, status, error) {
                            $("#selected_email_btn").removeAttr("disabled").html(`<i class="fas fa-envelope"></i> ${$('#subscriberTable').data('send_email')}`);
                            toastr.error("An error occurred while sending email.");
                        },
                    });

                } else {
                    toastr.error("An error occurred while sending email.");
                }
            },
            error: function (xhr, status, error) {
                toastr.error("An error occurred while sending email.");
            },
        });
    }

    $(document).ready(function() {
        listSubscriber();

        $(document).on("click", ".delete_subscriber_btn", function () {
            var id = $(this).data("del-id");
            $('#delete_id').val(id);
        });

        $(document).on('click', '.delete_subscriber_confirm', function (e) {
            e.preventDefault();
            var delId = $('#delete_id').val();

            $.ajax({
                url: "/api/admin/newsletter/delete-subscriber",
                type: 'POST',
                data: {
                    id: delId,
                    language_code: $('body').data('lang')
                },
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    $('#subscriberTable').DataTable().destroy();
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#delete_subscriber_modal").modal("hide");
                        listSubscriber();
                    }
                },
                error: function (xhr, status, error) {
                    toastr.error("An error occurred while deleting subscriber.");
                },
            });
        });

        $(document).on('change', '.subscriber_status', function () {
            let id = $(this).data('subscriber-id');
            let status = $(this).is(':checked') ? 1 : 0;

            var data = {
                'id': id,
                'status': status,
                'language_code': $('body').data('lang')

            };

            $.ajax({
                url: '/api/admin/newsletter/change-subscriber-status',
                type: 'POST',
                data: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                success: function (response) {
                    if ($.fn.DataTable.isDataTable('#subscriberTable')) {
                        $('#subscriberTable').DataTable().destroy();
                    }
                    if (response.code === 200) {
                        toastr.success(response.message);
                        listSubscriber();
                    }
                },
                error: function () {
                    toastr.error('An error occurred while updating status');
                }
            });
        });

        $('#select_all_subscriber').on('click', function() {;
            let isChecked = $(this).is(':checked');

            $('#subscriberTable tbody').find('.select-checkbox:not(:disabled)').prop('checked', isChecked);
        });

    });
}
//Subscription-package
if (pageValue === "admin.subscription-package") {
    function toggleInputFields() {
        const packageTerm = document.getElementById("package_term").value;
        const dayInput = document.getElementById("day_input");
        const monthInput = document.getElementById("month_input");
        const showinput = document.getElementById("show_input");
        const packageDurationInput =
            document.getElementById("package_duration");
        const packagedurationerror = document.getElementById(
            "edit_package_duration_error"
        );

        if (packageTerm === "day") {
            showinput.style.display = "none";
            dayInput.style.display = "block";
            monthInput.style.display = "none";
            packageDurationInput.disabled = false;
            packageDurationInput.value = "";
        } else if (packageTerm === "month") {
            showinput.style.display = "none";
            monthInput.style.display = "block";
            dayInput.style.display = "none";
            packageDurationInput.disabled = false;
            packageDurationInput.value = "";
        } else {
            showinput.style.display = "block";
            dayInput.style.display = "none";
            monthInput.style.display = "none";
            packageDurationInput.disabled = true;
            packageDurationInput.value = "";
        }
    }

    $(document).ready(function () {
        $("#addSubscriptionForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);
            formData.append("status", $("#status").is(":checked") ? 1 : 0);

            $.ajax({
                url: "/api/subscription-package/save",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".subscription_package_btn").attr("disabled", true);
                    $(".subscription_package_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".subscription_package_btn").removeAttr("disabled");
                    $(".subscription_package_btn").html("submit");
                    if (response.code === 200) {
                        toastr.success(response.message);
                        subscription_table();
                        $("#add_subscription_package").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".subscription_package_btn").removeAttr("disabled");
                    $(".subscription_package_btn").html("submit");

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr.error(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    $(document).ready(function () {
        subscription_table();
    });

    function subscription_table() {
        fetchSubscription(1);
    }

    function fetchSubscription(page) {
        $.ajax({
            url: "/api/subscription-package/subscription-detail",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    populateSubscriptionTable(response.data, response.meta);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    function populateSubscriptionTable(Subscription, meta) {
        let tableBody = "";

        if (Subscription.length > 0) {
            Subscription.forEach((Subscription, index) => {
                tableBody += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${Subscription.package_title}</td>
                        <td>${Subscription.subscription_type ?? ""}</td>
                        <td>${Subscription.price}</td>
                        <td>${
                            Subscription.package_term.charAt(0).toUpperCase() +
                            Subscription.package_term.slice(1).toLowerCase()
                        }</td>
                        <td>${
                            Subscription.package_duration
                                ? Subscription.package_duration
                                : "N/A"
                        }</td>
                        <td>${Subscription.number_of_service}</td>
                        <td>
                            <span class="badge ${
                                Subscription.status == "1"
                                    ? "badge-soft-success"
                                    : "badge-soft-danger"
                            } d-inline-flex align-items-center">
                                <i class="ti ti-circle-filled fs-5 me-1"></i>${
                                    Subscription.status == "1"
                                        ? "Active"
                                        : "Inactive"
                                }
                            </span>
                        </td>
                         ${
                                        $('#has_permission').data('visible') == 1 ?
                                    `<td><li style="list-style: none;">
                                        ${
                                            $('#has_permission').data('edit') == 1 ?
                                            `<a class="edit_sub_data"
                                           href="#"
                                           data-bs-toggle="modal"
                                           data-bs-target="#edit_subscription_package"
                                           data-id="${Subscription.id}"
                                           data-package_title="${
                                               Subscription.package_title
                                           }"
                                           data-price="${Subscription.price}"
                                           data-package_term="${
                                               Subscription.package_term
                                           }"
                                           data-package_duration="${
                                               Subscription.package_duration
                                           }"
                                           data-number_of_service="${
                                               Subscription.number_of_service
                                           }"
                                           data-number_of_feature_service="${
                                               Subscription.number_of_feature_service
                                           }"
                                           data-number_of_product="${
                                               Subscription.number_of_product
                                           }"
                                           data-number_of_service_order="${
                                               Subscription.number_of_service_order
                                           }"
                                            data-number_of_locations="${
                                               Subscription.number_of_locations
                                           }"
                                           data-number_of_staff="${
                                               Subscription.number_of_staff
                                           }"
                                            data-number_of_lead="${
                                               Subscription.number_of_lead
                                           }"
                                            data-subscription_type="${
                                               Subscription.subscription_type
                                           }"
                                           data-order_by="${
                                               Subscription.order_by
                                           }"
                                           data-description="${
                                               Subscription.description
                                           }"
                                           data-status="${Subscription.status}">
                                           <i class="ti ti-pencil fs-20"></i>
                                        </a>` : ''
                                        }

                                        ${
                                            $('#has_permission').data('delete') == 1 ?
                                            ` <a class="delete" href="#" data-bs-toggle="modal" data-bs-target="#delete-modal" data-id="${
                                            Subscription.id
                                        }">
                                            <i class="ti ti-trash m-3 fs-20"></i>
                                        </a>` : ''
                                        }

                                    </li></td>` : ''
                                    }
                    </tr>
                `;
            });
        } else {
            tableBody = `
                <tr>
                    <td colspan="10" class="text-center">No Subscription found</td>
                </tr>
            `;
        }

        $("#subscription_datatable tbody").html(tableBody);
        if ((Subscription.length != 0) && !$.fn.dataTable.isDataTable("#subscription_datatable")) {
            $("#subscription_datatable").DataTable({
                ordering: true,
                language: datatableLang
            });
        }
    }

    $(document).on("click", ".edit_sub_data", function (e) {
        e.preventDefault();

        var subId = $(this).data("id");
        var title = $(this).data("package_title");
        var price = $(this).data("price");
        var package_term = $(this).data("package_term");
        var package_duration = $(this).data("package_duration");
        var number_of_service = $(this).data("number_of_service");
        var number_of_locations = $(this).data("number_of_locations");
        var number_of_staff = $(this).data("number_of_staff");
        var subscription_type = $(this).data('subscription_type');
        var number_of_lead = $(this).data("number_of_lead");
        var number_of_feature_service = $(this).data(
            "number_of_feature_service"
        );
        var number_of_product = $(this).data("number_of_product");
        var number_of_service_order = $(this).data("number_of_service_order");
        var order_by = $(this).data("order_by");
        var description = $(this).data("description");
        var status = $(this).data("status");

        $("#edit_id").val(subId);
        $("#edit_package_title").val(title);
        $("#edit_price").val(price);
        $("#edit_package_term").val(package_term);
        $("#edit_package_duration").val(package_duration);
        $("#edit_number_of_service").val(number_of_service);
        $("#edit_number_of_feature_service").val(number_of_feature_service);
        $("#edit_number_of_product").val(number_of_product);
        $("#edit_number_of_locations").val(number_of_locations);
        $("#edit_number_of_staff").val(number_of_staff);
        $("#edit_number_of_lead").val(number_of_lead);
        $("#edit_subscription_type").val(subscription_type);
        $("#edit_number_of_service_order").val(number_of_service_order);
        $("#edit_order_by").val(order_by);
        $("#edit_description").val(description);
        $("#edit_status").prop("checked", status == 1);

        togglePackageDuration(package_term);
    });

    $("#edit_package_term").on("change", function () {
        var package_term = $(this).val();
        togglePackageDuration(package_term);
    });

    function togglePackageDuration(package_term) {
        const EditpackageDurationInput = document.getElementById(
            "edit_package_duration"
        );
        if (package_term === "day") {
            EditpackageDurationInput.disabled = false;
            $("#duration_label").text("Number Of Day");
        } else if (package_term === "month") {
            EditpackageDurationInput.disabled = false;
            $("#duration_label").text("Number Of Month");
        } else {
            $("#duration_label").text("Select Day/Month");
            EditpackageDurationInput.disabled = true;
            $("#edit_package_duration").val("");
        }
    }

    $(document).ready(function () {
        $("#editSubscriptionForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);
            formData.append("status", $("#edit_status").is(":checked") ? 1 : 0);

            $.ajax({
                url: "/api/subscription-package/update",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                beforeSend: function () {
                    $(".editPackageBtn").attr("disabled", true);
                    $(".editPackageBtn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".editPackageBtn").removeAttr("disabled");
                    $(".editPackageBtn").html("update");
                    if (response.code === 200) {
                        toastr.success(response.message);
                        subscription_table();
                        $("#edit_subscription_package").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".editPackageBtn").removeAttr("disabled");
                    $(".editPackageBtn").html("update");

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr.error(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    $(document).on("click", '.delete[data-bs-toggle="modal"]', function (e) {
        e.preventDefault();

        var subId = $(this).data("id");
        $("#confirmDelete").data("id", subId);
    });

    $(document).on("click", "#confirmDelete", function (e) {
        e.preventDefault();

        var subId = $(this).data("id");
        $.ajax({
            url: "/api/subscription-package/delete",
            type: "POST",
            data: {
                id: subId,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    subscription_table();
                    $("#delete-modal").modal("hide");
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                toastr.error("An error occurred while trying to delete.");
            },
        });
    });

    document.addEventListener("DOMContentLoaded", function () {
        const modal = document.getElementById("add_subscription_package");
        const packageDurationInput =
            document.getElementById("package_duration");

        modal.addEventListener("hidden.bs.modal", function () {
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid");
            $(".editPackageBtn").removeAttr("disabled");
            $(".editPackageBtn").html("submit");
            document.getElementById("addSubscriptionForm").reset();
            document.getElementById("package_title_error").textContent = "";
            document.getElementById("price_error").textContent = "";
            document.getElementById("package_term_error").textContent = "";
            document.getElementById("package_duration_error").textContent = "";
            document.getElementById("number_of_service_error").textContent = "";
            document.getElementById(
                "number_of_feature_service_error"
            ).textContent = "";
            document.getElementById("number_of_product_error").textContent = "";
            document.getElementById("number_of_locations_error").textContent = "";
            document.getElementById("number_of_staff_error").textContent = "";
            document.getElementById("number_of_lead_error").textContent = "";
            document.getElementById("subscription_type_error").textContent = "";
            document.getElementById(
                "number_of_service_order_error"
            ).textContent = "";
            packageDurationInput.disabled = true;
            document.getElementById("status_error").textContent = "";
            document.getElementById("show_input").style.display = "block";
            document.getElementById("day_input").style.display = "none";
            document.getElementById("month_input").style.display = "none";
        });
    });
}
//faq-setting
if (pageValue === "admin.faq") {
    var langCode = $('body').data('lang');

    // function faq_table(langCode = '') {
    //     fetchFaq(langCode);
    // }

    function fetchFaq(langCode = '') {
        $.ajax({
            url: "/api/faq/faq-detail",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
                sort_by: "id",
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    populateFaqTable(response.data, response.meta);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    function populateFaqTable(Faq) {
        let tableBody = "";

        if (Faq.length > 0) {
            Faq.forEach((Faq, index) => {
                tableBody += `
                    <tr>
                            <td>${index + 1}</td>
                            <td>${
                                Faq.question.length > 30
                                    ? Faq.question.substring(0, 30) + "..."
                                    : Faq.question
                            }</td>
                            <td>${
                                Faq.answer.length > 100
                                    ? Faq.answer.substring(0, 50) + "..."
                                    : Faq.answer
                            }</td>
                            <td>
                                <span class="badge ${
                                    Faq.status == "1"
                                        ? "badge-soft-success"
                                        : "badge-soft-danger"
                                } d-inline-flex align-items-center">
                                    <i class="ti ti-circle-filled fs-5 me-1"></i>${
                                        Faq.status == "1"
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>
                            </td>
                            ${ $('#has_permission').data('visible') == 1 ?
                            `<td>
                                <li style="list-style: none;">
                                    ${ $('#has_permission').data('edit') == 1 ?
                                    `<a class="edit_faq_data"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit_faq"
                                    data-id="${Faq.id}"
                                    data-question="${Faq.question}"
                                    data-answer="${Faq.answer}"
                                    data-status="${Faq.status}">
                                    <i class="ti ti-pencil fs-20"></i>
                                    </a>` : ''
                                    }
                                    ${ $('#has_permission').data('delete') == 1 ?
                                    `<a class="delete" href="#" data-bs-toggle="modal" data-bs-target="#delete-modal" data-id="${Faq.id}">
                                        <i class="ti ti-trash m-3 fs-20"></i>
                                    </a>` : ''
                                    }
                                </li>
                            </td>` : ''
                            }
                        </tr>
                    `;
            });
        } else {
            $('#faq_datatable').DataTable().destroy();
            tableBody = `
                    <tr>
                        <td colspan="5" class="text-center">${$('#faq_datatable').data('empty')}</td>
                    </tr>
                `;
        }

        $("#faq_datatable tbody").html(tableBody);
        if ((Faq.length != 0) && !$.fn.dataTable.isDataTable("#faq_datatable")) {
            $("#faq_datatable").DataTable({
                ordering: true,
                language: datatableLang
            });
        }
    }


    $(document).on("click", ".edit_faq_data", function (e) {
        e.preventDefault();

        var faqId = $(this).data("id");
        var question = $(this).data("question");
        var answer = $(this).data("answer");
        var status = $(this).data("status");

        $("#edit_id").val(faqId);
        $("#edit_question").val(question);
        $("#edit_answer").val(answer);
        $("#edit_status").prop("checked", status == 1);
    });

    $(document).on("click", '.delete[data-bs-toggle="modal"]', function (e) {
        e.preventDefault();
        var faqId = $(this).data("id");
        $("#confirmDeleteFaq").data("id", faqId);
    });

    $(document).on("click", "#confirmDeleteFaq", function (e) {
        e.preventDefault();

        var faqId = $(this).data("id");
        $.ajax({
            url: "/api/faq/delete",
            type: 'POST',
            data: {
                id: faqId,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            beforeSend: function () {
                $("#confirmDeleteFaq").attr("disabled", true);
                $("#confirmDeleteFaq").html(
                    '<div class="spinner-border text-light" role="status"></div>'
                );
            },

            success: function (response) {
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid");
                $("#confirmDeleteFaq").removeAttr("disabled");
                $("#confirmDeleteFaq").html("Delete");
                if (response.success) {
                    toastr.success(response.message);
                    fetchFaq(langCode);
                    $("#delete-modal").modal("hide");
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                toastr.error("An error occurred while trying to delete.");
            },
        });
    });

    $(document).ready(function () {
        fetchFaq(langCode);
    });

    $(document).ready(function () {
        // Add jQuery validation to the form
        $("#addFAQForm").validate({
            rules: {
                question: {
                    required: true,
                    minlength: 5, // Minimum length for question
                },
                answer: {
                    required: true,
                    minlength: 10, // Minimum length for answer
                },
            },
            messages: {
                question: {
                    required: $('#question_error').data('required'),
                    minlength: $('#question_error').data('min'),
                },
                answer: {
                    required: $('#answer_error').data('required'),
                    minlength: $('#answer_error').data('min')
                },
            },
            errorElement: "span",
            errorPlacement: function (error, element) {
                error.addClass("invalid-feedback");
                element.closest(".mb-3").append(error);
            },
            highlight: function (element, errorClass, validClass) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass("is-invalid").addClass("is-valid");
            },
            submitHandler: function (form) {
                // Prevent default form submission
                event.preventDefault();

                var formData = new FormData(form);
                formData.append("status", $("#status").is(":checked") ? 1 : 0);
                formData.append('language_id', $('#language_id').val());

                $.ajax({
                    url: "/api/faq/save",
                    method: "POST",
                    data: formData,
                    dataType: "json",
                    contentType: false,
                    processData: false,
                    cache: false,
                    beforeSend: function () {
                        $(".add_faq_btn").attr("disabled", true);
                        $(".add_faq_btn").html(
                            '<div class="spinner-border text-light" role="status"></div>'
                        );
                    },
                })
                    .done((response, statusText, xhr) => {
                        $(".error-text").text("");
                        $(".form-control").removeClass("is-invalid");
                        $(".add_faq_btn").removeAttr("disabled");
                        $(".add_faq_btn").html($('.add_faq_btn').data('save_text'));
                        if (response.code === 200) {
                            toastr.success(response.message);
                            fetchFaq(langCode);
                            $("#add_faq").modal("hide");
                        } else {
                            toastr.error(response.message);
                        }
                    })
                    .fail((error) => {
                        $(".error-text").text("");
                        $(".form-control").removeClass("is-invalid");
                        $(".add_faq_btn").removeAttr("disabled");
                        $(".add_faq_btn").html($('.add_faq_btn').data('save_text'));

                        if (error.status == 422) {
                            $.each(error.responseJSON, function (key, val) {
                                $("#" + key).addClass("is-invalid");
                                $("#" + key + "_error").text(val[0]);
                            });
                        } else {
                            toastr.error(error.responseJSON.message, "bg-danger");
                        }
                    });
            },
        });
    });

    $(document).ready(function () {
        // Add jQuery validation to the form
        $("#editFAQForm").validate({
            rules: {
                edit_question: {
                    required: true,
                    minlength: 5, // Minimum length for question
                },
                edit_answer: {
                    required: true,
                    minlength: 10, // Minimum length for answer
                },
            },
            messages: {
                edit_question: {
                    required: "The question field is required.",
                    minlength: "The question must be at least 5 characters long.",
                },
                edit_answer: {
                    required: "The answer field is required.",
                    minlength: "The answer must be at least 10 characters long.",
                },
            },
            errorElement: "span",
            errorPlacement: function (error, element) {
                error.addClass("invalid-feedback");
                element.closest(".mb-3").append(error);
            },
            highlight: function (element, errorClass, validClass) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass("is-invalid").addClass("is-valid");
            },
            submitHandler: function (form) {
                // Prevent default form submission
                event.preventDefault();

                var formData = new FormData(form);
                formData.append("status", $("#edit_status").is(":checked") ? 1 : 0);

                $.ajax({
                    url: "/api/faq/update",
                    method: "POST",
                    data: formData,
                    dataType: "json",
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("admin_token"),
                        Accept: "application/json",
                    },
                    beforeSend: function () {
                        $(".edit_faq_btn").attr("disabled", true);
                        $(".edit_faq_btn").html(
                            '<div class="spinner-border text-light" role="status"></div>'
                        );
                    },
                })
                    .done((response, statusText, xhr) => {
                        $(".error-text").text("");
                        $(".form-control").removeClass("is-invalid");
                        $(".edit_faq_btn").removeAttr("disabled");
                        $(".edit_faq_btn").html($('.edit_faq_btn').data('update-text'));
                        if (response.code === 200) {
                            toastr.success(response.message);
                            fetchFaq(langCode);
                            $("#edit_faq").modal("hide");
                        } else {
                            toastr.error(response.message);
                        }
                    })
                    .fail((error) => {
                        $(".error-text").text("");
                        $(".form-control").removeClass("is-invalid");
                        $(".edit_faq_btn").removeAttr("disabled");
                        $(".edit_faq_btn").html($('.edit_faq_btn').data('update-text'));

                        if (error.status == 422) {
                            $.each(error.responseJSON, function (key, val) {
                                $("#" + key).addClass("is-invalid");
                                $("#" + key + "_error").text(val[0]);
                            });
                        } else {
                            toastr.error(error.responseJSON.message, "bg-danger");
                        }
                    });
            },
        });
    });

    $(document).ready(function () {
        $('#add_faq').on('hidden.bs.modal', function () {
            $('#addFAQForm')[0].reset();

            $('.form-control').removeClass('is-invalid').removeClass('is-valid');
            $('.invalid-feedback').text('');
        });
    });

    $(document).ready(function () {
        $('#edit_faq').on('hidden.bs.modal', function () {
            $('#editFAQForm')[0].reset();

            $('.form-control').removeClass('is-invalid').removeClass('is-valid');
            $('.invalid-feedback').text('');

            languageTranslate('', langCode);

        });
    });

    $('#language_id').on('change', function() {
        var langId = $(this).val();
        var id = $('#edit_id').val();

        languageTranslate(langId);
        getFaq(id, langId, );

    });

    function getFaq(id, lang_id = '', langCode = '') {
        $.ajax({
            url: "/api/admin/get-faq",
            type: "POST",
            data: {
                id: id,
                language_id: lang_id,
                language_code: langCode
            },
            dataType: "json",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    let faq = response.data;

                    if (faq) {
                        $('#edit_question').val(faq.question);
                        $('#edit_answer').val(faq.answer);
                    } else {
                        $('#edit_question').val("");
                        $('#edit_answer').val("");
                    }

                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    function languageTranslate(lang_id = '', langCode = '') {
        $.ajax({
            url: "/api/translate",
            type: "POST",
            dataType: "json",
            data: {
                language_id: lang_id,
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                const trans = response.translated_values;

                $('.form-control').removeClass('is-invalid').removeClass('is-valid');
                $('.invalid-feedback').text('');

                if (response.code === 200 && Object.keys(trans).length > 0) {

                    $('label[for="edit_question"]').html(`${trans.question}<span class="text-danger"> *</span>`);
                    $('label[for="edit_answer"]').html(`${trans.answer}<span class="text-danger"> *</span>`);

                    $('#edit_question').attr('placeholder', trans.enter_question);
                    $('#edit_answer').attr('placeholder', trans.enter_answer);
                    $('#status_text').text(trans.Status);
                    $('.cancelbtn').text(trans.Cancel);
                    $('#edit_btn_faq').text(trans.Save);
                    $('.lang_title').text(trans.available_translations);
                    $('.edit_modal_title').text(trans.edit_faq);
                    $('.edit_faq_btn').data('update-text', trans.Save);

                    $('#editFAQForm').validate().settings.messages = {
                        edit_question: {
                            required: trans.question_required,
                            minlength: trans.question_minlength,
                        },
                        edit_answer: {
                            required: trans.answer_required,
                            minlength: trans.answer_minlength,
                        }
                    };
                }

            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }


}

if (pageValue === 'admin.blog-category') {
    var category_name_required = "Category name is required.";
    var category_name_max = "Category name cannot exceed 100 characters.";
    var category_name_exists = "Category name already exists.";
    var slug_required = "Slug is required.";
    var slug_max = "Slug cannot exceed 100 characters.";
    var slug_exists = "Slug already exists.";


    function listBlogCategory(langCode = '') {
        $.ajax({
            url: "/api/admin/blogs/list-category",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {

                    let categories = response.data;
                    let tableBody = "";

                    if (categories.length === 0) {
                        $('#blogCategoryTable').DataTable().destroy();
                        tableBody += `
                            <tr>
                                <td colspan="5" class="text-center">${$('#blogCategoryTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        categories.forEach((category, index) => {
                            let checkedVal = category.status == 1 ? 'checked' : '';
                            tableBody += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${category.name}</td>
                                    ${ $('#has_permission').data('edit') == 1 ?
                                    `<td>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input category_status" ${checkedVal} type="checkbox" role="switch" id="switch-sm" data-category-id = ${category.id}>
                                        </div>
                                    </td>` : ''
                                    }
                                    ${ $('#has_permission').data('visible') == 1 ?
                                        `<td>
                                            <li style="list-style: none;">
                                                ${ $('#has_permission').data('edit') == 1 ?
                                                    `<a class="edit_category_btn"
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#blog_category_modal"
                                                        data-id="${category.id}"
                                                        data-category_name="${category.name}"
                                                        data-slug="${category.slug}">
                                                        <i class="ti ti-pencil fs-20" data-tooltip="tooltip" title="${$('#blogCategoryTable').data('edit')}"></i>
                                                    </a>` : ''
                                                }
                                                ${ $('#has_permission').data('delete') == 1 ?
                                                    `<a class="delete delete_category_btn" href="#" data-bs-toggle="modal" data-bs-target="#delete_blog_category_modal" data-del-id="${category.id}">
                                                        <i class="ti ti-trash m-3 fs-20" data-tooltip="tooltip" title="${$('#blogCategoryTable').data('delete')}"></i>
                                                    </a>` : ''
                                                }
                                            </li>
                                        </td>` : ''
                                    }
                                </tr>
                            `;
                        });
                    }

                    $('#blogCategoryTable tbody').html(tableBody);
                    initTooltip();

                    if ((categories.length != 0) && !$.fn.DataTable.isDataTable('#blogCategoryTable')) {
                        $('#blogCategoryTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    $(document).ready(function() {
        var langCode = $('body').data('lang');

        listBlogCategory(langCode);

        $('#add_category_btn').on('click', function() {
            $('.category_modal_title').html(lg_category_add_title);
            $('#method').val('add');
            $('#id').val('');
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid is-valid");
            $('#blogCategoryForm').trigger('reset');
            $('#translate_container').addClass('d-none');

            var langCode = $('body').data('lang');
            languageTranslate('', langCode);
        });

        $('#blogCategoryForm').validate({
            rules: {
                category_name: {
                    required: true,
                    maxlength: 100,
                    remote: {
                        url: '/api/admin/blogs/check-unique-category-name',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            category_name: function() {
                                return $('#category_name').val();
                            },
                            id: function() {
                                return $('#blogCategoryForm input[name="id"]').val();
                            },
                            language_id: function() {
                                return $('#language_id').val();
                            },
                            method: function() {
                                return $('#blogCategoryForm input[name="method"]').val();
                            }
                        }
                    }
                },
                slug: {
                    required: true,
                    maxlength: 100,
                    remote: {
                        url: '/api/admin/blogs/check-unique-category-slug',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            slug: function() {
                                return $('#slug').val();
                            },
                            id: function() {
                                return $('#blogCategoryForm input[name="id"]').val();
                            },
                            method: function() {
                                return $('#blogCategoryForm input[name="method"]').val(); // Pass 'add' or 'update'
                            },
                            language_id: function() {
                                return $('#language_id').val();
                            },
                        }
                    }
                }
            },
            messages: {
                category_name: {
                    required: category_name_required,
                    maxlength: category_name_max,
                    remote: category_name_exists
                },
                slug: {
                    required: slug_required,
                    maxlength: slug_max,
                    remote: slug_exists
                }
            },
            errorPlacement: function (error, element) {
                var errorId = element.attr("id") + "_error";
                $("#" + errorId).text(error.text());
            },
            highlight: function (element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                submitFormAjax(form);
            }
        });

        function submitFormAjax(form) {
            var formData = new FormData(form);

            $.ajax({
                url: "/api/admin/blogs/save-category",
                type: "POST",
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                beforeSend: function () {
                    $(".save_category_btn").attr("disabled", true).html(
                        '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                    );
                },
            })
            .done(function (response) {
                if ($.fn.DataTable.isDataTable('#blogCategoryTable')) {
                    $('#blogCategoryTable').DataTable().destroy();
                }
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid is-valid");
                $(".save_category_btn").removeAttr("disabled").html(lg_save);
                if (response.code === 200) {
                    toastr.success(response.message);
                    $("#blog_category_modal").modal('hide');
                    var langCode = $('body').data('lang');
                    listBlogCategory(langCode);
                }
            })
            .fail(function (error) {
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid is-valid");
                $(".save_category_btn").removeAttr("disabled").html(lg_save);
                if (error.status == 422) {
                    $.each(error.responseJSON.errors, function (key, val) {
                        $("#" + key).addClass("is-invalid");
                        $("#" + key + "_error").text(val[0]);
                    });
                }
            });
        }

        $(document).on("click", '.edit_category_btn', function () {
            $('#blogCategoryForm').trigger('reset');
            $('.category_modal_title').html(lg_category_edit_title);
            $('#method').val('update');
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid is-valid");

            var id = $(this).data("id");
            $('#id').val(id);
            var category_name = $(this).data("category_name");
            var slug = $(this).data("slug");

            $('#translate_container').removeClass('d-none');
            var langId = $('#language_id').val();

            languageTranslate(langId);
            getCategory(id, langId);

        });

        $(document).on("click", ".delete_category_btn", function () {
            var id = $(this).data("del-id");
            $('#delete_id').val(id);
        });

        $(document).on('click', '.delete_category_confirm', function (e) {
            e.preventDefault();
            var delId = $('#delete_id').val();

            $.ajax({
                url: "/api/admin/blogs/delete-category",
                type: 'POST',
                data: {
                    id: delId,
                    language_code: langCode
                },
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    $('#blogCategoryTable').DataTable().destroy();
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#delete_blog_category_modal").modal("hide");
                        listBlogCategory(langCode);
                    }
                },
                error: function (xhr, status, error) {
                    toastr.error("An error occurred while deleting blog category.");
                },
            });
        });

        $(document).on('change', '.category_status', function () {
            let id = $(this).data('category-id');
            let status = $(this).is(':checked') ? 1 : 0;

            var data = {
                'id': id,
                'status': status,
                'language_code': langCode
            };

            $.ajax({
                url: '/api/admin/blogs/change-category-status',
                type: 'POST',
                data: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                        listBlogCategory(langCode);
                    }
                },
                error: function (error) {
                    toastr.error('An error occurred while updating status');
                }
            });
        });

    });

    $('#language_id').on('change', function() {
        var langId = $(this).val();
        var id = $('#id').val();

        languageTranslate(langId);
        getCategory(id, langId);

    });

    function getCategory(id, lang_id = '', langCode = '') {
        $.ajax({
            url: "/api/admin/blogs/get-blog-category",
            type: "POST",
            data: {
                id: id,
                language_id: lang_id,
                language_code: langCode
            },
            dataType: "json",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    let category = response.data;

                    if (category) {
                        $('#category_name').val(category.name);
                        $('#slug').val(category.slug);
                    } else {
                        $('#category_name').val("");
                        $('#slug').val("");
                    }

                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    function languageTranslate(lang_id = '', langCode = '') {
        $.ajax({
            url: "/api/translate",
            type: "POST",
            dataType: "json",
            data: {
                language_id: lang_id,
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                const trans = response.translated_values;

                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid is-valid");

                if (response.code === 200 && Object.keys(trans).length > 0) {

                    $('label[for="category_name"]').html(`${trans.category_name}<span class="text-danger"> *</span>`);
                    $('label[for="slug"]').html(`${trans.Slug}<span class="text-danger"> *</span>`);

                    $('#category_name').attr('placeholder', trans.enter_category_name);
                    $('#slug').attr('placeholder', trans.enter_slug);
                    $('.cancelbtn').text(trans.Cancel);
                    $('.save_category_btn').text(trans.Save);
                    $('.lang_title').text(trans.available_translations);
                    lg_save = trans.Save;
                    lg_category_add_title = trans.add_category;
                    lg_category_edit_title = trans.edit_category;

                    if ($('#method').val() == 'update') {
                        $('.category_modal_title').text(trans.edit_category);
                    } else {
                        $('.category_modal_title').text(trans.add_category);
                    }

                    $('#blogCategoryForm').validate().settings.messages = {
                        category_name: {
                            required: trans.category_name_required,
                            maxlength: trans.category_name_max,
                            remote: trans.category_name_exists
                        },
                        slug: {
                            required: trans.slug_required,
                            maxlength: trans.slug_max,
                            remote: trans.slug_exists
                        }
                    };
                }

            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }


}

if (pageValue === 'admin.blog-post') {

    var categoryValue = '';

    function listPosts(langCode = '') {
        $.ajax({
            url: "/api/admin/blogs/list-post",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {

                    let posts = response.data;
                    let tableBody = "";
                    if (posts.length === 0) {
                        $('#blogPostTable').DataTable().destroy();
                        tableBody += `
                            <tr>
                                <td colspan="6" class="text-center">${$('#blogPostTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        posts.forEach((post, index) => {
                            let checkedVal = post.status == 1 ? 'checked' : '';
                            tableBody += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${post.title}</td>
                                    <td>${post.category.name}</td>
                                    <td>
                                        <span class="badge ${post.popular == '1' ? 'badge-soft-success' : 'badge-soft-danger'} d-inline-flex align-items-center">
                                            <i class="ti ti-circle-filled fs-5 me-1"></i>${post.popular == '1' ? $('#blogPostTable').data('yes') : $('#blogPostTable').data('no')}
                                        </span>
                                    </td>
                                    ${ $('#has_permission').data('edit') == 1 ?
                                        `<td>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input post_status" ${checkedVal} type="checkbox" role="switch" id="switch-sm" data-post-id = ${post.id}>
                                            </div>
                                        </td>` : ''
                                    }
                                    ${ $('#has_permission').data('visible') == 1 ?
                                        `<td>
                                            <li style="list-style: none;">
                                            ${ $('#has_permission').data('edit') == 1 ?
                                                `<a class="edit_post_btn"
                                                    href="#"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#blog_post_modal"
                                                    data-id="${post.id}">
                                                    <i class="ti ti-pencil fs-20" data-tooltip="tooltip" title="${$('#blogPostTable').data('edit')}"></i>
                                                </a>` : ''
                                            }
                                            ${ $('#has_permission').data('delete') == 1 ?
                                                `<a class="delete delete_post_btn" href="#" data-bs-toggle="modal" data-bs-target="#delete_blog_post_modal" data-del-id="${post.id}">
                                                    <i class="ti ti-trash m-3 fs-20" data-tooltip="tooltip" title="${$('#blogPostTable').data('delete')}"></i>
                                                </a>` : ''
                                            }
                                            </li>
                                        </td>` : ''
                                    }
                                </tr>
                            `;
                        });
                    }

                    $('#blogPostTable tbody').html(tableBody);
                    initTooltip();

                    if ((posts.length != 0) && !$.fn.DataTable.isDataTable('#blogPostTable')) {
                        $('#blogPostTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.responseJSON.code === 500) {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    function getBlogCategory(lang_id = '', langCode = '') {
        $.ajax({
            url: "/api/admin/blogs/get-category",
            type: "POST",
            data: {
              language_id: lang_id,
              language_code: langCode
            },
            dataType: "json",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {
                    let categories = response.data;
                    let categoryDropdown = $('#category');
                    categoryDropdown.find('option:not(:first)').remove();

                    categories.forEach((category) => {
                        categoryDropdown.append(`<option value="${category.id}">${category.name}</option>`);
                    });
                    categoryDropdown.val(categoryValue).trigger('change');
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    function initSummernote() {
        const defaultOptions = {
            height: 300,
            minHeight: 300,
            maxHeight: 500,
            focus: true,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'clear']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],

        };
        $('.summernote-editor').summernote(defaultOptions);
    }

    function getPost(id, langId = null, langCode = '') {
        $.ajax({
            url: "/api/admin/blogs/get-post",
            type: "POST",
            dataType: "json",
            data: {
                id: id,
                language_id: langId,
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {
                    let post = response.data;

                    if (post) {
                        $("#imagePreview").attr('src', post.image);
                        $('#title').val(post.title);
                        $('#slug').val(post.slug);
                        $('#description').summernote('code', post.description);

                        $('#tags').tagsinput('removeAll');
                        if (post.tags) {
                            let normalizedTags = post.tags.replace(/،/g, ',').replace(/\s*,\s*/g, ',').trim();
                            let tagsArray = normalizedTags.split(',');
                            tagsArray.forEach(tag => {
                                if (tag.trim()) {
                                    $('#tags').tagsinput('add', tag.trim());
                                }
                            });
                        }

                        $('#seo_title').val(post.seo_title);
                        $('#seo_description').val(post.seo_description);
                        $("#status").prop("checked", post.status == 1);
                        $("#popular").prop("checked", post.popular == 1);
                        $('#category').val(post.category).trigger('change');
                        categoryValue = post.category;
                    } else {
                        $('#title').val("");
                        $('#slug').val("");
                        $('#description').summernote('code', "");

                        $('#tags').tagsinput('removeAll');

                        $('#seo_title').val("");
                        $('#seo_description').val("");
                        $("#status").prop("checked", true);
                        $("#popular").prop("checked", false);
                        categoryValue = '';
                    }
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    $(document).ready(function() {
        var langCode = $('body').data('lang');

        initSummernote();
        listPosts(langCode);
        getBlogCategory('', langCode);

        $('#add_post_btn').on('click', function() {
            $('#blogPostForm').trigger('reset');
            $('.post_modal_title').html(lg_post_add_title);
            $('#method').val('add');
            $('#id').val('');
            $('#imagePreview').hide();
            $('.upload_icon').show();
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid is-valid");
            $(".form-select").removeClass("is-invalid is-valid");
            $('#blogPostForm').trigger('reset');
            $('#description').summernote('code', '');
            $('#tags').tagsinput('removeAll');
            $('#translate_container').addClass('d-none');

            languageTranslate('', langCode);

            categoryValue = "";
            $('#category').find('option:not(:first)').remove();
            getBlogCategory('', langCode);

        });

        $('#image').on('change', function (event) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').attr('src', e.target.result).show();
                $('.upload_icon').hide();
            };
            reader.readAsDataURL(event.target.files[0]);
        });

        $('#blogPostForm').validate({
            rules: {
                title: {
                    required: true,
                    maxlength: 100,
                    remote: {
                        url: '/api/admin/blogs/check-unique-post-title',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            title: function() {
                                return $('#title').val();
                            },
                            id: function() {
                                return $('#blogPostForm input[name="id"]').val();
                            },
                            language_id: function() {
                                return $('#language_id').val();
                            },
                            parent_id: function() {
                                let method = $('#blogPostForm input[name="method"]').val();
                                return method === 'add' ? 0 : $('#id').val();
                            },
                            method: function() {
                                return $('#blogPostForm input[name="method"]').val(); // Pass 'add' or 'update'
                            }
                        }
                    }
                },
                slug: {
                    required: true,
                    maxlength: 100,
                    remote: {
                        url: '/api/admin/blogs/check-unique-post-slug',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            slug: function() {
                                return $('#slug').val();
                            },
                            id: function() {
                                return $('#blogPostForm input[name="id"]').val();
                            },
                            language_id: function() {
                                return $('#language_id').val();
                            },
                            parent_id: function() {
                                let method = $('#blogPostForm input[name="method"]').val();
                                return method === 'add' ? 0 : $('#id').val();
                            },
                            method: function() {
                                return $('#blogPostForm input[name="method"]').val();
                            }
                        }
                    }
                },
                image: {
                    required: function() {
                        return $('#blogPostForm').find('input[name="method"]').val() === 'add';
                    },
                    extension: "jpeg|jpg|png",
                    filesize: 2048,
                },
                category: {
                    required: true
                }
            },
            messages: {
                title: {
                    required: "Title is required.",
                    remote: "Title already exists."
                },
                slug: {
                    required: "Slug is required.",
                    remote: "Slug already exists."
                },
                image: {
                    required: "Image is required.",
                    extension: "Only JPEG, JPG, or PNG format are allowed.",
                    filesize: "Image size must be less than 2MB."
                },
                category: {
                    required: "Category is required."
                }
            },
            errorPlacement: function (error, element) {
                var errorId = element.attr("id") + "_error";
                $("#" + errorId).text(error.text());
            },
            highlight: function (element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element) {
                $(element).removeClass("is-invalid");
                $(element).addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                var formData = new FormData(form);
                formData.append("status", $("#status").is(":checked") ? 1 : 0);
                formData.append("popular", $("#popular").is(":checked") ? 1 : 0);
                formData.append('user_id', localStorage.getItem('user_id'));

                $.ajax({
                    url: "/api/admin/blogs/save-post",
                    type: "POST",
                    data: formData,
                    enctype: "multipart/form-data",
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $(".save_post_btn").attr("disabled", true);
                        $(".save_post_btn").html(
                            '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                        );
                    },
                })
                .done((response, statusText, xhr) => {
                    if ($.fn.DataTable.isDataTable('#blogPostTable')) {
                        $('#blogPostTable').DataTable().destroy();
                    }
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".form-select").removeClass("is-invalid is-valid");
                    $(".save_post_btn").removeAttr("disabled");
                    $(".save_post_btn").html($('.save_post_btn').data('save'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#blog_post_modal").modal('hide');
                        var code = $('body').data('lang');
                        listPosts(code);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".form-select").removeClass("is-invalid is-valid");
                    $(".save_post_btn").removeAttr("disabled");
                    $(".save_post_btn").html($('.save_post_btn').data('save'));
                    if (error.responseJSON.code === 422) {
                        $.each(error.responseJSON.message, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr.error(error.responseJSON.message);
                    }
                });
            }
        });

        $.validator.addMethod("maxword", function(value, element, param) {
            return str_word_count(value) <= param;
        }, "Description should contain no more than 300 words.");

        $.validator.addMethod("filesize", function (value, element, param) {
            if (element.files.length === 0) return true;
            return element.files[0].size <= param * 1024;
        }, "File size must be less than {0} KB.");

        function str_word_count(str) {
            return str.trim().split(/\s+/).length;
        }


        $(document).on("click", '.edit_post_btn', function () {
            $('#blogPostForm').trigger('reset');
            $('.post_modal_title').html(lg_post_edit_title);
            $('#method').val('update');
            $(".error-text").text("");
            $(".form-control").removeClass("is-invalid is-valid");
            $(".form-select").removeClass("is-invalid is-valid");
            $(".upload_icon").hide();
            $('#imagePreview').show();
            $('#translate_container').removeClass('d-none');

            var id = $(this).data('id');
            $('#id').val(id);
            var langId = $('#language_id').val();

            languageTranslate('', langCode);
            getPost(id, langId);
            getBlogCategory('', langCode);

        });

        $(document).on("click", ".delete_post_btn", function () {
            var id = $(this).data("del-id");
            $('#delete_id').val(id);
        });

        $(document).on('click', '.delete_post_confirm', function (e) {
            e.preventDefault();
            var delId = $('#delete_id').val();

            $.ajax({
                url: "/api/admin/blogs/delete-post",
                type: 'POST',
                data: {
                    id: delId,
                    language_code: langCode
                },
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    $('#blogPostTable').DataTable().destroy();
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#delete_blog_post_modal").modal("hide");
                        listPosts(langCode);
                    }
                },
                error: function (xhr, status, error) {
                    toastr.error("An error occurred while deleting blog post.");
                },
            });
        });

        $(document).on('change', '.post_status', function () {
            let id = $(this).data('post-id');
            let status = $(this).is(':checked') ? 1 : 0;

            var data = {
                'id': id,
                'status': status,
                'language_code': langCode
            };

            $.ajax({
                url: '/api/admin/blogs/change-post-status',
                type: 'POST',
                data: data,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                        listPosts(langCode);
                    }
                },
                error: function (error) {
                    toastr.error('An error occurred while updating status');
                }
            });
        });

    });

    $('#language_id').on('change', function() {
        var langId = $(this).val();
        var id = $('#id').val();

        getPost(id, langId);
        languageTranslate(langId);
        getBlogCategory(langId);
    });

    function languageTranslate(lang_id, langCode = '') {
        $.ajax({
            url: "/api/translate",
            type: "POST",
            dataType: "json",
            data: {
                language_id: lang_id,
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                const trans = response.translated_values;
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid is-valid");
                $(".form-select").removeClass("is-invalid is-valid");

                if (response.code === 200 && Object.keys(trans).length > 0) {

                    $('#imageNote').text(trans.image_size_note);
                    $('label[for="image"]').html(`${trans.image}<span class="text-danger"> *</span>`);
                    $('label[for="title"]').html(`${trans.Title}<span class="text-danger"> *</span>`);
                    $('label[for="slug"]').html(`${trans.Slug}<span class="text-danger"> *</span>`);
                    $('label[for="category"]').html(`${trans.Category}<span class="text-danger"> *</span>`);
                    $('label[for="description"]').html(`${trans.description}<span class="text-danger"> *</span>`);
                    $('label[for="tags"]').html(`${trans.tags}`);
                    $('label[for="seo_title"]').html(`${trans.seo_title}`);
                    $('label[for="seo_description"]').html(`${trans.seo_description}`);

                    $('#category').find('option:first').text(trans.select_category);

                    $('#title').attr('placeholder', trans.enter_title);
                    $('#slug').attr('placeholder', trans.enter_slug);
                    $('#tags').tagsinput('input').attr('placeholder', trans.enter_tag);
                    $('#seo_title').attr('placeholder', trans.enter_seo_title);
                    $('#status_text').text(trans.Status);
                    $('#popular_text').text(trans.popular_text);
                    $('#upload_text').text(trans.upload);
                    $('.cancelbtn').text(trans.Cancel);
                    $('.save_post_btn').text(trans.Save);
                    $('.lang_title').text(trans.available_translations);
                    $('.save_post_btn').data('save', trans.Save);

                    if ($('#method').val() == 'update') {
                        $('.post_modal_title').text(trans.edit_post);
                    } else {
                        $('.post_modal_title').text(trans.add_post);
                    }

                    $('#blogPostForm').validate().settings.messages = {
                        title: {
                            required: trans.title_required,
                            remote: trans.title_exists
                        },
                        slug: {
                            required: trans.slug_required,
                            remote: trans.slug_exists
                        },
                        image: {
                            required: trans.image_required,
                            extension: trans.image_extension,
                            filesize: trans.image_filesize
                        },
                        category: {
                            required: trans.category_required
                        }
                    };

                }

            },
            error: function (error) {
                $("#translate_btn").removeAttr("disabled").html('Translate');
                toastr.error(error.responseJSON.message);
            },
        });
    }

}

if (pageValue === 'admin.roles-permissions') {

    $(document).ready(function() {
        listRoles();
    });

    function listRoles() {
        $.ajax({
            url: "/api/role/list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                user_id: localStorage.getItem('user_id')
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === "200") {
                    let roles = response.data;
                    let tableBody = "";
                    if (roles.length === 0) {
                        $('#roleTable').DataTable().destroy();
                        tableBody += `
                            <tr>
                                <td colspan="4" class="text-center">${$('#roleTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        roles.forEach((role, index) => {
                            let checkedVal = role.status == 1 ? 'checked' : '';
                            tableBody += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${role.role_name}</td>
                                    <td>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input role_status" ${checkedVal} type="checkbox" role="switch" id="switch-sm" data-id = ${role.id}>
                                        </div>
                                    </td>
                                    ${
                                        $('#has_permission').data('visible') == 1 ?
                                    `<td>
                                        <div class="d-flex align-items-center">
                                            ${
                                                $('#has_permission').data('edit') == 1 ?
                                                `<a href="#"
                                                    class="edit_role_btn"
                                                    data-bs-toggle="modal" data-bs-target="#role_modal"
                                                    data-id="${role.id}"
                                                    data-role_name="${role.role_name}">
                                                    <i class="ti ti-pencil m-3 fs-20" data-tooltip="tooltip" title="${$('#roleTable').data('edit')}"></i>
                                                </a>` : ''
                                            }
                                            ${
                                                $('#has_permission').data('edit') == 1 ?
                                                `<a href="#"
                                                    class="permission_btn"
                                                    data-bs-toggle="modal" data-bs-target="#permission_modal" data-id="${role.id}">
                                                    <i class="ti ti-shield m-3 fs-20" data-tooltip="tooltip" title="${$('#roleTable').data('permission')}"></i>
                                                </a>` : ''
                                            }
                                            ${ $('#has_permission').data('delete') == 1 ?
                                                `<a href="#"
                                                    class="delete_role_btn"
                                                    data-bs-toggle="modal" data-bs-target="#delete_role_modal" data-id="${role.id}">
                                                    <i class="ti ti-trash m-3 fs-20" data-tooltip="tooltip" title="${$('#roleTable').data('delete')}"></i>
                                                </a>` : ''
                                            }
                                        </div>
                                    </td>` : ''
                                    }
                                </tr>
                            `;
                        });
                    }

                    $('#roleTable tbody').html(tableBody);
                    initTooltip();

                    if ((roles.length != 0) && !$.fn.DataTable.isDataTable('#roleTable')) {
                        $('#roleTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.responseJSON.code === 500) {
                    toastr.error(error.responseJSON.message);
                }
            },
        });
    }

    $(document).on('click', '#add_role_btn', function() {
        $('.role_modal_title').html($('.role_modal_title').data('add_text'));
        $('#method').val('add');
        $('#id').val('');
        $(".error-text").text("");
        $(".form-control").removeClass("is-invalid is-valid");
        $('#roleForm')[0].reset();
    });

    $(document).ready(function() {

        $('#roleForm').validate({
            rules: {
                role_name: {
                    required: true,
                    maxlength: 150,
                    remote: {
                        url: '/api/role/check-unique',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        data: {
                            role_name: function() {
                                return $('#role_name').val();
                            },
                            id: function() {
                                return $('#roleForm input[name="id"]').val();
                            }
                        }
                    }
                }
            },
            messages: {
                role_name: {
                    required: $('#role_name_error').data('required'),
                    maxlength: $('#role_name_error').data('max'),
                    remote: $('#role_name_error').data('exists')
                }
            },
            errorPlacement: function(error, element) {
                var errorId = element.attr("id") + "_error";
                $("#" + errorId).text(error.text());
            },
            highlight: function(element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function(element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function(form) {
                var formData = new FormData(form);
                formData.append('created_by', localStorage.getItem('user_id'));

                $.ajax({
                    url: "/api/role/save",
                    type: "POST",
                    data: formData,
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    beforeSend: function() {
                        $(".role_save_btn").attr("disabled", true);
                        $(".role_save_btn").html(
                            '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                        );
                    },
                })
                .done((response) => {
                    if ($.fn.DataTable.isDataTable('#roleTable')) {
                        $('#roleTable').DataTable().destroy();
                    }
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".role_save_btn").removeAttr("disabled").html($('.role_save_btn').data('save'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        $("#role_modal").modal('hide');
                        listRoles();
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid is-valid");
                    $(".role_save_btn").removeAttr("disabled").html($('.role_save_btn').data('save'));
                    if (error.responseJSON.code === 422) {
                        $.each(error.responseJSON.message, function(key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr.error(error.responseJSON.message);
                    }
                });
            }
        });
    });


    $(document).on('click', '.edit_role_btn', function() {
        $('.role_modal_title').html($('.role_modal_title').data('edit_text'));
        $('#method').val('update');
        $(".error-text").text("");
        $(".form-control").removeClass("is-invalid is-valid");

        var id = $(this).data('id');
        var role_name = $(this).data('role_name');

        $('#id').val(id);
        $('#role_name').val(role_name);
    });

    $(document).on('click', '.delete_role_btn', function () {
        var id = $(this).data("id");
        $('.delete_role_confirm').data('id', id);
    });

    $(document).on('click', '.delete_role_confirm', function (e) {
        e.preventDefault();
        var id = $(this).data('id');

        $.ajax({
            url: "/api/role/delete",
            type: 'POST',
            data: {
                id: id,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                $('#roleTable').DataTable().destroy();
                if (response.code === 200) {
                    toastr.success(response.message);
                    $("#delete_role_modal").modal("hide");
                    listRoles();
                }
            },
            error: function (error) {
                if (error.responseJSON.code === 500) {
                    toastr.error(error.responseJSON.message);
                } else {
                    toastr.error("An error occurred while deleting role.");
                }
            },
        });
    });

    $(document).on('change', '.role_status', function () {
        let id = $(this).data('id');
        let status = $(this).is(':checked') ? 1 : 0;

        var data = {
            'id': id,
            'status': status
        };

        $.ajax({
            url: '/api/role/change-status',
            type: 'POST',
            data: data,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === 200) {
                    toastr.success(response.message);
                    listRoles();
                }
            },
            error: function (error) {
                if (error.responseJSON.code === 500) {
                    toastr.error(error.responseJSON.message);
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            }
        });
    });

    $(document).on('click', '.permission_btn', function() {
        var id = $(this).data('id');
        $('#savePermissions').data('role_id', id);
        if ($.fn.DataTable.isDataTable('#permissionTable')) {
            $('#permissionTable').DataTable().destroy();
        }

        $.ajax({
            url: "/api/permission/list",
            type: "POST",
            dataType: "json",
            data: {
                id: id,
                order_by: "asc",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === "200") {
                    let permissions = response.data;
                    let tableBody = "";

                    if (permissions.length === 0) {
                        if ($.fn.DataTable.isDataTable('#permissionTable')) {
                            $('#permissionTable').DataTable().destroy();
                        }
                        tableBody += `
                            <tr>
                                <td colspan="7" class="text-center">${$('#permissionTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        permissions.forEach((permission, index) => {
                            let create = permission.create == 1 ? 'checked' : '';
                            let view = permission.view == 1 ? 'checked' : '';
                            let edit = permission.edit == 1 ? 'checked' : '';
                            let Delete = permission.delete == 1 ? 'checked' : '';
                            let allowAll = permission.allow_all == 1 ? 'checked' : '';

                            tableBody += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td data-id="${permission.id}">${permission.module}</td>
                                    <td>
                                        <label class="checkboxs">
                                            <input type="checkbox" class="perm-create" ${create}>
                                            <span class="checkmarks"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <label class="checkboxs">
                                            <input type="checkbox" class="perm-view" ${view}>
                                            <span class="checkmarks"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <label class="checkboxs">
                                            <input type="checkbox" class="perm-edit" ${edit}>
                                            <span class="checkmarks"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <label class="checkboxs">
                                            <input type="checkbox" class="perm-delete" ${Delete}>
                                            <span class="checkmarks"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <label class="checkboxs">
                                            <input type="checkbox" class="perm-allow-all" ${allowAll}>
                                            <span class="checkmarks"></span>
                                        </label>
                                    </td>
                                </tr>
                            `;
                        });
                    }

                    $('#permissionTable tbody').html(tableBody);

                    if ((permissions.length != 0) && !$.fn.DataTable.isDataTable('#permissionTable')) {
                        $('#permissionTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }

                    $(document).on('change', '.perm-allow-all', function() {
                        let row = $(this).closest('tr');
                        let isChecked = $(this).is(':checked');

                        row.find('.perm-create, .perm-view, .perm-edit, .perm-delete').prop('checked', isChecked);
                    });

                    $(document).on('change', '.perm-create, .perm-view, .perm-edit, .perm-delete', function() {
                        let row = $(this).closest('tr');
                        let allChecked = row.find('.perm-create, .perm-view, .perm-edit, .perm-delete').length === row.find('.perm-create:checked, .perm-view:checked, .perm-edit:checked, .perm-delete:checked').length;

                        row.find('.perm-allow-all').prop('checked', allChecked);
                    });

                }
            },
            error: function (error) {
                if (error.responseJSON.code === 500) {
                    toastr.error(error.responseJSON.message);
                }
            },
        });

    });

    $('#savePermissions').on('click', function (e) {
        e.preventDefault();

        let roleId = $(this).data('role_id');
        let table = $('#permissionTable').DataTable();
        let formData = new FormData();

        formData.append('role_id', roleId);

        table.rows().every(function (rowIdx, tableLoop, rowLoop) {
            let row = $(this.node());
            let index = rowIdx;

            formData.append(`permissions[${index}][id]`, row.find('td:eq(1)').data('id'));
            formData.append(`permissions[${index}][module]`, row.find('td:eq(1)').text().trim());
            formData.append(`permissions[${index}][create]`, row.find('.perm-create').is(':checked') ? 1 : 0);
            formData.append(`permissions[${index}][view]`, row.find('.perm-view').is(':checked') ? 1 : 0);
            formData.append(`permissions[${index}][edit]`, row.find('.perm-edit').is(':checked') ? 1 : 0);
            formData.append(`permissions[${index}][delete]`, row.find('.perm-delete').is(':checked') ? 1 : 0);
            formData.append(`permissions[${index}][allow_all]`, row.find('.perm-allow-all').is(':checked') ? 1 : 0);
        });

        $.ajax({
            url: "/api/permission/update",
            type: "POST",
            dataType: "json",
            processData: false,
            contentType: false,
            data: formData,
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
                $("#savePermissions").attr("disabled", true);
                $("#savePermissions").html(
                    '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                );
            },
            success: function (response) {
                if ($.fn.DataTable.isDataTable('#permissionTable')) {
                    $('#permissionTable').DataTable().destroy();
                }
                $("#savePermissions").removeAttr("disabled");
                $('#savePermissions').html($('#savePermissions').data('save'));
                if (response.code === 200) {
                    toastr.success(response.message);
                    $('#permission_modal').modal('hide');
                }
            },
            error: function (error) {
                $("#savePermissions").removeAttr("disabled");
                $('#savePermissions').html($('#savePermissions').data('save'));
                if (error.code === 500) {
                    toastr.error(error.message);
                } else {
                    toastr.error("An error occurred while updating permission.");
                }
            }
        });
    });

}
//validation hide
$(document).ready(function() {
    $('.validate-input').on('input change', function() {
        // Find the closest error message and hide it
        $(this).removeClass('is-invalid').next('.error-text').hide();
    });
});

if (pageValue === 'admin.payment-settings') {


    $('#generalTab a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $(document).ready(function() {
        async function loadGeneralSettings() {
            const response = await $.ajax({
                url: '/api/admin/general-setting/list',
                type: 'POST',
                data: {'group_id': 13},
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                }
            });

            if (response.code === 200) {
                const requiredKeys = [
                    'paypal_status','wallet_status','cod_status','paypal_id', 'paypal_secret','stripe_status','razorpay_status','bank_status',
                    'paypal_live','stripe_secret','stripe_key','mollie_status','razor_key','razor_secret','branch_code','account_number','bank_name'
                ];

                const filteredSettings = response.data.settings.filter(setting => requiredKeys.includes(setting.key));

                filteredSettings.forEach(setting => {
                    $('#' + setting.key).val(setting.value);
                    if (setting.key === 'paypal_status' && setting.value==='1') {
                        $('#paypal_status_show').prop('checked', true);
                    }
                    if (setting.key === 'wallet_status' && setting.value==='1') {
                        $('#wallet_status_show').prop('checked', true);
                    }
                    if (setting.key === 'mollie_status' && setting.value==='1') {
                        $('#moillie_status_show').prop('checked', true);
                    }
                    if (setting.key === 'cod_status' && setting.value==='1') {
                        $('#cod_status_show').prop('checked', true);
                    }
                    if (setting.key === 'bank_status' && setting.value==='1') {
                        $('#bank_status_show').prop('checked', true);
                    }
                    if (setting.key === 'razorpay_status' && setting.value==='1') {
                        $('#razor_status_show').prop('checked', true);
                    }
                    if (setting.key === 'paypal_live' && setting.value==='yes') {
                        $('#paypal_mode_show').prop('checked', true);
                    }
                    if (setting.key === 'stripe_status' && setting.value==='1') {
                        $('#stripe_status_show').prop('checked', true);
                    }
                });

            } else {
                toastr.error('Error fetching settings:', response.message);
            }

        }

        async function init() {
            await loadGeneralSettings();
        }
        init().catch((error) => {
            toastr.error('Error during initialization:', error);
        });
        $(document).on('click, change', '#paypal_status_show', function(e) {
            if($("#paypal_status_show").prop('checked') == true){
                var checkedstatus=1;
            }else{
                var checkedstatus=0;

            }

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: {
                    paypal_status: checkedstatus,group_id:13
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        // alert('Error: ' + response.message);
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Failed to set default language. Please try again.');
                }
            });

        });

        $(document).on('click, change', '#wallet_status_show', function(e) {
            if($("#wallet_status_show").prop('checked') == true){
                var checkedstatus=1;
            }else{
                var checkedstatus=0;

            }

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: {
                    wallet_status: checkedstatus,group_id:13
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        // alert('Error: ' + response.message);
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Failed to set default language. Please try again.');
                }
            });

        });


        $(document).on('click, change', '#cod_status_show', function(e) {
            if($("#cod_status_show").prop('checked') == true){
                var checkedstatus=1;
            }else{
                var checkedstatus=0;

            }

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: {
                    cod_status_show: checkedstatus,group_id:13
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        // alert('Error: ' + response.message);
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Failed to set default language. Please try again.');
                }
            });

        });

        $(document).on('click, change', '#moillie_status_show', function(e) {
            if($("#moillie_status_show").prop('checked') == true){
                var checkedstatus=1;
            }else{
                var checkedstatus=0;

            }

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: {
                    moillie_status_show: checkedstatus,group_id:13
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        // alert('Error: ' + response.message);
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Failed to set default language. Please try again.');
                }
            });

        });
        $(document).on('click, change', '#stripe_status_show', function(e) {
            if($("#stripe_status_show").prop('checked') == true){
                var checkedstatus=1;
            }else{
                var checkedstatus=0;

            }

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: {
                    stripe_status: checkedstatus,group_id:13
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        // alert('Error: ' + response.message);
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Failed to set default language. Please try again.');
                }
            });

        });
        $(document).on('click, change', '#bank_status_show', function(e) {
            if($("#bank_status_show").prop('checked') == true){
                var checkedstatus=1;
            }else{
                var checkedstatus=0;

            }

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: {
                    bank_status: checkedstatus,group_id:13
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        // alert('Error: ' + response.message);
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Failed to set default language. Please try again.');
                }
            });

        });

        $(document).on('click, change', '#razor_status_show', function(e) {
            if($("#razor_status_show").prop('checked') == true){
                var checkedstatus=1;
            }else{
                var checkedstatus=0;

            }

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: {
                    razorpay_status: checkedstatus,group_id:13
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        // alert('Error: ' + response.message);
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Failed to set default language. Please try again.');
                }
            });

        });

        $('#RazorpaySettingForm').on('submit', function(e) {
            e.preventDefault();

            let formData = $(this).serialize();

            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: formData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                },
                beforeSend: function() {
                    $('.paypal_button').attr('disabled', true);
                    $('.paypal_button').html('<div class="spinner-border text-light" role="status"></div>');
                    $('#connect_payment_razorpay').modal('hide');

                },
                success: function(response) {
                    $('.paypal_button').attr('disabled', false);
                    $('.paypal_button').html('Update');
                    $('#connect_payment_razorpay').modal('hide');

                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error('Error updating general settings');
                }
            });

        });
        $('#BankSettingForm').on('submit', function(e) {
            e.preventDefault();
            let formData = $(this).serialize();
            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: formData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                },
                beforeSend: function() {
                    $('.paypal_button').attr('disabled', true);
                    $('.paypal_button').html('<div class="spinner-border text-light" role="status"></div>');
                    $('#connect_payment').modal('hide');

                },
                success: function(response) {
                    $('.paypal_button').attr('disabled', false);
                    $('.paypal_button').html('Update');
                    $('#connect_payment').modal('hide');


                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error('Error updating general settings');
                }
            });
        });
        $('#stiprSettingForm').on('submit', function(e) {
            e.preventDefault();
            let formData = $(this).serialize();
            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: formData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                },
                beforeSend: function() {
                    $('.paypal_button').attr('disabled', true);
                    $('.paypal_button').html('<div class="spinner-border text-light" role="status"></div>');
                    $('#connect_payment_stripe').modal('hide');

                },
                success: function(response) {
                    $('.paypal_button').attr('disabled', false);
                    $('.paypal_button').html('Update');
                    $('#connect_payment_stripe').modal('hide');

                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error('Error updating general settings');
                }
            });
        });
        $('#PaypalSettingForm').on('submit', function(e) {
            e.preventDefault();

            let formData = $(this).serialize();
            $.ajax({
                url: '/api/admin/updatepaymentSettings',
                type: 'POST',
                data: formData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json',
                },
                beforeSend: function() {
                    $('.paypal_button').attr('disabled', true);
                    $('.paypal_button').html('<div class="spinner-border text-light" role="status"></div>');
                    $('#connect_payment_paypal').modal('hide');
                },
                success: function(response) {
                    $('.paypal_button').attr('disabled', false);
                    $('.paypal_button').html('Update');
                    $('#connect_payment_paypal').modal('hide');
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error('Error updating general settings');
                }
            });

        });
    });
}

if (pageValue === 'admin.products') {
    $('#generalTab a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    async function init() {
        await loadProducts();
        await loadcategory();
        await loadvariation();

    }

    init().catch((error) => {
        toastr.error('Error during initialization:', error);
    });
    $(document).on('click', '.delete_currency_modal1', function(e) {
        e.preventDefault();

        var languageId = $(this).data('id');
        $('#confirmDelete').data('id', languageId);
    });

    $(document).on('click', '#confirmDelete', function(e) {
        e.preventDefault();

        var languageId = $(this).data('id');
        $.ajax({
            url: '/api/products/delete',
            type: 'POST',
            data: {
                id: languageId,
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.success) {
                    toastr.success(response.message);
                    $('#delete-modal').modal('hide');
                    loadProducts(); // Refresh the language table
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while trying to delete the language.');
            }
        });
    });

    $('#addproductform').on('submit', function(e) {
        e.preventDefault();
        var formData = $(this).serialize();
        $.ajax({
            url: '/api/products/save',
            type: 'POST',
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code === 200) {
                    $('#Add_product').modal('hide');
                    loadProducts();
                    toastr.success(response.message);

                } else {
                    // alert('Error: ' + response.message);
                    toastr.error(response.message);
                }
            },
            error: function(xhr) {
                alert('Failed to set default language. Please try again.');
            }
        });

    });

    function loadvarvalues(val) {
        var formData = {
            'id': val,
        };
        $.ajax({
            url: '/api/products/variationvaluelist',
            type: 'POST',
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
              //  alert("Here1");

                if (response.code == 200) {
                    //alert("Here2");
                  //  $('#Add_product').modal('hide');
                    //loadProducts();
                    //toastr.success(response.message);
                    var currency_data = response.data;
                    var currency_table_body = $('#var'+val);
                    var response_data;
                    currency_table_body.empty();

                    $.each(currency_data, (index,val) => {
                        response_data = `<div class="checkbox"><label><input name="variationvalue[]" onclick="loadvarvalues(${val.id})" type="checkbox" value="${val.id}" name="checkbox"> ${val.variation_name} <input style="display: inline-block;width: auto;" placeholder="Actual price" type="text" name="variaion_price[${val.id}]" class="form-control" /></label></div>`;
                        currency_table_body.append(response_data);
                    });

                } else {
                    //alert("Here3");

                    // alert('Error: ' + response.message);
                  //  toastr.error(response.message);
                }
            },
            error: function(xhr) {
                alert('Failed to set default language. Please try again.');
            }
        });
    }

     function loadsubcategory(val) {
        var formData = {
            'id': val,
        };
        $.ajax({
            url: '/api/products/categorylist',
            type: 'POST',
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
              //  alert("Here1");

                if (response.code == 200) {
                    //alert("Here2");
                  //  $('#Add_product').modal('hide');
                    //loadProducts();
                    //toastr.success(response.message);
                    var currency_data = response.data;
                    var currency_table_body = $('#Subcategory_fied');
                    var response_data;
                    currency_table_body.empty();
                    currency_table_body.append("<option value='' >Select</option>");

                    $.each(currency_data, (index,val) => {
                        response_data = `<option value="${val.id}">${val.name}</option>`;
                        currency_table_body.append(response_data);
                    });

                } else {
                    //alert("Here3");

                    // alert('Error: ' + response.message);
                  //  toastr.error(response.message);
                }
            },
            error: function(xhr) {
                alert('Failed to set default language. Please try again.');
            }
        });
     }

     async function loadvariation() {

        //  document.getElementById("category_fied").innerHTML = "new content!"
          const response = await $.ajax({
              url: '/api/products/variationlistall',
              type: 'POST',
              data: {
                  'order_by': 'asc',
                  'count_per_page' : 10,
                  'sort_by' : '',
                  'search' : ''
              },
              headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                  'Accept': 'application/json'
              }
          });

          if (response.code == 200) {
              if(Array.isArray(response.data)) {
                  var currency_data = response.data;
                  var currency_table_body = $('#variation_fied');
                  var response_data;
                  currency_table_body.empty();

                  $.each(currency_data, (index,val) => {
                      response_data = `<div class="checkbox" ><label><input onclick="loadvarvalues(${val.id})" name="variation[]" type="checkbox" value="${val.id}" name="checkbox"> ${val.variation_name}</label></div><div id="var${val.id}" class="checkbox" style="padding-left: 15px;"></div>`;
                      currency_table_body.append(response_data);
                  });
                //  currency_table_body.append("</select>");

              }
          } else {
              toastr.error('Error fetching settings:', response.message);
          }



      }

    async function loadcategory() {

      //  document.getElementById("category_fied").innerHTML = "new content!"
        const response = await $.ajax({
            url: '/api/products/categorylist',
            type: 'POST',
            data: {
                'order_by': 'asc',
                'count_per_page' : 10,
                'sort_by' : '',
                'search' : ''
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            }
        });

        if (response.code == 200) {
            if(Array.isArray(response.data)) {
                var currency_data = response.data;
                var currency_table_body = $('#category_fied');
                var response_data;
                currency_table_body.empty();
                currency_table_body.append("<option value=''>Select</option>");

                $.each(currency_data, (index,val) => {
                    response_data = `<option value="${val.id}">${val.name}</option>`;
                    currency_table_body.append(response_data);
                });
              //  currency_table_body.append("</select>");

            }
        } else {
            toastr.error('Error fetching settings:', response.message);
        }



    }
    async function loadProducts() {
        const response = await $.ajax({
            url: '/api/products/list',
            type: 'POST',
            data: {
                'order_by': 'asc',
                'count_per_page' : 10,
                'sort_by' : '',
                'search' : ''
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            }
        });

        if (response.code == 200) {
            if(Array.isArray(response.data)) {
                var currency_data = response.data;
                var currency_table_body = $('.currency_list');
                var response_data;
                currency_table_body.empty();
                $.each(currency_data, (index,val) => {
                    if(val.source_category=='8')
                    {
                        var ccc='Test';
                    }
                    if(val.source_category=='9')
                        {
                            var ccc='test 1';
                        }
                    response_data = `

                                <tr>
                                    <td>${val.source_name}</td>
                                    <td>${ccc}</td>
                                    <td>${val.source_code}</td>
                                    <td>
                                    <img src="http://127.0.0.1:8000/assets/img/logo-small.svg" />
                                                </td>
                                                                                    <td>Available</td>

                                    <td>
 <div class="form-check form-switch">
                                            <input class="form-check-input currency_default" ${(val.status == 1)? 'checked' : ''} type="checkbox"
                                                role="switch" id="switch-sm" data-id="${val.id}">
                                        </div>
                                    </td>
                                    <td>
                                    <a class="delete_currency_modal1" href="#" data-bs-toggle="modal" data-bs-target="#delete-modal" data-id="${val.id}">
                                    <i class="ti ti-trash-x me-2"></i></a>
                                    <a class="delete_currency_modal"  href="http://127.0.0.1:8000/admin/editproduct/${val.id}" ><i class="ti ti-edit-circle  me-2"></i></a>

                                    </td>
                                </tr>`;
                    currency_table_body.append(response_data);
                });
                if (!$.fn.dataTable.isDataTable('#currency_table')) {
                    $('#currency_table').DataTable({
                        "ordering": true,
                    });
                }
            }
        } else {
            toastr.error('Error fetching settings:', response.message);
        }
    }

}



if(pageValue==='chat'){
    $(document).ready(function () {
        $('.user-chat-search-row').hide();
        $('.chat-search-btn').on('click', function () {
            $('.chat-search').toggleClass('visible-chat');
            $('.contact-search').show();
          });
          $('.close-btn-chat').on('click', function () {
            $('.chat-search').removeClass('visible-chat');
          });
          $(".chat-search .form-control").on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $(".chat .chat-body .messages .chats").filter(function () {
              $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
          });
          $(document).on('keydown', '.chat_form', function(e) {
            if (!$('#message-loader').hasClass('hidden')) {
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                $('#addmsgform').trigger('submit');
            }
        });
        $('.user-chat-search-btn').on('click', function () {
            $('.user-chat-search-row').show();
            $('.user-chat-search-btn').toggleClass('userchat');
            $('#user-dropdown').hide();
        });
        $('.user-close-btn-chat').on('click', function () {
            $('.user-chat-search-row').hide();
            $('.user-chat-search-btn').removeClass('userchat');
            $('#user-dropdown').hide();
        });
        $(document).on('click', '.user-list-item', function () {
            $('#message-loader').removeClass('hidden');
            $('.user-list-item').removeClass('active');
            $(this).addClass('active');
            const userId = $(this).data('user-id');
            const userName = $(this).data('user');
            const authuserid = $(this).data('authuserid');
            var currentPath = window.location.pathname;
            const prfimage=$(this).data('profileimage');
            const defaultImagePath = '/assets/img/profiles/avatar-02.jpg';
            const profileImagePath = prfimage && prfimage !== 'N/A'
            ? `/storage/profile/${prfimage}`
            : defaultImagePath;

            const updateImage = (selector, imagePath) => {
                $(selector).html(
                    `<img src="${imagePath}" alt="User Profile Image" class="img-fluid rounded-circle profileImagePreview">`
                );
            };

            updateImage(`#useravatar${userId}`, profileImagePath);
            updateImage('#chatimg', profileImagePath);
            $('#chat-user-name').text(userName);
            $('.chatcontent').show();
            $.ajax({
                url: '/api/chat/getchatmsg?userid=' + userId +'&authuserid='+authuserid+'&type='+ currentPath,
                type: 'GET',
                success: function (response) {
                    const chatWindow = $('#chat-window');
                    chatWindow.html('');
                    Object.entries(response.message).forEach(([date, messages]) => {
                        // Append a date header for each group
                        chatWindow.append(`
                            <div class="message-date text-center">
                                <strong>${date}</strong>
                            </div>
                        `);

                        // Iterate over messages in the current group
                        messages.forEach(message => {
                            chatWindow.append(`
                                <div class="message flex-column align-items-start ${message.to_user_id === authuserid ? 'incoming' : 'outgoing'}">
                                    <p>${message.content}</p>
                                    <small class="text-muted">${message.relative_time}</small>
                                </div>
                            `);
                        });
                    });
                    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
                    $('#message-loader').addClass('hidden');
                },
                error: function (error) {
                    $('#message-loader').addClass('hidden');
                    console.error('Error fetching messages:', error);
                }
            });
        });
        $(document).on('submit','#addmsgform', function(e) {
            e.preventDefault();
            $('#message-loader').removeClass('hidden');
            var formData = $(this).serialize();
            formData += '&type=admin';
            var fromuserid=$(".from_user_id").val();
            var touserid=$(".to_user_id").val();
            var message1=$(".chat_form").val();
            var authuserid=$(".auth_user_id").val();
            var chatuser=$(".chatuser").val();
            var prfimage=$('.profileimg').val();
            const defaultImagePath = '/assets/img/profiles/avatar-02.jpg';
            const profileImagePath = prfimage && prfimage !== 'N/A'
            ? `/storage/profile/${prfimage}` : defaultImagePath;
            if(message1!=""){
                $.ajax({
                    url: '/api/chat/send',
                    type: 'POST',
                    data: formData,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        if (response.code === '200') {
                        const chatWindow = $('#chat-window');
                            chatWindow.append(`
                                <div class="message ${ touserid=== authuserid ? 'incoming' : 'outgoing'}">
                                    <p>${message1}</p>
                                </div>
                            `);
                        $("#message").val('');
                        const userlist=$('.user-list');
                        const existingUser = userlist.find(`[data-user-id="${touserid}"]`);
                        if (existingUser.length === 0) {
                            userlist.append(`<li class="user-list-item" data-user-id="${touserid}" data-user="${chatuser}"  data-authuserid="${authuserid}" data-profileimage="${profileImagePath}">
                                                        <a href="javascript:void(0);" class="p-2 border rounded d-block mb-2 userlist">
                                                            <div class="d-flex align-items-center">
                                                                <div class="avatar  avatar-lg avatar-online me-2 flex-shrink-0" id="useravatar"${touserid}>
                                                                    <img src="${profileImagePath || defaultImagePath}"
                                                                        class="rounded-circle" alt="image">
                                                                </div>
                                                                <div class="flex-grow-1 overflow-hidden me-2">
                                                                    <h6 class="mb-1 text-truncate">${chatuser}</h6>
                                                                    <p class="text-truncate msgbody msgbody${touserid}" data-user-id="${touserid}">${message1}</p>
                                                                </div>
                                                                <div class="flex-shrink-0 align-self-start text-end">
                                                                <div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </li>`);
                        }else{
                            const existingmsg = $('.msgbody'+touserid).find();
                            if (existingmsg.length === 0) {
                                $('.msgbody'+touserid).text(message1);
                            }
                        }
                        chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
                        var msg=response.message;
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                msg=langtst;
                                toastr.success(msg);
                            });
                        }else{
                            toastr.success(msg);
                        }
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(xhr) {
                    toastr.error('Failed to load message. Please try again.');
                }, complete: function() {
                    $('#message-loader').addClass('hidden');
                }
            });
        }
    });
    $(document).ready(function () {
        let page = 1;
        let isLoading = false;
        $('#chatsidebar').off('scroll').on('scroll', function () {
            const authuserid=$(this).data('authuserid');
            const wrapper = $(this);
             if (wrapper.scrollTop() + wrapper.innerHeight() >= wrapper[0].scrollHeight-1 && !isLoading) {
                isLoading = true;
                $('#message-loader').removeClass('hidden');
                $.ajax({
                    url: '/api/chat/getchatlist',
                    method: 'GET',
                    data: { page: page + 1,authuserid: authuserid },
                    success: function (response) {
                        if (response.data.data.length > 0) {
                            page++;
                            response.data.data.forEach(function (val) {
                                const html = `
                                    <li class="user-list-item mb-2" data-user-id="${val.user_id}" data-user="${val.user_name ?? val.username}" data-authuserid="${authuserid}" data-profileimage="${val.profile_image}">
                                        <a href="javascript:void(0);" class="p-2 border rounded d-block userlist">
                                            <div class="d-flex align-items-center">
                                                <div class="avatar avatar-lg avatar-online me-2 flex-shrink-0">
                                                    <img src="${getProfileImagePath(val.profile_image)}" alt="${val.user_name ?? 'User'}'s Profile Image"
                    class="img-fluid rounded-circle profileImagePreview" onerror="this.src='/front/img/profiles/avatar-01.jpg';">                                                    </div>
                                                <div class="flex-grow-1 overflow-hidden me-2">
                                                    <h6 class="mb-1 text-truncate">${val.user_name ?? val.username}</h6>
                                                    <p class="text-truncate msgbody">${val.last_message}</p>
                                                </div>
                                                <div class="flex-shrink-0 align-self-start text-end">
                                                        <small class="text-muted">${val.relative_time}</small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>`;
                                    $('.user-list').append(html);
                            });
                        }
                        $('#message-loader').addClass('hidden');
                        isLoading = false;
                    },
                    error: function () {
                        $('#message-loader').addClass('hidden');
                        isLoading = false;
                        alert('Failed to load more chats.');
                    },
                });
            }
        });

        const chatScroll = $('#chatscroll');
        chatScroll.on('scroll', function () {
            const authuserid=$(this).data('authuserid');
            // Check if the user scrolled to the top
            if (chatScroll.scrollTop() === 0 && !isLoading) {
                isLoading = true; // Mark loading in progress
                $('#message-loader').removeClass('hidden'); // Optional: Show a loading indicator
                var currentPath = window.location.pathname;
                $.ajax({
                    url: '/api/chat/load-old-messages', // Your API endpoint
                    method: 'GET',
                    data: {
                        page: page + 1, // Request the next page of data
                        to_user_id: $('.to_user_id').val(),
                        type: currentPath,
                        authuserid: authuserid
                    },
                    success: function (response) {
                        if (response.data.length > 0) {
                            page++; // Increment the page counter

                            // Prepend older messages to the chat window
                            response.data.forEach(function (val) {
                                const messageHtml = `
                                    <div class="message ${val.from_user_id === parseInt($('.auth_user_id').val()) ? 'outgoing' : 'incoming'}">
                                        <p>${val.content}</p>
                                    </div>`;
                                $('#chat-window').prepend(messageHtml);
                            });

                            // Adjust scroll position to maintain user context
                            chatScroll.scrollTop(1);
                        } else {
                            // Optional: Notify the user if no more messages
                            console.log('No more messages to load.');
                        }

                        $('#message-loader').addClass('hidden');
                        isLoading = false;
                    },
                    error: function () {
                        $('#message-loader').addClass('hidden');
                        isLoading = false;
                        alert('Failed to load older messages.');
                    },
                });
            }
        });

    });
    function getProfileImagePath(profileImage) {
        const defaultImagePath = '/front/img/profiles/avatar-01.jpg';
        return profileImage && profileImage !== 'N/A'
            ? `/storage/profile/${profileImage}`
            : defaultImagePath;
    }
       function performSearch() {
            const search = $('.chatsearch').val();
            if(search.length > 2){
                var currentPath = window.location.pathname;
                $.ajax({
                    url: "/api/chat/userlist",
                    type: "GET",
                    data: {
                        search: search,
                        route: currentPath
                    },
                    success: function (response) {
                        if (response.success) {
                            let users = response.data['users'];
                            let authuserid=response.data['authuserid'];
                            let output = '';
                            users.forEach(user => {
                                output += `<li class=" listdropdown-item userdatalist" data-authuserid="${authuserid}" data-id="${user.id}" data-user="${user.name}" data-profileimage="${user.profile_image}">${user.name} - ${user.email}</li>`;
                            });
                        if(users!=''){
                                $('.contact-list').html(output);
                        }else{
                                $('.contact-list').html('<li> No users found.</li>');
                        }
                        $('#user-dropdown').show();
                        } else {
                            $('.contact-list').html('<p>No users found.</p>');
                            $('#user-dropdown').hide();
                        }
                    },
                    error: function (xhr) {
                        toastr.error(xhr.responseText);
                        $('.contact-list').html('<p>An error occurred while fetching data.</p>');
                    }
                });
            }else{
				$('.contact-list').html('<li>Min. 3 characters required</li>');
				$('#user-dropdown').show();
			}
        }
        $('.chat_search').click(function () {$('#user-dropdown').hide();
			performSearch();
		});

		$('#chatSearchForm').on('keydown', function (e) {$('#user-dropdown').hide();
			if (e.key === 'Enter') {
				e.preventDefault();
				performSearch();
			}
		});
        $('.chatsearch').on('keyup',function(){
            $('#user-dropdown').hide();
        });
        $(document).on('click', '.userdatalist', function () {
            $('#user-dropdown').hide();
            $('.user-chat-search-row').hide();
            $('.user-chat-search-btn').removeClass('userchat');
            const userId = $(this).data('id');
            const userName = $(this).data('user');
            const authuserid=$(this).data('authuserid');
            const prfimage=$(this).data('profileimage');
            const defaultImagePath = '/assets/img/profiles/avatar-02.jpg';
            const profileImagePath = prfimage && prfimage !== 'N/A'
                        ? `/storage/profile/${prfimage}`
                        : defaultImagePath;
                $('.nomsg').hide();
                var chatstatus=$('.nochat').data('val');
                if(chatstatus==0){
                    $('.nochat').remove();
                    let chatContent = `
                    <div class="chat chat-messages card flex-fill" id="middle">
                        <div class="chat-header card-header">
                            <div class="user-details d-flex align-items-center">
                                <div class="d-lg-none">
                                    <ul class="list-inline mt-2 me-2">
                                        <li class="list-inline-item">
                                            <a class="text-muted px-0 left_sides" href="#" data-chat="open">
                                                <i class="fas fa-arrow-left"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div class="avatar avatar-lg me-2" id="chatimg" >`;
                                 chatContent += `<img src="${profileImagePath || defaultImagePath}" alt="Default Profile Image" class="img-fluid rounded-circle profileImagePreview">`;

                                chatContent += `</div>
                                <div>
                                    <h6 id="chat-user-name">${userName}</h6>
                                </div>
                            </div>
                        </div>
                        <div class="chat-body card-body chat-scroll slimscroll">
                            <div class="messages">
                                <div class="chats">
                                    <div id="chat-window" class="chat-content chatcontent Chat window chat-cont-type">

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chat-footer">
                            <form id="addmsgform">
                                <div class="chat-message">
                                    <input type="hidden" name="chatuser" class="chatuser" value="${userName}">
                                    <input type="hidden" class="profileimg" value="${prfimage}">
                                    <input type="hidden" name="auth_user_id" class="auth_user_id" value="${authuserid}">
                                    <input type="hidden" name="from_user_id" class="from_user_id" value="${authuserid}">
                                    <input type="hidden" name="to_user_id" class="to_user_id" value="${userId}">
                                    <input type="text" name="message" id="message" class="form-control message chat_form" placeholder="Type your message here...">
                                    <div class="form-buttons">
                                        <button class="btn send-btn" type="submit">
                                            <i class="bx bx-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                $(".parentdiv").append(chatContent);
                }
                $('#chat-user-name').text(userName);
                const chatimgDiv = $('#chatimg');
                if (chatimgDiv.length) {
                    const imgTag = `<img src="${profileImagePath || defaultImagePath}" alt="User Profile Image" class="img-fluid rounded-circle profileImagePreview">`;
                    chatimgDiv.html(imgTag);
                }
                $('.chatuser').val(userName);
                $('.from_user_id').val(authuserid);
                $('.to_user_id').val(userId);
                $('.chatsearch').val('');
                $('#chat-window').html('');
                $('.user-list-item').removeClass('active');
                const userlist=$('.user-list');
                const existingUser = userlist.find(`[data-user-id="${userId}"]`);
                if (existingUser.length === 0) {
                    var userhtml = `<li class="user-list-item active" data-user-id="${userId}" data-user="${userName}"  data-authuserid="${authuserid}" data-profileimage="${profileImagePath}">
                                                <a href="javascript:void(0);" class="p-2 border rounded d-block mb-2 userlist">
                                                    <div class="d-flex align-items-center">
                                                        <div class="avatar  avatar-lg avatar-online me-2 flex-shrink-0" id="useravatar${userId}">`;
                                    userhtml +=`<img src="${profileImagePath || defaultImagePath}"
                                                                class="rounded-circle" alt="image">`;
                                                     userhtml +=`</div>
                                                        <div class="flex-grow-1 overflow-hidden me-2">
                                                            <h6 class="mb-1 text-truncate">${userName}</h6>
                                                            <p class="text-truncate msgbody msgbody${userId}" data-user-id="${userId}"></p>
                                                        </div>
                                                        <div class="flex-shrink-0 align-self-start text-end">
                                                        <div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>`;
                                             userlist.append(userhtml);
                }
                const userAvatarDiv = document.getElementById('useravatar'+userId);
                if(userAvatarDiv){
                    const imgTag = `<img src="${profileImagePath || defaultImagePath}" alt="User Profile Image" class="img-fluid rounded-circle profileImagePreview">`;
                    userAvatarDiv.innerHTML = imgTag;
                }
        });
    });
}

//Page-Sections
if (pageValue === "admin.page-section") {
    function section_table() {
        fetchSection(1);
    }

    function fetchSection(page) {
        $.ajax({
            url: "/api/page-builder/section-list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {
                    const backgroundImage = response.data[0].background_image;
                    if (backgroundImage) {
                        $("#background_img").attr("src", backgroundImage);
                    } else {
                        $("#background_img")
                            .attr("src", "")
                            .attr("alt", "No image available");
                    }

                    const thumbnailImage = response.data[0].thumbnail_image;
                    if (thumbnailImage) {
                        $("#thumbnail_img").attr("src", thumbnailImage);
                    } else {
                        $("#thumbnail_img")
                            .attr("src", "")
                            .attr("alt", "No thumbnail available");
                    }
                    $("#datatable_section").DataTable().destroy();
                    populateSectionTable(response.data, response.meta);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    function populateSectionTable(Section, meta) {
        let tableBody = "";

        if (Section.length > 0) {
            Section.forEach((Section, index) => {
                tableBody += `
                    <tr>
                            <td>${index + 1}</td>
                            <td>${Section.name}</td>
                            <td>
                                <span class="badge ${
                                    Section.status == "1"
                                        ? "badge-soft-success"
                                        : "badge-soft-danger"
                                } d-inline-flex align-items-center">
                                    <i class="ti ti-circle-filled fs-5 me-1"></i>${
                                        Section.status == "1"
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>
                            </td>
                            ${ $('#has_permission').data('visible') == 1 ?
                            `<td>
                                <li style="list-style: none;">
                                    ${ $('#has_permission').data('edit') == 1 ?
                                    `<a class="section_data"
                                        href="#"
                                        data-bs-toggle="modal"
                                        data-bs-target="#add_banner_sec"
                                        data-id="${Section.id}"
                                        data-name="${Section.name}"
                                        data-title="${Section.title}"
                                        data-label="${Section.label}"
                                        data-show_search="${
                                            Section.show_search
                                        }"
                                        data-show_location="${
                                            Section.show_location
                                        }"
                                        data-popular_search="${
                                            Section.popular_search
                                        }"
                                        data-provider_count="${
                                            Section.provider_count
                                        }"
                                        data-services_count="${
                                            Section.services_count
                                        }"
                                        data-review_count="${
                                            Section.review_count
                                        }"
                                        data-background_image="${
                                            Section.background_image
                                        }"
                                        data-thumbnail_image="${
                                            Section.thumbnail_image
                                        }"
                                        data-category="${
                                            Section.category
                                        }"
                                        data-feature_category="${
                                            Section.feature_category
                                        }"
                                        data-popular_category="${
                                            Section.popular_category
                                        }"
                                        data-service="${Section.service}"
                                        data-feature_service="${
                                            Section.feature_service
                                        }"
                                        data-popular_service="${
                                            Section.popular_service
                                        }"
                                        data-product="${Section.product}"
                                        data-feature_product="${
                                            Section.feature_product
                                        }"
                                        data-popular_product="${
                                            Section.popular_product
                                        }"
                                        data-faq="${Section.faq}"
                                        data-service_package="${
                                            Section.service_package
                                        }"
                                        data-about_as="${
                                            Section.about_as
                                        }"
                                        data-testimonial="${
                                            Section.testimonial
                                        }"
                                        data-how_it_work="${
                                            Section.how_it_work
                                        }"
                                        data-blog="${Section.blog}">
                                        <i class="ti ti-pencil fs-20"></i>
                                    </a>` : ''
                                    }
                                    ${ $('#has_permission').data('delete') == 1 ?
                                        `<a class="delete" href="#" data-bs-toggle="modal" data-bs-target="#delete-modal" data-id="${
                                            Section.id
                                        }">
                                            <i class="ti ti-trash m-3 fs-20"></i>
                                        </a>` : ''
                                    }
                                </li>
                            </td>` : ''
                            }
                        </tr>
                    `;
            });
        } else {
            tableBody = `
                    <tr>
                        <td colspan="4" class="text-center">No Section found</td>
                    </tr>
                `;
        }

        $("#datatable_section tbody").html(tableBody);
        if (
            Section.length != 0 &&
            !$.fn.DataTable.isDataTable("#datatable_section")
        ) {
            $("#datatable_section").DataTable({
                ordering: true,
                language: datatableLang
            });
        }
    }

    $(document).on("click", ".section_data", function (e) {
        e.preventDefault();

        var ID = $(this).data("id");

        $(
            "#section_id_1, #section_id_2, #section_id_3, #section_id_4, #section_id_5, #section_id_6, #section_id_7, #section_id_8, #section_id_9, #section_id_10, #section_id_11, #section_id_12, #section_id_13, #section_id_14, #section_id_15, #section_id_16"
        ).hide();

        if (ID == 1) {
            $("#section_id_1").show();
            $("#section_id").val($(this).data("id"));
            $("#title").val($(this).data("title"));
            $("#label").val($(this).data("label"));
            $("#show_search").prop("checked", $(this).data("show_search") == 1);
            $("#show_location").prop(
                "checked",
                $(this).data("show_location") == 1
            );
            $("#popular_search").prop(
                "checked",
                $(this).data("popular_search") == 1
            );
            $("#provider_count").prop(
                "checked",
                $(this).data("provider_count") == 1
            );
            $("#services_count").prop(
                "checked",
                $(this).data("services_count") == 1
            );
            $("#review_count").prop(
                "checked",
                $(this).data("review_count") == 1
            );
        } else if (ID == 2) {
            $("#section_id_2").show();
            $("#section_id").val($(this).data("id"));
            $("#category").val($(this).data("category"));
        } else if (ID == 3) {
            $("#section_id_3").show();
            $("#section_id").val($(this).data("id"));
            $("#feature_category").val($(this).data("feature_category"));
        } else if (ID == 4) {
            $("#section_id_4").show();
            $("#section_id").val($(this).data("id"));
            $("#popular_category").val($(this).data("popular_category"));
        } else if (ID == 5) {
            $("#section_id_5").show();
            $("#section_id").val($(this).data("id"));
            $("#service").val($(this).data("service"));
        } else if (ID == 6) {
            $("#section_id_6").show();
            $("#section_id").val($(this).data("id"));
            $("#feature_service").val($(this).data("feature_service"));
        } else if (ID == 7) {
            $("#section_id_7").show();
            $("#section_id").val($(this).data("id"));
            $("#popular_service").val($(this).data("popular_service"));
        } else if (ID == 8) {
            $("#section_id_8").show();
            $("#section_id").val($(this).data("id"));
            $("#product").val($(this).data("product"));
        } else if (ID == 9) {
            $("#section_id_9").show();
            $("#section_id").val($(this).data("id"));
            $("#feature_product").val($(this).data("feature_product"));
        } else if (ID == 10) {
            $("#section_id_10").show();
            $("#section_id").val($(this).data("id"));
            $("#popular_product").val($(this).data("popular_product"));
        } else if (ID == 11) {
            $("#section_id_11").show();
            $("#section_id").val($(this).data("id"));
            $("#faq").val($(this).data("faq"));
        } else if (ID == 12) {
            $("#section_id_12").show();
            $("#section_id").val($(this).data("id"));
            $("#service_package").val($(this).data("service_package"));
        } else if (ID == 13) {
            $("#section_id_13").show();
            $("#section_id").val($(this).data("id"));
            $("#about_as").val($(this).data("about_as"));
        } else if (ID == 14) {
            $("#section_id_14").show();
            $("#section_id").val($(this).data("id"));
            $("#testimonial").val($(this).data("testimonial"));
        } else if (ID == 15) {
            $("#section_id_15").show();
            $("#section_id").val($(this).data("id"));
            $("#how_it_work").val($(this).data("how_it_work"));
        } else if (ID == 16) {
            $("#section_id_16").show();
            $("#section_id").val($(this).data("id"));
            $("#blog").val($(this).data("blog"));
        }
    });

    $(document).ready(function () {
        section_table();
    });

    $(document).ready(function () {
        $("#addBannerOneForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);
            formData.append(
                "show_search",
                $("#show_search").is(":checked") ? 1 : 0
            );
            formData.append(
                "show_location",
                $("#show_location").is(":checked") ? 1 : 0
            );
            formData.append(
                "popular_search",
                $("#popular_search").is(":checked") ? 1 : 0
            );
            formData.append(
                "provider_count",
                $("#provider_count").is(":checked") ? 1 : 0
            );
            formData.append(
                "services_count",
                $("#services_count").is(":checked") ? 1 : 0
            );
            formData.append(
                "review_count",
                $("#review_count").is(":checked") ? 1 : 0
            );

            $.ajax({
                url: "/api/page-builder/section-store",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".banner_one").attr("disabled", true);
                    $(".banner_one").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".banner_one").removeAttr("disabled");
                    $(".banner_one").html("update");
                    if (response.code === 200) {
                        $("#datatable_section").DataTable().destroy();
                        toastr.success(response.message);
                        section_table();
                        $("#add_banner_sec").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".banner_one").removeAttr("disabled");
                    $(".banner_one").html("update");

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    $(document).on("click", '.delete[data-bs-toggle="modal"]', function (e) {
        e.preventDefault();
        var secId = $(this).data("id");
        $("#confirmDeleteFaq").data("id", secId);
    });

    $(document).on("click", "#confirmDeleteFaq", function (e) {
        e.preventDefault();

        var secId = $(this).data("id");
        $.ajax({
            url: "/api/page-builder/delete",
            type: "POST",
            data: {
                id: secId,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            beforeSend: function () {
                $("#confirmDeleteFaq").attr("disabled", true);
                $("#confirmDeleteFaq").html(
                    '<div class="spinner-border text-light" role="status"></div>'
                );
            },

            success: function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    section_table();
                    $("#delete-modal").modal("hide");
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                toastr.error("An error occurred while trying to delete.");
            },
        });
    });

    document
        .getElementById("background_image")
        .addEventListener("change", function (event) {
            previewImage(event, "background_img");
        });

    document
        .getElementById("thumbnail_image")
        .addEventListener("change", function (event) {
            previewImage(event, "thumbnail_img");
        });

    function previewImage(event, imgId) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById(imgId).src = e.target.result;
            };
            reader.readAsDataURL(file); // Convert image to a base64 URL
        } else {
            // Reset the image preview if no file is selected
            document.getElementById(imgId).src = "";
        }
    }
}

//Pages-list
if (pageValue === "admin.page-builder") {
    function page_table() {
        fetchPage(1);
    }

    function fetchPage(page) {
        var langCode = $('body').data('lang');
        let currentLang = langCode;
        $.ajax({
            url: "/api/page-builder/page-builder-list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                sort_by: "id",
                language_code: currentLang,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {
                    populatePageTable(response.data, response.meta);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    function populatePageTable(Page, meta) {
        let tableBody = "";

        if (Page.length > 0) {
            Page.forEach((Page, index) => {
                tableBody += `
                    <tr>
                            <td>${index + 1}</td>
                            <td>${Page.page_title}</td>
                            <td>${Page.slug}</td>
                            <td>
                                <span class="badge ${
                                    Page.status == "1"
                                        ? "badge-soft-success"
                                        : "badge-soft-danger"
                                } d-inline-flex align-items-center">
                                    <i class="ti ti-circle-filled fs-5 me-1"></i>${
                                        Page.status == "1"
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>
                            </td>
                            ${ $('#has_permission').data('visible') == 1 ?
                            `<td>
                                ${ $('#has_permission').data('edit') == 1 ?
                                `<li style="list-style: none;">
                                    <a href="javascript:void(0);" onclick="editPage('${
                                        Page.slug
                                    }')">
                                        <i class="ti ti-pencil fs-20"></i>
                                    </a>
                                </li>` : ''
                                }
                            </td>` : ''
                            }
                        </tr>
                    `;
            });
        } else {
            tableBody = `
                    <tr>
                        <td colspan="5" class="text-center">No Section found</td>
                    </tr>
                `;
        }

        $("#datatable_page tbody").html(tableBody);
        if (
            Page.length != 0 &&
            !$.fn.DataTable.isDataTable("#datatable_page")
        ) {
            $("#datatable_page").DataTable({
                ordering: true,
                language: datatableLang
            });
        }
    }

    function editPage(slug) {
        window.open(`/admin/content/edit/page-builder?slug=${slug}`, "_self");
    }

    function fetchPageDetails(id) {
        $.ajax({
            url: `/api/page-builder/get-page-details/${id}`,
            type: "GET",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {
                    populateEditForm(response.data);
                }
            },
            error: function (error) {
                toastr.error(
                    "An error occurred while fetching the page details."
                );
            },
        });
    }

    $(document).ready(function () {
        page_table();
    });
}

//Add Page Builder
if (pageValue === "admin.add_page_builder") {
    $(document).ready(function () {
        fetchSection(1);
    });

    function fetchSection(page) {
        $.ajax({
            url: "/api/page-builder/section-list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {
                    var data = response.data;
                    var sectionHtml = "";
                    var count = 0;

                    // Open the first row
                    sectionHtml += '<div class="row">';

                    // Statically add a card with key "Banner One" and value "[banner]"
                    sectionHtml += `
                        <div class="col-md-6">
                            <div class="card p-2 draggable-card" draggable="true" data-value="[banner]">
                                <div class="card-body p-0">
                                    <p class="fs-12">Banner One</p>
                                </div>
                            </div>
                        </div>
                    `;

                    // Generate cards dynamically based on the response data
                    $.each(response.data, function (index, section) {
                        if (section.name === "Banner One") return;
                        $.each(section, function (key, value) {
                            if (
                                key !== "id" &&
                                key !== "name" &&
                                key !== "status"
                            ) {
                                // Add a new row only after every 2 cards
                                if (count % 12 === 0 && count !== 0) {
                                    sectionHtml += '</div><div class="row">';
                                }

                                // Add a card
                                sectionHtml += `
                                    <div class="col-md-6">
                                        <div class="card p-2 draggable-card" draggable="true" data-value="${value}">
                                            <div class="card-body p-0">
                                                <p class="fs-12">${section.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                `;

                                count++;
                            }
                        });
                    });

                    // Close the last row if needed
                    sectionHtml += '</div>';

                    // Update the card container
                    $("#cardContainer").html(sectionHtml);
                }
            },


            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    $(document).on("dragstart", ".draggable-card", function (event) {
        event.originalEvent.dataTransfer.setData(
            "text/plain",
            $(this).data("value")
        );
    });

    function initializeSummernote() {
        $(".summer").summernote({
            height: 150,
            width: "100%",
            toolbar: [
                ["style", ["style"]],
                [
                    "font",
                    [
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "superscript",
                        "subscript",
                        "clear",
                    ],
                ],
                ["fontname", ["fontname"]],
                ["fontsize", ["fontsize"]],
                ["color", ["color"]],
                ["para", ["ul", "ol", "paragraph"]],
                ["height", ["height"]],
                ["table", ["table"]],
                ["insert", ["link", "picture", "video"]],
                ["view", ["fullscreen", "codeview", "help"]],
            ],
            callbacks: {
                onDrop: function (event) {
                    event.preventDefault();
                    var data =
                        event.originalEvent.dataTransfer.getData("text/plain");
                    if (data) {
                        $(this).summernote("pasteHTML", data);
                    }
                },
            },
        });
    }

    $(document).ready(function () {
        initializeSummernote();

        $("#addTextarea").on("click", function () {
            const uniqueId = `status_${Date.now()}`;

            const textareaTemplate = `

            <div class="textarea-item border border-1 border-light px-2 mb-2 mt-2">
                <div class="d-flex justify-content-end gap-4 m-1">
                    <div class="">
                        <div class="status-title">
                                <h5>${$('.textareasContainer').data('status')}</h5>
                            </div>
                            <div class="status-toggle modal-status mt-1">
                                <input type="checkbox" name="page_status[]" id="${uniqueId}" value="1" class="check user8" checked>
                                <label for="${uniqueId}" class="checktoggle"></label>
                            </div>
                    </div>
                    <a class="removeTextarea mt-2"><i class="ti ti-trash m-3 fs-24 fw-bold"></i></a>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">${$('.textareasContainer').data('section_title')}</label>
                            <input type="text" class="form-control" id="section_title" name="section_title[]" placeholder="${$('.textareasContainer').data('section_title_placeholder')}">
                            <span class="invalid-feedback" id="section_title_error"></span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">${$('.textareasContainer').data('section_label')}</label>
                            <input type="text" class="form-control" id="section_label" name="section_label[]" placeholder="${$('.textareasContainer').data('section_label_placeholder')}">
                            <span class="invalid-feedback" id="section_label_error"></span>
                        </div>
                    </div>
                </div>
                <textarea type="text" name="page_content[]" class="form-control page_content summer" id="summernote" placeholder="${$('.textareasContainer').data('enter_page_content')}"></textarea>
            </div>
        `;

            $(".textareasContainer").append(textareaTemplate);
            initializeSummernote();
        });

        $(".textareasContainer").on("click", ".removeTextarea", function () {
            $(this).closest(".textarea-item").remove();
        });
    });

    $(document).ready(function () {
        $("#addPageBuilderForm").submit(function (event) {
            event.preventDefault();

            var langCode = $('body').data('lang');
            let currentLang = langCode;
            var formData = new FormData(this);
            formData.append("status", $("#status").is(":checked") ? 1 : 0);
            formData.append("currentLang", currentLang); // Adding currentLang to formData

            $.ajax({
                url: "/api/page-builder/page-builder-store",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".btn_page").attr("disabled", true);
                    $(".btn_page").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".btn_page").removeAttr("disabled");
                    const updateText =
                        document.getElementById("add_btn_page").dataset
                            .updateText;
                    document.getElementById("add_btn_page").innerText =
                        updateText;
                    if (response.code === 200) {
                        $("#addPageBuilderForm")[0].reset();
                        $(".textareasContainer").html("");
                        toastr.success($('#add_btn_page').data('create-success'));
                    } else {
                        toastr.error($('#add_btn_page').data('create-success'));
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".btn_page").removeAttr("disabled");
                    const updateText =
                        document.getElementById("add_btn_page").dataset
                            .updateText;
                    document.getElementById("add_btn_page").innerText =
                        updateText;
                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });
}

//Edit Home Page
if (pageValue === "admin.edit_page_builder") {

    $(document).ready(function () {
        $("#aboutUsSummernote").summernote({
            height: 500,
            placeholder: "Enter About Us",
        });

        $("#termsConditionsSummernote").summernote({
            height: 500,
            placeholder: "Enter Terms and Conditions",
        });

        $("#privacyPolicySummernote").summernote({
            height: 500,
            placeholder: "Enter Privacy Policy",
        });

        $("#contactUsSummernote").summernote({
            height: 500,
            placeholder: "Enter Cotntact Us",
        });
        let pageSlug = getQueryParam("slug");

        fetchPageDetails($('#language_id').val(), pageSlug);

    });

    function setLanguageId() {
        const selectedLanguageId = document.getElementById('language_id').value;

        document.getElementById('language_id_input').value = selectedLanguageId;
    }

    function getQueryParam(param) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function fetchPageDetails(langId, slug, editId, editParentId) {
        $.ajax({
            url: `/api/page-builder/get-page-details/${slug}`,
            type: "GET",
            data: {
                language_id: langId,
                id: editId,
                parent_id: editParentId
             },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    var data = response.data;

                    $("#id").val(data.id);
                    $("#parent_id").val(data.parent_id);
                    $("#edit_slug").val(data.slug);
                    $("#page_title").val(data.page_title);
                    $("#lang_id").val(data.language_id);
                    $("#slug").val(
                        data.slug
                    );
                    if (data.about_us && data.about_us.trim() !== "") {
                        $(".about_us").summernote("code", data.about_us);
                        $("#aboutUsContainer").show();
                    } else {
                        $("#aboutUsContainer").hide();
                    }
                    if (data.terms_conditions && data.terms_conditions.trim() !== "") {
                        $(".terms_conditions").summernote("code", data.terms_conditions);
                        $("#termsConditionsContainer").show();
                    } else {
                        $("#termsConditionsContainer").hide();
                    }
                    if (data.privacy_policy && data.privacy_policy.trim() !== "") {
                        $(".privacy_policy").summernote("code", data.privacy_policy);
                        $("#privacyPolicyContainer").show();
                    } else {
                        $("#privacyPolicyContainer").hide();
                    }
                    if (data.contact_us && data.contact_us.trim() !== "") {
                        $(".contact_us").summernote("code", data.contact_us);
                        $("#contactUsContainer").show();
                    } else {
                        $("#contactUsContainer").hide();
                    }
                    $("#seo_title").val(data.seo_title);
                    $("#tag").tagsinput("removeAll");
                    var tagsArray = data.seo_tag
                        .split(",")
                        .map((tag) => tag.trim()); // Trim any whitespace
                    tagsArray.forEach((tag) => $("#tag").tagsinput("add", tag));
                    $("#seo_description").val(data.seo_description);
                    $("#status").prop("checked", data.status === 1);

                    $(".textareasContainer").empty();

                    if (data.page_content && data.page_content.trim() !== "") {
                        var pageContentArray = JSON.parse(data.page_content);

                        let count = 1;

                        let summernoteId = "";

                        pageContentArray.forEach(function (section) {
                            const uniqueId = Date.now();
                            const textareaTemplate = `
                                <div class="textarea-item border border-1 border-li px-2 mb-2">
                                    <div class="d-flex justify-content-end gap-2 m-1">
                                        <div class="m-1 p-1">
                                            <div class="status-title">
                                                <h5 class="status">Status</h5>
                                            </div>
                                            <div class="status-toggle modal-status mt-1">
                                                <input type="checkbox" name="page_status[]" id="status_${uniqueId}" value="1" ${
                                                    section.status === 1 ? "checked" : ""
                                                } class="check user8">
                                                <label for="status_${uniqueId}" class="checktoggle"></label>
                                            </div>
                                        </div>
                                        <a class="removeTextarea mt-3 text-danger"><i class="ti ti-trash m-2 fw-bold fs-24"></i></a>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label section_title">Section Title</label>
                                                <input type="text" class="form-control enter_section_title" id="section_title" value="${
                                                    section.section_title
                                                }" name="section_title[]" placeholder="Enter Section Title">
                                                <span class="invalid-feedback" id="section_title_error"></span>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label section_label">Section Label</label>
                                                <input type="text" class="form-control section_label_placeholder" id="section_label" value="${
                                                    section.section_label
                                                }" name="section_label[]" placeholder="Enter Section label">
                                                <span class="invalid-feedback" id="section_label_error"></span>
                                            </div>
                                        </div>
                                    </div>
                                    <textarea type="text" name="page_content[]" class="form-control page_content summer" id="summernote_${count}"></textarea>
                                </div>
                            `;


                            $(".textareasContainer").append(textareaTemplate);
                            initializeSummernote();
                            summernoteId = `#summernote_${count++}`;
                            $(summernoteId).summernote(
                                "code",
                                section.section_content
                            );
                        });
                    }
                } else {
                    $('#editPageBuilderForm')[0].reset();
                    $(".textareasContainer").empty();

                }
            },

            error: function (error) {
                $(".textareasContainer").empty();
                $('input[data-role="tagsinput"]').tagsinput('removeAll');
                $('.form-control').removeClass('is-invalid').removeClass('is-valid');
                $('.invalid-feedback').text('');
                $('#page_title').val('');
                $('#slug').val('');
                $('#aboutUsSummernote').val('');
                $('#seo_title').val('');
                $('#seo_description').val('');
            },
        });
    }

    $('#language_id').on('change', function() {
        var langId = $(this).val();
        var slug = $('#edit_slug').val();
        var editId = $('#id').val();
        var editParentId = $('#parent_id').val();
        document.getElementById('language_id_input').value = langId;

        fetchPageDetails(langId, slug, editId, editParentId);
        languageTranslate(langId);
    });


    function languageTranslate(lang_id) {
        $.ajax({
            url: "/api/translate",
            type: "POST",
            dataType: "json",
            data: {
                language_id: lang_id,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                const trans = response.translated_values;
                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid is-valid");

                if (response.code === 200 && Object.keys(trans).length > 0) {

                    $('.dashboard').text(trans.dashboard);
                    $('.lang_title').text(trans.available_translations);
                    $('.seo_tags_label').text(trans.seo_tags_label);
                    $('.seo_tags_placeholder').text(trans.seo_tags_placeholder);
                    $('.seo_title_label').text(trans.seo_title_label);
                    $('.seo_title_placeholder').text(trans.seo_title_placeholder);
                    $('.seo_description_label').text(trans.seo_description_label);
                    $('.seo_description_placeholder').text(trans.seo_description_placeholder);
                    $('.status_toggle_label').text(trans.status_toggle_label);
                    $('.status_toggle_description').text(trans.status_toggle_description);
                    $('.page_title_label').text(trans.page_title_label);
                    $('.page_title_placeholder').text(trans.page_title_placeholder);
                    $('.slug_label').text(trans.slug_label);
                    $('.slug_placeholder').text(trans.slug_placeholder);
                    $('.status').text(trans.status);
                    $('.section_title').text(trans.section_title);
                    $('.section_label').text(trans.section_label);
                    $('.section_label_placeholder').text(trans.section_label_placeholder);
                    $('.status').text(trans.status);
                    $('.about_us_label').text(trans.about_us_label);
                    $('.contact_us_label').text(trans.contact_us_label);
                    $('.privacy_policy_label').text(trans.privacy_policy_label);
                    $('.terms_conditions_label').text(trans.terms_conditions_label);
                    $('.add_section').text(trans.add_section);
                }

            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }

    $(document).ready(function () {
        fetchSection(1);
    });

    function fetchSection(page) {
        $.ajax({
            url: "/api/page-builder/section-list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === "200") {
                    var data = response.data;
                    var sectionHtml = "";
                    var count = 0;

                    // Open the first row
                    sectionHtml += '<div class="row">';

                    // Statically add a card with key "Banner One" and value "[banner]"
                    sectionHtml += `
                        <div class="col-md-6">
                            <div class="card p-2 draggable-card" draggable="true" data-value="[banner]">
                                <div class="card-body p-0">
                                    <p class="fs-12">Banner One</p>
                                </div>
                            </div>
                        </div>
                    `;

                    // Generate cards dynamically based on the response data
                    $.each(response.data, function (index, section) {
                        if (section.name === "Banner One") return;
                        $.each(section, function (key, value) {
                            if (
                                key !== "id" &&
                                key !== "name" &&
                                key !== "status"
                            ) {
                                // Add a new row only after every 2 cards
                                if (count % 12 === 0 && count !== 0) {
                                    sectionHtml += '</div><div class="row">';
                                }

                                // Add a card
                                sectionHtml += `
                                    <div class="col-md-6">
                                        <div class="card p-2 draggable-card" draggable="true" data-value="${value}">
                                            <div class="card-body p-0">
                                                <p class="fs-12">${section.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                `;

                                count++;
                            }
                        });
                    });

                    // Close the last row if needed
                    sectionHtml += '</div>';

                    // Update the card container
                    $("#cardContainer").html(sectionHtml);
                }

            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    $(document).on("dragstart", ".draggable-card", function (event) {
        event.originalEvent.dataTransfer.setData(
            "text/plain",
            $(this).data("value")
        );
    });

    function initializeSummernote() {
        $(".summer").summernote({
            height: 100,
            width: "100%",
            toolbar: [
                ["style", ["style"]],
                [
                    "font",
                    [
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "superscript",
                        "subscript",
                        "clear",
                    ],
                ],
                ["fontname", ["fontname"]],
                ["fontsize", ["fontsize"]],
                ["color", ["color"]],
                ["para", ["ul", "ol", "paragraph"]],
                ["height", ["height"]],
                ["table", ["table"]],
                ["insert", ["link", "picture", "video"]],
                ["view", ["fullscreen", "codeview", "help"]],
            ],
            callbacks: {
                onDrop: function (event) {
                    event.preventDefault();
                    var data =
                        event.originalEvent.dataTransfer.getData("text/plain");
                    if (data) {
                        $(this).summernote("pasteHTML", data);
                    }
                },
            },
        });
    }

    $(document).ready(function () {
        initializeSummernote();

        $("#addTextarea").on("click", function () {
            const uniqueId = `status_${Date.now()}`;

            const textareaTemplate = `
            <div class="textarea-item border border-1 border-dark px-2 mb-2">
                <div class="d-flex justify-content-end gap-4 m-1">
                    <div class="">
                        <div class="status-title">
                                <h5>${$('.textareasContainer').data('status')}</h5>
                            </div>
                            <div class="status-toggle modal-status mt-1">
                                <input type="checkbox" name="page_status[]" id="${uniqueId}" value="1" class="check user8" checked>
                                <label for="${uniqueId}" class="checktoggle"></label>
                            </div>
                    </div>
                    <a class="removeTextarea mt-2"><i class="ti ti-trash m-3 fs-24 fw-bold"></i></a>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">${$('.textareasContainer').data('section_title')}</label>
                            <input type="text" class="form-control" id="section_title" name="section_title[]" placeholder="${$('.textareasContainer').data('section_title_placeholder')}">
                            <span class="invalid-feedback" id="section_title_error"></span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">${$('.textareasContainer').data('section_label')}</label>
                            <input type="text" class="form-control" id="section_label" name="section_label[]" placeholder="${$('.textareasContainer').data('section_label_placeholder')}">
                            <span class="invalid-feedback" id="section_label_error"></span>
                        </div>
                    </div>
                </div>
                <textarea type="text" name="page_content[]" class="form-control page_content summer" placeholder="${$('.textareasContainer').data('enter_page_content')}"></textarea>
            </div>
        `;

            $(".textareasContainer").append(textareaTemplate);
            initializeSummernote();
        });

        $(".textareasContainer").on("click", ".removeTextarea", function () {
            $(this).closest(".textarea-item").remove();
        });
    });

    $(document).ready(function () {
        $("#editPageBuilderForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);
            formData.append("status", $("#status").is(":checked") ? 1 : 0);
            formData.append('lang_id', $('#lang_id').val());
            formData.append('edit_slug', $('#edit_slug').val());

            $.ajax({
                url: "/api/page-builder/page-builder-update",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".edit_btn_page").attr("disabled", true);
                    $(".edit_btn_page").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".edit_btn_page").removeAttr("disabled");
                    const updateText =
                        document.getElementById("edit_btn_page").dataset
                            .updateText;
                    document.getElementById("edit_btn_page").innerText =
                        updateText;
                    if (response.code === 200) {
                        toastr.success($('#edit_btn_page').data('update-success'));
                    } else {
                        toastr.error($('#edit_btn_page').data('update-success'));
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".edit_btn_page").removeAttr("disabled");
                    const updateText =
                        document.getElementById("edit_btn_page").dataset
                            .updateText;
                    document.getElementById("edit_btn_page").innerText =
                        updateText;
                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });
}

if (pageValue === 'content.menu-builder') {

    $('#nestable').nestable({
        maxDepth: 3
      }).on('change', updateOutput);

    var menu_name_required = "Menu name is required.";
    var menu_name_exists = "Menu name already exists.";
    var url_required = "URL is required.";
    var url_exists = "URL already exists.";
    var menu_exists = "Menu already added."

    $(document).on('click', '.add_built_menu', function() {
        var name = $(this).data('title');
        var url = $(this).data('url');
        var target = '_self';
        var page_id = $(this).data('page_id');
        $('#method').val('add');

        if (menuNameExists(name)) {
            toastr.error(menu_exists);
        } else {
            addToMenu(menu_id = '', name, url, target, page_id);
        }
    });

    $("#name").on("keyup", function () {
        var givenName = $(this).val();
        var method = $('#method').val();
        var currentName = currentEditName.text();
        validateName(givenName, method, currentName);
    });

    $("#url").on("keyup", function () {
        var givenURL = $(this).val();
        var method = $('#method').val();
        var currentURL = currentEditURL.val();
        validateURL(givenURL, method, currentURL);
    });

    function menuNameExists(givenName, method, currentName) {
        let namesArray = [];
        let name;
        $('.dd-item').each(function() {
            name = $(this).data('name');
            namesArray.push(name.toLowerCase());
        });

        if (method === "update" && currentName) {
            namesArray = namesArray.filter(n => n !== currentName.toLowerCase());
        }

        return namesArray.includes(givenName.toLowerCase()) ? 1 : 0;
    }

    function menuURLExists(givenURL, method, currentURL) {
        let urlArray = [];
        let url;
        givenURL = givenURL.replace(/\s+/g, '-').toLowerCase();

        $('.dd-item').each(function () {
            url = $(this).data('url');
            if (url) {
                urlArray.push(url.replace(/\s+/g, '-').toLowerCase());
            }
        });

        if (method === "update" && currentURL) {
            currentURL = currentURL.replace(/\s+/g, '-').toLowerCase();
            urlArray = urlArray.filter(n => n !== currentURL);
        }

        return urlArray.includes(givenURL) ? 1 : 0;
    }

    function validateName(givenName, method = '', currentName = '') {
        const name = $("#name").val().trim();
        if (!name) {
            $("#name_error").text(menu_name_required);
            $('#name').addClass('is-invalid').removeClass('is-valid');
            return false;
        } else if(menuNameExists(givenName, method, currentName)) {
            $("#name_error").text(menu_name_exists);
            $('#name').addClass('is-invalid').removeClass('is-valid');
            return false;
        }
        else {
            $("#name_error").text("");
            $('#name').removeClass('is-invalid').addClass('is-valid');
            return true;
        }
    }

    function validateURL(givenURL, method = '', currentURL = '') {
        const url = $("#url").val().trim();
        if (!url) {
            $("#url_error").text(url_required);
            $('#url').addClass('is-invalid').removeClass('is-valid');
            return false;
        } else if(menuURLExists(givenURL, method, currentURL)) {
            $("#url_error").text(url_exists);
            $('#url').addClass('is-invalid').removeClass('is-valid');
            return false;
        }
        else {
            $("#url_error").text("");
            $('#url').removeClass('is-invalid').addClass('is-valid');
            return true;
        }
    }

    $(document).ready(function() {
        var langCode = $('body').data('lang');

        getBuiltMenus('', langCode);
        listWebsiteMenus('', langCode);
    });

    function getBuiltMenus(langId = '', langCode = '') {
        $.ajax({
            url: "/api/content/menu-builder/get-built-in-menus",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                language_id: langId,
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    var menus = response.data;

                    menus.forEach((menu, index) => {
                        $('.built_in_menus').append(`
                            <div class="card mb-2">
                                <div class="card-header justify-content-between d-flex flex-wrap">
                                    <div class="d-flex w-100 align-items-center">
                                        <div class="me-auto">
                                            <h6 class="text-left">${menu.page_title}</h6>
                                        </div>
                                        <div class="ms-auto">
                                            ${ $('#has_permission').data('create') == 1 ?
                                            `<button class="btn btn-primary btn-sm add_built_menu" data-page_id="${menu.id}" data-title="${menu.page_title}" data-url="${menu.slug}">
                                                <i class="ti ti-plus"></i>
                                            </button>` : ''
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                }
            },
            error: function (error) {
                if (error.responseJSON.code === 500) {
                    toastr.error(error.responseJSON.message);
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    var menuCount = 1;
    function getMenuData($element, processedItems = new Set()) {
        const items = [];

        $element.children('.dd-item').each(function () {
            const $item = $(this);
            const itemId = $item.data('id');

            if (processedItems.has(itemId)) return;

            processedItems.add(itemId);

            const itemData = {
                id: menuCount++,
                name: $item.data('name'),
                url: $item.data('url').replace(/\s+/g, '-').toLowerCase(),
                target: $item.data('target'),
                page_id: $item.data('page_id'),
                custom: $item.data('custom'),
                submenus: []
            };

            const $subMenu = $item.children('.dd-list');
            if ($subMenu.length > 0) {
                itemData.submenus = getMenuData($subMenu, processedItems);
            }

            items.push(itemData);
        });

        return items;
    }

    $(document).on('click', '#save_all_menus', function() {
        menuCount = 1;
        const menuData = getMenuData($('#nestable .dd-list'));
        const jsonData = JSON.stringify(menuData);
        var id = $(this).data('id');
        var saveBtn = 'save_all_menus';

        saveAllMenus(id, jsonData, saveBtn);
    });

    function saveAllMenus(id, jsonData, saveBtn = '') {
        $.ajax({
            url: "/api/content/menu-builder/save-menus",
            type: "POST",
            dataType: "json",
            data: {
                id: id,
                language_id: $('#language_id').val(),
                menus: jsonData,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            beforeSend: function () {
                if (saveBtn == 'save_all_menus') {
                    $("#save_all_menus").attr("disabled", true);
                    $("#save_all_menus").html(
                        '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                    );
                }
            },
            success: function (response) {
                $("#save_all_menus").removeAttr("disabled");
                $('#save_all_menus').html(lg_save);
                $('.dd-list').children().remove();
                if (response.code === 200) {
                    toastr.success(response.message);
                    $("#nestable").nestable('destroy').nestable();
                    var langId = $('#language_id').val();
                    listWebsiteMenus(langId);
                }
            },
            error: function (error) {
                $("#save_all_menus").removeAttr("disabled");
                $('#save_all_menus').html(lg_save);
                if (error.code === 500) {
                    toastr.error(error.message);
                } else {
                    toastr.error("An error occurred while saving.");
                }
            }
        });
    }

    function listWebsiteMenus(langId = '', langCode = '') {
        $.ajax({
            url: "/api/content/menu-builder/list-website-menus",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                language_id: langId,
                language_code: langCode
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    $('#save_all_menus').attr('data-id', response.data.id);
                    const menus = response.data.menus;
                    renderMenus(menus);
                }
            },
            error: function (error) {
                if (error.responseJSON && error.responseJSON.code === 500) {
                    toastr.error(error.responseJSON.message);
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    function renderMenus(menuItems) {
        menuItems.forEach(item => {
            addToMenu(item.id, item.name, item.url, item.target, item.page_id, item.custom);

            if (item.submenus && item.submenus.length > 0) {
                renderSubmenus(item.id, item.submenus);
            }
        });
    }

    function renderSubmenus(parentId, submenus) {
        submenus.forEach(submenu => {
            const submenuHTML = `
                <li class="dd-item"
                    data-id="${submenu.id}"
                    data-name="${submenu.name}"
                    data-url="${submenu.url}"
                    data-target="${submenu.target}"
                    data-page_id="${submenu.page_id}"
                    data-custom="${submenu.custom}"
                    data-new="1"
                    data-deleted="0">
                    <div class="dd-handle">${submenu.name}</div>
                    ${ $('#has_permission').data('edit') == 1 ?
                    `<span class="button-edit btn btn-info btn-sm pull-right" data-owner-id="${submenu.id}">
                        <i class="ti ti-pencil" aria-hidden="true"></i>
                    </span>` : '' }
                    ${ $('#has_permission').data('delete') == 1 ?
                    `<span class="button-delete btn btn-danger btn-sm pull-right" data-owner-id="${submenu.id}">
                        <i class="ti ti-trash" aria-hidden="true"></i>
                    </span>` : '' }
                </li>
            `;

            let parentItem = $(`[data-id="${parentId}"]`);
            let nestedList = parentItem.children("ol.dd-list");
            if (!nestedList.length) {
                nestedList = $('<ol class="dd-list"></ol>');
                parentItem.append(nestedList);

                if (!parentItem.find('.dd-collapse-btn').length) {
                    parentItem.prepend(`
                        <button class="dd-collapse-btn" data-action="collapse"></button>
                        <button class="dd-collapse-btn" data-action="expand" style="display: none;"></button>
                    `);

                    parentItem.find('[data-action="collapse"]').on("click", function () {
                        nestedList.hide();
                        $(this).hide();
                    });

                    parentItem.find('[data-action="expand"]').on("click", function () {
                        nestedList.show();
                        $(this).hide();
                    });
                }
            }

            nestedList.append(submenuHTML);

            if (submenu.submenus && submenu.submenus.length > 0) {
                renderSubmenus(submenu.id, submenu.submenus);
            }
        });

        updateOutput($('#nestable').data('output', $('#json-output')));
        $('#menuBuilderForm').trigger('reset');

        $("#nestable .button-delete").on("click", deleteFromMenu);
        $("#nestable .button-edit").on("click", prepareEdit);
    }

    $('#language_id').on('change', function() {
        var langId = $(this).val();
        var id = $('#id').val();

        $('.built_in_menus').empty();

        languageTranslate(langId);
        $("#nestable").nestable('destroy').nestable();
        $('.dd-list').empty();
        listWebsiteMenus(langId);
        getBuiltMenus(langId);

    });

    function languageTranslate(lang_id) {
        $.ajax({
            url: "/api/translate",
            type: "POST",
            dataType: "json",
            data: {
                language_id: lang_id,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                const trans = response.translated_values;

                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid is-valid");

                if (response.code === 200 && Object.keys(trans).length > 0) {

                    $('label[for="name"]').html(`${trans.name}<span class="text-danger"> *</span>`);
                    $('label[for="href"]').html(`${trans.url}<span class="text-danger"> *</span>`);
                    $('label[for="target"]').html(`${trans.target}<span class="text-danger"> *</span>`);

                    $('#name').attr('placeholder', trans.enter_menu_name);
                    $('#url').attr('placeholder', trans.enter_menu_url);
                    $('#updateBtn').text(trans.Save);
                    $('#addNewBtn').text(trans.add);
                    $('#save_all_menus').text(trans.Save);
                    $('.lang_title').text(trans.available_translations);
                    lg_save = trans.Save;

                    $('#target').empty();
                    $('#target').append(`
                       <option value="_self">${trans.self}</option>
                        <option value="_blank">${trans.blank}</option>
                    `);

                    $('.translate').each(function () {
                        var translateKey = $(this).data('translate');
                        if (trans.hasOwnProperty(translateKey)) {
                            var translatedText = trans[translateKey];
                            $(this).text(translatedText);
                        }
                    });

                    menu_name_required = trans.menu_name_required;
                    menu_name_exists = trans.menu_name_exists;
                    url_required = trans.url_required;
                    url_exists = trans.url_exists;
                    menu_exists = trans.menu_exists;

                }

            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }


}

if (pageValue === 'admin.addproduct' || pageValue === 'admin.addservice') {

    $('#generalTab a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    async function init() {
        await loadcategory();
      //  await loadbrands();
       // await loadvariation();

    }

    init().catch((error) => {
        toastr.error('Error during initialization:', error);
    });
    function loadcountrysec(val)
    {
        $( "#"+val ).show();

    }
    function loadslotstime(val)
    {
        $( "#"+val ).show();

    }

    function loadslots(val)
    {
        $( "#"+val ).show();
        $( "#mon_slot" ).show();
        $( "#tue_slot" ).show();
        $( "#wed_slot" ).show();
        $( "#thu_slot" ).show();
        $( "#fri_slot" ).show();
        $( "#sat_slot" ).show();
        $( "#sun_slot" ).show();


    }
    async function loadvariation() {

        //  document.getElementById("category_fied").innerHTML = "new content!"
          const response = await $.ajax({
              url: '/api/products/variationlistall',
              type: 'POST',
              data: {
                  'order_by': 'asc',
                  'count_per_page' : 10,
                  'sort_by' : '',
                  'search' : ''
              },
              headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                  'Accept': 'application/json'
              }
          });

          if (response.code == 200) {
              if(Array.isArray(response.data)) {
                  var currency_data = response.data;
                  var currency_table_body = $('#variation_fied');
                  var response_data;
                  currency_table_body.empty();

                  $.each(currency_data, (index,val) => {
                      response_data = `<div class="checkbox" ><label><input id="cc${val.id}" onclick="loadvarvalues(${val.id})" name="variation[]" type="checkbox" value="${val.id}" name="checkbox"> ${val.variation_name}</label></div><div id="var${val.id}" class="checkbox" style="padding-left: 15px;"></div>`;
                      currency_table_body.append(response_data);
                  });
                //  currency_table_body.append("</select>");

              }
          } else {
              toastr.error('Error fetching settings:', response.message);
          }



      }
      function loadsubcategory(val) {
        var formData = {
            'id': val,
        };
        $.ajax({
            url: '/api/products/categorylist',
            type: 'POST',
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
              //  alert("Here1");

                if (response.code == 200) {
                    //alert("Here2");
                  //  $('#Add_product').modal('hide');
                    //loadProducts();
                    //toastr.success(response.message);
                    var currency_data = response.data;
                    var currency_table_body = $('#Subcategory_fied');
                    var response_data;
                    currency_table_body.empty();
                    currency_table_body.append("<option value='' >Select</option>");

                    $.each(currency_data, (index,val) => {
                        response_data = `<option value="${val.id}">${val.name}</option>`;
                        currency_table_body.append(response_data);
                    });

                } else {
                    //alert("Here3");

                    // alert('Error: ' + response.message);
                  //  toastr.error(response.message);
                }
            },
            error: function(xhr) {
                alert('Failed to set default language. Please try again.');
            }
        });
     }
      async function loadcategory() {

        //  document.getElementById("category_fied").innerHTML = "new content!"
        if (pageValue === 'admin.addservice') {
            var souce='service';
        }
        if (pageValue === 'admin.addproduct') {
            var souce='product';
        }
          const response = await $.ajax({
              url: '/api/products/categorylist',
              type: 'POST',
              data: {
                  'order_by': 'asc',
                  'count_per_page' : 10,
                  'sort_by' : '',
                  'source_type' : souce,
                  'search' : ''
              },
              headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                  'Accept': 'application/json'
              }
          });

          if (response.code == 200) {
              if(Array.isArray(response.data)) {
                  var currency_data = response.data;
                  var currency_table_body = $('#category_fied');
                  var response_data;
                  currency_table_body.empty();
                  currency_table_body.append("<option value=''>Select</option>");

                  $.each(currency_data, (index,val) => {
                      response_data = `<option value="${val.id}">${val.name}</option>`;
                      currency_table_body.append(response_data);
                  });
                //  currency_table_body.append("</select>");

              }
          } else {
              toastr.error('Error fetching settings:', response.message);
          }



      }

    var currentLang = $('body').data('lang');

    const validationMessages = {
        en: {
            source_name: {
                required: "The name field is required.",
                minlength: "The name must be at least 5 characters.",
                maxlength: "The name cannot exceed 255 characters.",
            },
            source_code: {
                required: "The service code is required.",
                minlength: "The service code must be at least 3 characters.",
                maxlength: "The service code cannot exceed 100 characters.",
            },
            category_fied: {
                required: "Please select a category.",
            },
            Subcategory_fied: {
                required: "Please select a subcategory.",
            },
            source_desc: {
                required: "The description is required.",
                minlength: "The description must be at least 10 characters.",
            },
            price_type: {
                required: "Please select a price type.",
            },
            fixed_price: {
                required: "The price is required.",
                number: "The price must be a valid number.",
            },
            "source_country[]": {
                required: "Please select at least one country.",
            },
            "source_city[]": {
                required: "Please select at least one city.",
            },
            "service_name[]": {
                required: "The service name is required.",
                minlength: "The service name must be at least 3 characters.",
            },
            "service_price[]": {
                required: "The service price is required.",
                number: "The service price must be a valid number.",
            },
            "service_desc[]": {
                required: "The service description is required.",
                minlength: "The service description must be at least 10 characters.",
            },
            seo_title: {
                required: "The SEO title is required.",
                maxlength: "The SEO title cannot exceed 100 characters.",
            },
            tags: {
                required: "Please enter tags.",
                minlength: "Tags must be at least 3 characters.",
            },
            content: {
                required: "The SEO description is required.",
                minlength: "The SEO description must be at least 10 characters.",
            },
            "logo[]": {
                required: "The service image is required.",
                extension: "Only JPG, JPEG, PNG, and SVG files are allowed.",
            },
        },
        ar: {
            source_name: {
                required: "حقل الاسم مطلوب.",
                minlength: "يجب أن يكون الاسم على الأقل 5 أحرف.",
                maxlength: "لا يمكن أن يتجاوز الاسم 255 حرفًا.",
            },
            source_code: {
                required: "حقل رمز الخدمة مطلوب.",
                minlength: "يجب أن يكون رمز الخدمة على الأقل 3 أحرف.",
                maxlength: "لا يمكن أن يتجاوز رمز الخدمة 100 حرف.",
            },
            category_fied: {
                required: "يرجى اختيار الفئة.",
            },
            Subcategory_fied: {
                required: "يرجى اختيار الفئة الفرعية.",
            },
            source_desc: {
                required: "الوصف مطلوب.",
                minlength: "يجب أن يكون الوصف على الأقل 10 أحرف.",
            },
            price_type: {
                required: "يرجى اختيار نوع السعر.",
            },
            fixed_price: {
                required: "السعر مطلوب.",
                number: "يجب أن يكون السعر رقمًا صالحًا.",
            },
            "source_country[]": {
                required: "يرجى اختيار بلد واحد على الأقل.",
            },
            "source_city[]": {
                required: "يرجى اختيار مدينة واحدة على الأقل.",
            },
            "service_name[]": {
                required: "اسم الخدمة مطلوب.",
                minlength: "يجب أن يكون اسم الخدمة على الأقل 3 أحرف.",
            },
            "service_price[]": {
                required: "سعر الخدمة مطلوب.",
                number: "يجب أن يكون سعر الخدمة رقمًا صالحًا.",
            },
            "service_desc[]": {
                required: "وصف الخدمة مطلوب.",
                minlength: "يجب أن يكون وصف الخدمة على الأقل 10 أحرف.",
            },
            seo_title: {
                required: "عنوان تحسين محركات البحث (SEO) مطلوب.",
                maxlength: "لا يمكن أن يتجاوز عنوان تحسين محركات البحث (SEO) 100 حرف.",
            },
            tags: {
                required: "يرجى إدخال العلامات.",
                minlength: "يجب أن تكون العلامات على الأقل 3 أحرف.",
            },
            content: {
                required: "وصف تحسين محركات البحث (SEO) مطلوب.",
                minlength: "يجب أن يكون وصف تحسين محركات البحث (SEO) على الأقل 10 أحرف.",
            },
            "logo[]": {
                required: "صورة الخدمة مطلوبة.",
                extension: "يُسمح فقط بملفات JPG و JPEG و PNG و SVG.",
            },

        },
    };


    $(document).ready(function () {
        $("#adminAddService").validate({
            rules: {
                source_name: {
                    required: true,
                    minlength: 5,
                    maxlength: 255,
                },
                source_code: {
                    required: true,
                    minlength: 3,
                    maxlength: 100,
                },
                category_fied: {
                    required: true,
                },
                Subcategory_fied: {
                    required: true,
                },
                source_desc: {
                    required: true,
                    minlength: 10,
                },
                price_type: {
                    required: true,
                },
                fixed_price: {
                    required: true,
                    number: true,
                },
                "source_country[]": {
                    required: true,
                },
                "source_city[]": {
                    required: true,
                },
                "service_name[]": {
                    required: true,
                    minlength: 3,
                },
                "service_price[]": {
                    required: true,
                    number: true,
                },
                "service_desc[]": {
                    required: true,
                    minlength: 10,
                },
                seo_title: {
                    required: true,
                    maxlength: 100,
                },
                tags: {
                    required: true,
                    minlength: 3,
                },
                content: {
                    required: true,
                    minlength: 10,
                },
                "logo[]": {
                    required: true,
                    extension: "jpg|jpeg|png|svg",
                },
            },
            messages: validationMessages[currentLang],
            errorElement: "span",
            errorPlacement: function (error, element) {
                error.addClass("invalid-feedback");
                element.closest(".mb-3").append(error);
            },
            highlight: function (element, errorClass, validClass) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass("is-invalid").addClass("is-valid");
            },
            submitHandler: function (form) {
                // Allow form submission
                form.submit();
            }
        });
    });

}
if (pageValue === 'admin.userlist' || pageValue === 'admin.providerslist') {
    $(document).ready(function () {
        list_table();
        // Handle search input
        $('#searchLanguage').on('input', function () {
            list_table(1); // Reset to the first page on new search
        });


    });
    var type='';
    if (pageValue === 'admin.providerslist') {
        var type=2;
    }else if (pageValue === 'admin.userlist') {
        var type=3;
    }
    function list_table(page) {
        $.ajax({
            url: '/api/getuserlist',
            type: 'POST',
            dataType: 'json',
            data: {
                order_by: 'desc',
                sort_by: 'id',
                page: page,
                search: $('#searchLanguage').val(),
                type:type
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
                if (response.code == '200') {
                    listTable(response.data, response.meta);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        if (languageId === 2) {
                            loadJsonFile('error_occurred_fetching_data', function (langtst) {
                                toastr.error(langtst);
                            });
                        }else{
                            toastr.error('An error occurred while fetching the data.');
                        }
                    }
                } else {
                    if (languageId === 2) {
                        loadJsonFile('error_occurred_fetching_data', function (langtst) {
                            toastr.error(langtst);
                        });
                    }else{
                        toastr.error('An error occurred while fetching the data.');
                    }
                }
                toastr.error('Error fetching list:', error);
            }
        });
    }

    function listTable(list, meta) {
        let tableBody = '';
        if (list.length > 0) {
            list.forEach(data => {
                let routeUrl = "/admin/provider/view/"+data.userid;
                if(type=='3'){
                    routeUrl = "/admin/user/view/"+data.userid;
                }else{
                     routeUrl = "/admin/provider/view/"+data.userid;
                }
                tableBody += `
                    <tr>
                        <td>${data.name}</td>
                        <td>${data.email}</td>
                        <td>${data.mobile_number ?? ""}</td>`;
                        if(type==2){
                            tableBody += `<td>${data.category_name ?? ""}</td>`
                        }
                        tableBody += `     ${
                                        $('#has_permission').data('edit') == 1 ?
                                        `<td>
                                <div class="status-toggle modal-status">
                                    <input type="checkbox" id="listactive-${data.userid}" class="check make_default" data-id="${data.userid}" ${data.status == 1 ? "checked" : ""} >
                                    <label for="listactive-${data.userid}" class="checktoggle"> </label>
                                </div>
                            </td>` : ''
                                      }
                             ${
                                $('#has_permission').data('visible') == 1 ?
                                    `<td>  <a href="${routeUrl}"
                                    class="view-user"
                                    data-id="${data.userid}">
                                    <i class="ti ti-eye fs-20 m-3"></i></a>
                                    ${
                                                $('#has_permission').data('delete') == 1 ?
                                                `  <a class="icon-only delete" href="#" data-bs-toggle="modal" data-bs-target="#delete-modal" data-id="${data.userid}">
                                            <i class="ti ti-trash m-3 fs-20"></i>
                                            </a>` : ''
                                            }

                                        </td>` : ''
                                    }
                </tr>`;
            });
            $('#ListTable tbody').html(tableBody);
        } else {
            if (!list || list.length === 0) {
                $('#ListTable').DataTable().destroy();
                $('#ListTable').DataTable({
                    paging: false,
                    language: {
                        emptyTable: "No Data found"
                    },
                    // Other DataTable options
                });
            }
        }


        if (!$.fn.dataTable.isDataTable('#ListTable')) {
            if ($('#ListTable').length && !$.fn.DataTable.isDataTable('#ListTable')) {
                $('#ListTable').DataTable({
                    ordering: true,
                    paging: true,
                    pageLength: 10,
                    "language": datatableLang
                });
            }
        }
    }


    function setupPagination(meta) {
        let paginationHtml = '';
        for (let i = 1; i <= meta.last_page; i++) {
            paginationHtml += `<li class="page-item ${meta.current_page === i ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`;
        }-
        // Handle click event for pagination
        $('#pagination').on('click', '.page-link', function (e) {
            e.preventDefault();
            const page = $(this).text();
        });
    }
    $(document).on('click', '.make_default', function(e) {
        e.preventDefault();
        var Id = $(this).data('id');
        var checkbox=$(this);
        var isChecked = checkbox.is(':checked');
        $.ajax({
            url: '/api/people/get-status', // Replace with your API endpoint
            type: 'GET',
            data: {id: Id,status : isChecked? 1 : 0},
            success: function (response) {
                const statusValue = response.data;
                // Assume the response contains a "status" field
                if (statusValue == 1) {
                    $('#listactive-'+Id).prop('checked', true); // Enable the toggle
                } else {
                    $('#listactive-'+Id).prop('checked', false); // Disable the toggle
                }
                let statusLabel = response.message;
                if (languageId === 2) {
                    loadJsonFile(statusLabel, function (langtst) {
                        toastr.success(langtst);
                    });
                }else{
                    toastr.success(statusLabel);
                }

            },
            error: function () {
                let statusLabel = 'Error fetching status!';
                if (languageId === 2) {
                    loadJsonFile(statusLabel, function (langtst) {
                        toastr.success(langtst);
                    });
                }else{
                    toastr.error(statusLabel);
                }

            }
        });

    });

    $(document).on("click", '.delete[data-bs-toggle="modal"]', function (e) {
        e.preventDefault();
        var Id = $(this).data("id");
        $("#confirmDelete").data("id", Id);
    });

    $(document).on('click', '#confirmDelete', function(e) {
        e.preventDefault();
        var Id = $(this).data('id');
        $.ajax({
            url: '/api/admin/deleteuser',
            type: 'POST',
            data: {
                id: Id,
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.success) {
                    toastr.success(response.message);
                    $('#delete-modal').modal('hide');
                    list_table(1); // Refresh the templateId table
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while trying to delete the data.');
            }
        });
    });

}

if (pageValue === 'admin.profile') {
    $(".upload_icon").hide();
    $('#imagePreview').show();

    $(document).ready(function () {
        const selectedCountry = $('#country').data('country');
        const selectedState = $('#state').data('state');
        const selectedCity = $('#city').data('city');

        getCountries(selectedCountry, selectedState, selectedCity);

        $('#country').on('change', function () {
            const selectedCountry = $(this).val();
            clearDropdown($('#state'));
            clearDropdown($('#city'));
            if (selectedCountry) {
                getStates(selectedCountry);
            }
        });

        $('#state').on('change', function () {
            const selectedState = $(this).val();
            clearDropdown($('#city'));
            if (selectedState) {
                getCities(selectedState);
            }
        });

        $('#save_admin_profile').on('click', function (e) {
            e.preventDefault();
            $('#adminProfileForm').submit();
        });

        $("#phone_number").on("input", function () {
            $(this).val($(this).val().replace(/[^0-9]/g, ""));
            if ($(this).val().length > 12) {
                $(this).val($(this).val().slice(0, 12));
            }
        });

        $("#postal_code").on("input", function () {
            if ($(this).val().length > 6) {
                $(this).val($(this).val().slice(0, 6));
            }
        });

        $('#adminProfileForm').validate({
            rules: {
                first_name: {
                    required: true,
                    maxlength: 100,
                    pattern: /^[a-zA-Z]+$/
                },
                last_name: {
                    required: true,
                    maxlength: 100,
                    pattern: /^[a-zA-Z]+$/
                },
                user_name: {
                    required: true,
                    maxlength: 100,
                    remote: {
                        url: '/api/user/check-unique',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            user_name: function() {
                                return $('#user_name').val();
                            },
                            id: function() {
                                return $('#id').val();
                            },
                        }
                    }
                },
                email: {
                    required: true,
                    email: true,
                    remote: {
                        url: '/api/user/check-unique',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            email: function() {
                                return $('#email').val();
                            },
                            id: function() {
                                return $('#id').val();
                            },
                        }
                    }
                },
                phone_number: {
                    required: true,
                    minlength: 10,
                    maxlength: 12
                },
                address: {
                    required: true,
                    maxlength: 150
                },
                country: {
                    required: true
                },
                state: {
                    required: true
                },
                city: {
                    required: true
                },
                postal_code: {
                    required: true,
                    maxlength: 6,
                    pattern: /^[a-zA-Z0-9]*$/
                },
                profile_image: {
                    extension: "jpeg|jpg|png",
                    filesize: 2048,
                },
            },
            messages: {
                first_name: {
                    required: $('#first_name_error').data('required'),
                    maxlength: $('#first_name_error').data('max'),
                    pattern: $('#first_name_error').data('alpha')
                },
                last_name: {
                    required: $('#last_name_error').data('required'),
                    maxlength: $('#last_name_error').data('max'),
                    pattern: $('#last_name_error').data('alpha')
                },
                user_name: {
                    required: $('#user_name_error').data('required'),
                    maxlength: $('#user_name_error').data('max'),
                    remote: $('#user_name_error').data('exists')
                },
                email: {
                    required: $('#email_error').data('required'),
                    email: $('#email_error').data('email_format'),
                    remote: $('#email_error').data('exists')
                },
                phone_number: {
                    required: $('#phone_number_error').data('required'),
                    digits: $('#phone_number_error').data('digits'),
                    minlength: $('#phone_number_error').data('between'),
                    maxlength: $('#phone_number_error').data('between')
                },
                address: {
                    required: $('#address_error').data('required'),
                    maxlength: $('#address_error').data('max'),
                },
                country: {
                    required: $('#country_error').data('required')
                },
                state: {
                    required: $('#state_error').data('required'),
                },
                city: {
                    required: $('#city_error').data('required'),
                },
                postal_code: {
                    required: $('#postal_code_error').data('required'),
                    maxlength: $('#postal_code_error').data('max'),
                    pattern: $('#postal_code_error').data('char_allowed'),
                },
                profile_image: {
                    extension: $('#profile_image_error').data('extension'),
                    filesize: $('#profile_image_error').data('size')
                },
            },
            errorPlacement: function (error, element) {
                var errorId = element.attr("id") + "_error";
                $("#" + errorId).text(error.text());
            },
            highlight: function (element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                var url = 'save-admin-details';
                var btnId = '#save_admin_profile';
                var data = new FormData(form);
                saveAdminDetails(data, url, btnId);
            }
        });

        $('#changePasswordForm').validate({
            rules: {
                current_password: {
                    required: true,
                    minlength: 8,
                    remote: {
                        url: '/api/admin/check-password',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            current_password: function() {
                                return $('#current_password').val();
                            },
                            id: function() {
                                return $('#id').val();
                            },
                        }
                    }
                },
                new_password: {
                    required: true,
                    minlength: 8,
                    notEqualTo: '#current_password'
                },
                confirm_password: {
                    required: true,
                    equalTo: '#new_password'
                }
            },
            messages: {
                current_password: {
                    required: $('#current_password_error').data('required'),
                    minlength: $('#current_password_error').data('min'),
                    remote: $('#current_password_error').data('incorrect')
                },
                new_password: {
                    required: $('#new_password_error').data('required'),
                    minlength: $('#new_password_error').data('min'),
                    notEqualTo: $('#new_password_error').data('not_equal')
                },
                confirm_password: {
                    required: $('#confirm_password_error').data('required'),
                    equalTo: $('#confirm_password_error').data('equal')
                }
            },
            errorPlacement: function (error, element) {
                var errorId = element.attr("id") + "_error";
                $("#" + errorId).text(error.text());
            },
            highlight: function (element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
                $('#' + element.id).siblings('span').addClass('me-3');
            },
            unhighlight: function (element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
                $('#' + element.id).siblings('span').addClass('me-3');
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                var url = 'admin/change-password';
                var btnId = '#change_password';
                var data = new FormData(form);
                data.append('id', $('#id').val());

                saveAdminDetails(data, url, btnId);
            }
        });

    });

    $.validator.addMethod("filesize", function (value, element, param) {
        if (element.files.length === 0) return true;
        return element.files[0].size <= param * 1024;
    }, "File size must be less than {0} KB.");

    $.validator.addMethod("notEqualTo", function (value, element, param) {
        return value !== $(param).val();
    }, "New password cannot be the same as the current password.");

    function clearDropdown(dropdown) {
        dropdown.empty().append($('<option>', {
            value: '',
            text: 'Select',
            disabled: true,
            selected: true
        }));
    }

    function getCountries(selectedCountry = null, selectedState = null, selectedCity = null) {
        $.getJSON('/countries.json', function (data) {
            const countrySelect = $('#country');
            clearDropdown(countrySelect);

            $.each(data.countries, function (index, country) {
                countrySelect.append($('<option>', {
                    value: country.id,
                    text: country.name,
                    selected: country.id == selectedCountry
                }));
            });

            if (selectedCountry) {
                getStates(selectedCountry, selectedState, selectedCity);
            }
        }).fail(function () {
            toastr.error('Error loading country data');
        });
    }

    function getStates(selectedCountry, selectedState = null, selectedCity = null) {
        $.getJSON('/states.json', function (data) {
            const stateSelect = $('#state');
            clearDropdown(stateSelect);

            const states = data.states.filter(state => state.country_id == selectedCountry);
            if (states.length === 1) {
                // Automatically select the single state
                stateSelect.append($('<option>', {
                    value: states[0].id,
                    text: states[0].name,
                    selected: true
                }));
                getCities(states[0].id, selectedCity); // Automatically load cities
            } else {
                $.each(states, function (index, state) {
                    stateSelect.append($('<option>', {
                        value: state.id,
                        text: state.name,
                        selected: state.id == selectedState
                    }));
                });

                if (selectedState) {
                    getCities(selectedState, selectedCity);
                }
            }
        }).fail(function () {
            toastr.error('Error loading state data');
        });
    }

    function getCities(selectedState, selectedCity = null) {
        $.getJSON('/cities.json', function (data) {
            const citySelect = $('#city');
            clearDropdown(citySelect);

            const cities = data.cities.filter(city => city.state_id == selectedState);
            if (cities.length === 1) {
                // Automatically select the single city
                citySelect.append($('<option>', {
                    value: cities[0].id,
                    text: cities[0].name,
                    selected: true
                }));
            } else {
                $.each(cities, function (index, city) {
                    citySelect.append($('<option>', {
                        value: city.id,
                        text: city.name,
                        selected: city.id == selectedCity
                    }));
                });
            }
        }).fail(function () {
            toastr.error('Error loading city data');
        });
    }

    $('#profile_image').on('change', function (event) {
        if ($(this).val() !== '') {
            $(this).valid();
        }
        let reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').attr('src', e.target.result).show();
            $('.upload_icon').hide();
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    function saveAdminDetails(data, url, btnId) {
        $.ajax({
            url: "/api/" + url,
            type: "POST",
            data: data,
            enctype: "multipart/form-data",
            contentType: false,
            processData: false,
            cache: false,
            beforeSend: function () {
                $(btnId).attr("disabled", true).html(
                    '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                );
            },
            success: function (response) {
                $(".error-text").text("");
                $(btnId).removeAttr("disabled").html($('#save_admin_profile').data('save'));
                $(".form-control").removeClass("is-invalid is-valid");
                if (response.code === 200) {
                    toastr.success($('#save_admin_profile').data('save_success'));
                    getAdminDetails();
                }
                if (btnId = '#change_password') {
                    $('#current_password').val('');
                    $('#new_password').val('');
                    $('#confirm_password').val('');
                    $('.pass-group').find('span').removeClass('me-3');
                }

            },
            error: function (error) {
                $(".error-text").text("");
                $(btnId).removeAttr("disabled").html($('#save_admin_profile').data('save'));
                $(".form-control").removeClass("is-invalid is-valid");
                if (error.responseJSON.code === 422) {
                    $.each(error.responseJSON.errors, function(key, val) {
                        $("#" + key).addClass("is-invalid");
                        $("#" + key + "_error").text(val[0]);
                    });
                } else {
                    toastr.error(error.responseJSON.message);
                }
            }
        });
    }

    function getAdminDetails() {
        $.ajax({
            url: '/api/get-admin-details',
            type: 'POST',
            data: {
                id: localStorage.getItem('user_id'),
                isMobile: 1,
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code === 200) {
                    const data = response.data;
                    if (data.user_details && data.user_details.profile_image != null) {
                        $(".headerProfileImg").attr('src', data.user_details.profile_image);
                    }
                }
            },
            error: function(xhr, status, error) {
                toastr.error(xhr.responseText);
            }
        });
    }

}
if (pageValue === 'admin.bookinglist') {
    $(document).ready(function () {
        list_table();
        // Handle search input
        $('#searchLanguage').on('input', function () {
            list_table(1,'all-booking'); // Reset to the first page on new search
        });


    });

    // Automatically load data for the active tab on page load
    list_table(1,'all-booking');
    $('.bookingtab button').on('click', function (e) {
        e.preventDefault();

        // Update active tab
        $('.bookingTabs button').removeClass('active');
        $(this).addClass('active');

        // Get the selected tab's data
        var tab = $(this).attr('aria-controls');
        list_table(1,tab);
    });
    function list_table(page,param) {
        $.ajax({
            url: '/api/bookinglists',
            type: 'POST',
            dataType: 'json',
            data: {
                type: param,
                order_by: 'desc',
                sort_by: 'id',
                page: page,
                search: $('#searchLanguage').val()
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
                if (response.code == '200') {
                    listTable(response.data, response.meta);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error('An error occurred while fetching list.');
                    }
                } else {
                    toastr.error('An error occurred while fetching list.');
                }
                toastr.error('Error fetching list:', error);
            }
        });
    }

    function listTable(list, meta) {
        let tableBody = '';
        if (list['bookingdata'].length > 0) {
            i=0;
            list['bookingdata'].forEach(data => {
                i++;
                var currencyvalue = list['currency_value'];
                var amount = (data.serviceamount * currencyvalue).toFixed(2);
                tableBody += `
                    <tr>
                        <td>${i}</td>
                        <td>${data.bookingdate}</td>
                        <td>${data?.product?.created_by?.user_details?.first_name ?? ""}</td>
                        <td>${data?.user?.user_details?.first_name ?? ""}</td>
                        <td>${data.source_name}</td>
                        <td>${list['currency']}${amount}</td>
                        <td><span class="booking-status  fs-14" data-status="${data.booking_status}">${data.booking_status_label}</spn></td>`;
                        tableBody += `
                            <td>  <a href="#"
                        class="view-bookinglist" data-bs-toggle="modal" data-bs-target="#view-modal"
                        data-id="${data.id}" data-date="${data.bookingdate}" data-status="${data.booking_status_label}"  data-provider="${data?.product?.created_by?.user_details?.first_name ?? ""}" data-amount="${list['currency']}${amount}"  data-username="${data?.user?.user_details?.first_name ?? ""}" data-product="${data.source_name}" data-address="${data.user_city}">
                           <i class="ti ti-eye fs-20 m-3"></i>
                    </a>
                            </td>
                </tr>`;
            });

        } else {
            if (!list || list.length === 0) {
                $('#ListTable').DataTable().destroy();
                var nodata="No Data found";
                if (languageId === 2) {
                    loadJsonFile('No Data found', function (langtst) {
                        var nodata=langtst;
                    });
                }
                $('#ListTable').DataTable({
                    paging: false,
                    language: {
                        emptyTable: nodata
                    },
                    // Other DataTable options
                });
            }
        }
        if ($.fn.DataTable.isDataTable('#ListTable')) {
            $('#ListTable').DataTable().destroy(); // Destroy previous instance
        }
        $('#ListTable tbody').html(tableBody);
        applyBookingStatusStyles();
        $('#ListTable').DataTable({
            "ordering": true,
            pageLength: 10,
            language: datatableLang
        });
        // setupPagination(meta);
    }

    function formatDate(dateString) {
        const date = new Date(dateString); // Parse the date string
        const day = String(date.getDate()).padStart(2, '0'); // Get day with leading zero
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear(); // Get full year
        return `${day}-${month}-${year}`; // Return formatted date
    }
    function setupPagination(meta) {
        let paginationHtml = '';
        for (let i = 1; i <= meta.last_page; i++) {
            paginationHtml += `<li class="page-item ${meta.current_page === i ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`;
        }-

      //  $('#pagination').html(paginationHtml);

        // Handle click event for pagination
        $('#pagination').on('click', '.page-link', function (e) {
            e.preventDefault();
            const page = $(this).text();
             list_table(page); // Fetch languages for the selected page
        });
    }

    function   applyBookingStatusStyles(){
        $('.booking-status').each(function () {
            const status = $(this).data('status');
            let statusClass = '';
            let statusText = '';

            switch (status) {
                case 1:
                    statusClass = 'badge badge-primary-transparent ms-2';
                    statusText = 'Open';
                    break;
                case 2:
                    statusClass = 'badge badge-soft-info ms-2';
                    statusText = 'In progress';
                    break;
                case 3:
                    statusClass = 'badge badge-soft-danger ms-2';
                    statusText = 'Provider Cancelled';
                    break;
                case 4:
                    statusClass = 'badge badge-soft-warning ms-2';
                    statusText = 'Refund Initiated';
                    break;
                case 5:
                    statusClass = 'badge badge-soft-success ms-2';
                    statusText = 'Completed';
                    break;
                case 6:
                    statusClass = "badge badge-soft-success ms-2";
                        statusText = "Order Completed";
                        break;
                case 7:
                        statusClass = "badge badge-soft-success ms-2";
                        statusText = "Refund Completed";
                        break;
                case 8:
                        statusClass = "badge badge-soft-danger ms-2";
                        statusText = "Customer Cancelled";
                        break;

                default:
                    statusClass = 'status-unknown';
                    statusText = 'Unknown';
            }

            $(this).addClass(statusClass).text(statusText);
        });
    }
    $(document).on('click', '.view-bookinglist', function (e) {
        e.preventDefault();
        const source_name = $(this).data('product');
        const date = $(this).data('date');
        const username = $(this).data('username');
        const provider = $(this).data('provider');
        const user_address = $(this).data('address');
        const amount = $(this).data('amount');
        const booking_status = $(this).data('status');
                document.getElementById('modalTitle').innerText =source_name;
                document.getElementById('modalDate').innerText = date;
                document.getElementById('user').innerText =username;
                document.getElementById('provider').innerText = provider;
                document.getElementById('location').innerText = user_address;
                document.getElementById('amount').innerText = amount;
                document.getElementById('status').innerText =booking_status;
    });

}

if (pageValue === 'admin.footer-builder') {

    function initSummernote(placeholder = '') {
        var resolvedPlaceholder = placeholder === '' ? "Enter Footer Content" : placeholder;

        $(".custom-summernote").each(function () {
            if ($(this).next('.note-editor').length) {
                $(this).summernote("destroy");
            }
        });

        $(".custom-summernote").summernote({
            height: 200,
            width: "100%",
            toolbar: [
                ["style", ["style"]],
                [
                    "font",
                    [
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "superscript",
                        "subscript",
                        "clear",
                    ],
                ],
                ["fontname", ["fontname"]],
                ["fontsize", ["fontsize"]],
                ["color", ["color"]],
                ["para", ["ul", "ol", "paragraph"]],
                ["height", ["height"]],
                ["table", ["table"]],
                ["insert", ["link", "picture", "video"]],
                ["view", ["fullscreen", "codeview", "help"]],
            ],
            placeholder: resolvedPlaceholder,
        });
    }


    $(document).ready(function() {
        initSummernote();

        var langCode = $('body').data('lang');

        listFooter('', langCode);
    });

    $('#footerForm').on('submit', function(e) {
        e.preventDefault();

        let formData = $(this).serialize();

        $.ajax({
            url: "/api/admin/save-footer-builder",
            type: "POST",
            data: formData,
            dataType: 'json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
                $('#save_footer').attr("disabled", true).html(
                    '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                );
            },
            success: function (response) {
                $(".error-text").text("");
                $('#save_footer').removeAttr("disabled").html(lg_save);
                $(".form-control").removeClass("is-invalid is-valid");
                if (response.code === 200) {
                    toastr.success(response.message);
                }

            },
            error: function (error) {
                $(".error-text").text("");
                $('#save_footer').removeAttr("disabled").html(lg_save);
                $(".form-control").removeClass("is-invalid is-valid");
                if (error.responseJSON.code === 422) {
                    $.each(error.responseJSON.errors, function(key, val) {
                        $("#" + key).addClass("is-invalid");
                        $("#" + key + "_error").text(val[0]);
                    });
                } else {
                    toastr.error(error.responseJSON.message);
                }
            }
        });
    });

    function listFooter(langId = '', langCode = '') {
        $.ajax({
            url: "/api/admin/list-footer-builder",
            type: "POST",
            data: {
                language_id: langId,
                language_code: langCode
            },
            dataType: 'json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === 200) {
                    
                    if (response.data != null) {
                        const footers = response.data.footer_content
                        footers.forEach((footer, index) => {
                            index = index + 1;
                            $('#section_title_'+ index).val(footer.title);
                            $('#status_'+ index).prop('checked', footer.status == 1);
                            $('#footer_content_'+ index).summernote('code', footer.footer_content);
                        });
                        $('#status').prop('checked', response.data.status == 1);
                        $('#id').val(response.data.id);
                    } else {
                        $('#footerForm').trigger('reset');
                        $('#footer_content_1').summernote('code', '');
                        $('#footer_content_2').summernote('code', '');
                        $('#footer_content_3').summernote('code', '');
                        $('#footer_content_4').summernote('code', '');
                        $('#footer_content_5').summernote('code', '');
                    }

                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            }
        });
    }

    $('#language_id').on('change', function() {
        var langId = $(this).val();

        languageTranslate(langId);
        listFooter(langId);
    });

    function languageTranslate(lang_id) {
        $.ajax({
            url: "/api/translate",
            type: "POST",
            dataType: "json",
            data: {
                language_id: lang_id,
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                const trans = response.translated_values;

                $(".error-text").text("");
                $(".form-control").removeClass("is-invalid is-valid");

                if (response.code === 200 && Object.keys(trans).length > 0) {

                    var placeholder = trans.enter_footer_content;
                    initSummernote(placeholder);

                    $('#section_title_1').attr('placeholder', trans.enter_section_title);
                    $('#section_title_2').attr('placeholder', trans.enter_section_title);
                    $('#section_title_3').attr('placeholder', trans.enter_section_title);
                    $('#section_title_4').attr('placeholder', trans.enter_section_title);
                    $('#section_title_5').attr('placeholder', trans.enter_section_title);

                    $('#save_footer').text(trans.Save);

                    $('.lang_title').text(trans.available_translations);
                    lg_save = trans.Save;

                    $('.translate-key').each(function () {
                        var translateKey = $(this).data('translate');
                        if (trans.hasOwnProperty(translateKey)) {
                            var translatedText = trans[translateKey];
                            $(this).text(translatedText);
                        }
                    });

                }

            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }


}


//User Request Dispite List
if (pageValue === "admin.request.dispute") {
    function request_table() {
        fetchRequest(1);
    }

    function fetchRequest(dispute) {
        $.ajax({
            url: "/api/booking/request-dispute",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    populateRequest(response.data);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    $(document).ready(function () {
        request_table();
    });

    function populateRequest(Dispute) {
        let tableBody = "";

        if (Dispute.length > 0) {
            Dispute.forEach((Dispute, index) => {
                tableBody += `
                    <tr>
                            <td>${index + 1}</td>
                            <td>${Dispute.booking_id}</td>
                            <td>${Dispute.user.name}</td>
                            <td>${Dispute.provider.name}</td>
                            <td>${Dispute.product.source_name}</td>
                            <td>
                                <span class="badge ${
                                    Dispute.status == "1"
                                        ? "badge-soft-success"
                                        : "badge-soft-danger"
                                } d-inline-flex align-items-center">
                                    <i class="ti ti-circle-filled fs-5 me-1"></i>${
                                        Dispute.status == "1"
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>
                            </td>
                            ${
                                $('#has_permission').data('visible') == 1 ?
                            `<td><li style="list-style: none;">
                                ${
                                    $('#has_permission').data('visible') == 1 ?
                                            `<a class="edit_dispute_data"
                                               href="#"
                                               data-bs-toggle="modal"
                                               data-bs-target="#edit_dispute"
                                               data-id="${Dispute.id}"
                                               data-subject="${Dispute.subject}"
                                               data-content="${Dispute.content}"
                                               data-admin_reply="${Dispute.admin_reply}"
                                               data-status="${Dispute.status}">
                                               <i class="ti ti-pencil fs-20"></i>
                                            </a>` : ''
                                }
                                        </li>
                            </td>` : ''
                            }
                        </tr>
                    `;
            });
        } else {
            $('#datatable_dispute').DataTable().destroy();

            tableBody = `
                    <tr>
                        <td colspan="7" class="text-center">${$('#datatable_dispute').data('empty')}</td>
                    </tr>
                `;
        }

        $("#datatable_dispute tbody").html(tableBody);
        if ((Dispute.length != 0) && !$.fn.dataTable.isDataTable("#datatable_dispute")) {
            $("#datatable_dispute").DataTable({
                ordering: true,
                language: datatableLang
            });
        }
    }

    $(document).on("click", ".edit_dispute_data", function (e) {
        e.preventDefault();

        var Id = $(this).data("id");
        var subject = $(this).data("subject");
        var content = $(this).data("content");
        var admin_reply = $(this).data("admin_reply");
        var status = $(this).data("status");

        $("#edit_id").val(Id);
        $("#edit_subject").val(subject);
        $("#edit_content").val(content);
        $("#edit_reply").val(admin_reply);
        $("#edit_status").prop("checked", status == 1);
    });

    $(document).ready(function () {
        $("#editDisputeForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/booking/raise-dispute/update",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                beforeSend: function () {
                    $(".edit_btn").attr("disabled", true);
                    $(".edit_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".edit_btn").removeAttr("disabled");
                    $(".edit_btn").html($('.edit_btn').data('update'));
                    if (response.code === 200) {
                        toastr.success(response.message);
                        request_table();
                        $("#edit_dispute").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".edit_btn").removeAttr("disabled");
                    $(".edit_btn").html($('.edit_btn').data('update'));

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    if(pageValue=== 'admin.dashboard'){
        document.addEventListener('DOMContentLoaded', requestPermissionAndGetToken);
        $.ajax({
            url: '/api/gettotalbookingcount',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code== "200") {
                    var data=response.data;
                    if(data!=""){
                        $('.completecount').text(data.completed_count);
                        $('.cancelcount').text(data.cancelled_count);
                        $('.upcomingcount').text(data.upcoming_count);
                        $('.totalincome').text(currency + data.overall_total_amount);
                        $('.completeincome').text(currency + data.completed_total_amount);
                        $('.totaldue').text( currency + data.due_amount);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while fetching the data.');
            }

        });
        $.ajax({
            url: '/api/getsubscription',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code== "200") {
                    var data=response.data;
                    if(data!=""){
                        $('.plantitle').text(data.package_title);
                        $('.planprice').text(data.price);
                        $('.duration').text('/ '+data.package_term);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while fetching the data.');
            }

        });
        $.ajax({
            url: '/api/getlatestbookings',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code== "200") {
                    var data=response.data;
                    const bookdiv=$(".book-crd");
                    if(data!=""){
                        response.data.forEach(val => {
                        bookdiv.append(`<div class="card">
                                        <div class="card-body"><div class="d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                                            <div class="d-flex align-items-center">
                                                <a href="booking-details.html" class="avatar avatar-lg flex-shrink-0 me-2">
                                                    <img src="assets/img/services/service-63.jpg" class="rounded-circle" alt="Img">
                                                </a>
                                                <div>
                                                    <a href="booking-details.html" class="fw-medium">${val.product_name}</a>
                                                    <span class="d-block fs-12"><i class="ti ti-clock me-1"></i>${val.fromtime} - ${val.totime}</span>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center">
                                                <a href="booking-details.html" class="avatar avatar-sm me-2">
                                                    <img src="assets/img/user/user-01.jpg" class="rounded-circle" alt="user">
                                                </a>

                                            </div>
                                        </div> </div>
                                        </div>`);
                                    //     <a href="booking-details.html">
                                    //     <i class="ti ti-chevron-right"></i>
                                    // </a>
                        });
                    }else{
                        html =`<div class="text-center">No Data Found </div>`;
                        bookdiv.append(html);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while fetching the data.');
            }

        });
        $.ajax({
            url: '/api/getlatestreviews',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code== "200") {
                    var data=response.data;
                    const ratingdiv=$(".ratecard");
                    if(data!=""){
                        data.forEach(val => {
                        var ratehtml=` <div class=" border-bottom pb-3 mb-3">
                                <div class="d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                                    <div class="d-flex">
                                        <a href="javascript:void(0);" class="avatar avatar-lg flex-shrink-0 me-2">
                                            <img src="assets/img/profiles/avatar-01.jpg" class="rounded-circle" alt="Img">
                                        </a>
                                        <div>
                                            <a href="provider-reviews.html" class="fw-medium">${val.provider_name}</a>
                                            <div class="d-flex align-items-center">
                                                <p class="fs-12 mb-0 pe-2 border-end">For <span class="text-info">${val.product_name}</span></p>
                                                <span class="avatar avatar-sm mx-2">
                                                    <img src="assets/img/user/user-03.jpg" class="img-fluid rounded-circle" alt="user">
                                                </span>
                                                <span class="fs-12">${val.username}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex">
                                        <span class="text-warning fs-10 me-1">`;
                                            for ($i = 1; $i <= 5; $i++){
                                                if ($i <= Math.floor(val.rating)){
                                                    ratehtml +=`<i class="ti ti-star-filled filled"></i>`;
                                                }else{
                                                    ratehtml +=`<i class="ti ti-star"></i>`;
                                                }
                                            }
                                        ratehtml+=`</span>
                                        <span class="fs-12">${val.rating}</span>
                                    </div>
                                </div>
                            </div>`;
                            ratingdiv.append(ratehtml);
                        });

                    }else{
                        html =`<div class="text-center">No Data Found </div>`;
                        ratingdiv.append(html);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while fetching the data.');
            }

        });
        $.ajax({
            url: '/api/getlatestproductservice',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (response.code== "200") {
                    var data=response.data;
                    const servicediv=$(".servicecard");
                    if(data!=""){
                        data.forEach(val => {
                        var servicehtml=`<div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="d-flex">
                                        <a href="service-details.html" class="avatar avatar-lg me-2">
                                            <img src="assets/img/services/service-56.jpg" class="rounded-circle" alt="Img">
                                        </a>
                                        <div>
                                            <a href="service-details.html" class="fw-medium mb-0">${val.product_name}</a>
                                            <div class="fs-12 d-flex align-items-center gap-2">
                                                <span class="pe-2 border-end">${val.total_bookings} Bookings</span>`;
                                                // <span class="pe-2 border-end">$400K</span>`;
                                                if(val.average_rating!=''){
                                                    servicehtml +=`<span><i class="ti ti-star-filled text-warning me-1 me-1"></i>${val.average_rating}</span>`;
                                                }
                           servicehtml +=`  </div>
                                        </div>
                                    </div>
                                 </div>`;
                                    // <a href="service-details.html">
                                    //     <i class="ti ti-chevron-right"></i>
                                    // </a>

                            servicediv.append(servicehtml);
                        });

                    }else{
                        servicehtml =`<div class="text-center">No Data Found </div>`;
                        servicediv.append(servicehtml);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                toastr.error('An error occurred while fetching the data.');
            }

        });
    }
}
var currency=getcurrency();
if (pageValue === 'admin.subscriptionlist') {
    $(document).ready(function () {
        list_table();
        // Handle search input
        $('#searchLanguage').on('input', function () {
            list_table(1); // Reset to the first page on new search
        });


    });

    function list_table(page) {
        $.ajax({
            url: '/api/getsubscriptionlist',
            type: 'POST',
            dataType: 'json',
            data: {
                order_by: 'desc',
                sort_by: 'id',
                page: page,
                search: $('#searchLanguage').val(),
                type:type
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json'
            },
            success: function (response) {
                if (response.code == '200') {
                    listTable(response.data, response.meta, response.currency);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error('An error occurred while fetching list.');
                    }
                } else {
                    toastr.error('An error occurred while fetching list.');
                }
            }
        });
    }

    function listTable(list, meta, currency) {
        let tableBody = '';

        if (list.length > 0) {
            list.forEach(data => {
                let currencySymbol = currency.symbol;
                let currencyvalue = currency.currency_value;
                let price = (data.price * currencyvalue).toFixed(2);
                tableBody += `
                    <tr>
                        <td>${data.package_title}</td>
                        <td>${currencySymbol}${price}</td>
                         <td>${data.subscription_type ?? ""}</td>
                         <td>${data.description ?? ""}</td>
                         <td>${data.name ?? ""}</td>
                        <td>${data.status}</td>
                </tr>`;
            });
            $('#ListTable tbody').html(tableBody);
        } else {
            if (!list || list.length === 0) {
                $('#ListTable').DataTable().destroy();
                $('#ListTable').DataTable({
                    paging: false,
                    language: {
                        emptyTable: "No Data found"
                    },
                    // Other DataTable options
                });
            }
        }
        if (!$.fn.dataTable.isDataTable('#ListTable')) {
            if (languageId === 2) {


                if ($('#ListTable').length && !$.fn.DataTable.isDataTable('#ListTable')) {
                    $('#ListTable').DataTable({
                        ordering: true,
                        paging: true,
                        pageLength: 10,
                        "language":
                        {
                            "sProcessing": "جارٍ التحميل...",
                            "sLengthMenu": "أظهر _MENU_ مدخلات",
                            "sZeroRecords": "لم يعثر على أية سجلات",
                            "sInfo": "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
                            "sInfoEmpty": "يعرض 0 إلى 0 من أصل 0 سجل",
                            "sInfoFiltered": "(منتقاة من مجموع _MAX_ مُدخل)",
                            "sInfoPostFix": "",
                            "sSearch": "ابحث:",
                            "sUrl": "",
                            "oPaginate": {
                                "sFirst": "الأول",
                                "sPrevious": "السابق",
                                "sNext": "التالي",
                                "sLast": "الأخير"
                            }
                        }
                    });
                }
            }else{
                $('#ListTable').DataTable({
                    "ordering": true,
                });
            }
        }
    }


    function setupPagination(meta) {
        let paginationHtml = '';
        for (let i = 1; i <= meta.last_page; i++) {
            paginationHtml += `<li class="page-item ${meta.current_page === i ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`;
        }

        // Handle click event for pagination
        $('#pagination').on('click', '.page-link', function (e) {
            e.preventDefault();
            const page = $(this).text();
        });
    }

    $(document).on('click', '.view-user', function (e) {
        e.preventDefault();
        const userId = $(this).data('id');
        $.ajax({
            url: "/admin/viewuserdata",
            type: 'POST',
            data: {
                id: userId,
            },
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                const routeUrl = "/admin/viewuser";
                window.location.href = routeUrl;
            },
        });
    });
}

if (pageValue === 'admin.reviews') {
    $(document).ready(function(){
        getReviewList(1);
    });

    function getReviewList(page = 1) {
        const perPage = $('#entries_per_page').val();

        $.ajax({
            url: "/api/get-review-list",
            type: "POST",
            data: {
                per_page: perPage,
                page: page
            },
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === 200) {
                    let reviews = response.data.data;
                    let totalReviews = response.data.total;
                    let lastPage = response.data.last_page;
                    let currentPage = response.data.current_page;

                    $('.review_list_container').empty();

                    if (reviews.length > 0) {
                        reviews.forEach(review => {
                            let filledStars = '';
                            for (let i = 1; i <= 5; i++) {
                                filledStars += i <= review.rating
                                    ? '<span><i class="ti ti-star-filled text-warning"></i></span>'
                                    : '<span><i class="ti ti-star text-muted"></i></span>';
                            }

                            $('.review_list_container').append(`
                                <div class="col-xxl-12 col-lg-12">
                                    <div class="card shadow-none">
                                        <div class="card-body">
                                            <div class="d-md-flex align-items-center">
                                                <div class="review-widget d-sm-flex flex-fill">
                                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                                        <div class="d-flex">
                                                            <span class="review-img me-2">
                                                                <img src="${review.service_image}" class="rounded img-fluid" alt="Service Image">
                                                            </span>
                                                            <div>
                                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                                    <div class="d-flex align-items-center">
                                                                        <h6 class="fs-14 me-2">${review.service_name}</h6>
                                                                        ${filledStars}
                                                                    </div>
                                                                </div>
                                                                <div class="d-flex align-items-center">
                                                                    <span class="avatar avatar-sm me-2">
                                                                        <img src="${review.profile_image}" class="rounded-circle " alt="Img">
                                                                    </span>
                                                                    <h6 class="fs-13 me-2">${review.full_name}</h6>
                                                                    <span class="fs-12">${review.review_date}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                ${
                                                    $('#has_permission').data('delete') == 1 ?
                                                    `<div class="user-icon d-inline-flex">
                                                        <a href="#" class="delete_review_btn" data-id="${review.id}" data-bs-toggle="modal" data-bs-target="#del-review"><i class="ti ti-trash m-3 fs-20"></i></a>
                                                    </div>` : ''
                                                }
                                            </div>
                                            <div>
                                                <p class="fs-14">${review.review}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `);
                        });

                        $('#paginate_container').removeClass('d-none');
                    } else {
                        $('#paginate_container').addClass('d-none');
                        $('.review_list_container').append(`
                            <div class="col-xxl-12 col-lg-12">
                                <div class="card shadow-none">
                                    <div class="card-body d-flex align-items-center justify-content-center">
                                        <span class="text-center text-black">${$('.review_list_container').data('empty')}</span>
                                    </div>
                                </div>
                            </div>
                        `);
                    }

                    let paginationLinks = '';

                    paginationLinks += `
                        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="javascript:void(0);" onclick="getReviewList(${currentPage - 1});">${$('.review_list_container').data('prev')}</a>
                        </li>
                    `;

                    for (let i = 1; i <= lastPage; i++) {
                        paginationLinks += `
                            <li class="page-item ${i === currentPage ? 'active' : ''}">
                                <a class="page-link" href="javascript:void(0);" onclick="getReviewList(${i});">${i}</a>
                            </li>
                        `;
                    }

                    paginationLinks += `
                        <li class="page-item ${currentPage === lastPage ? 'disabled' : ''}">
                            <a class="page-link" href="javascript:void(0);" onclick="getReviewList(${currentPage + 1});">${$('.review_list_container').data('next')}</a>
                        </li>
                    `;

                    $('#pagination_links').html(paginationLinks);
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }

    $(document).on('click', '.delete_review_btn', function() {
        var id = $(this).data('id');
        $('#deleteReviewConfirm').data('id', id);
    });

    $(document).on('click', '#deleteReviewConfirm', function(e) {
        e.preventDefault();

        var id = $(this).data('id');

        $.ajax({
            url: "/api/delete-review",
            type: "POST",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            data: {
                review_id: id,
            },
            beforeSend: function () {
                $("#deleteReviewConfirm").attr("disabled", true).html(
                    '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                );
            },
            success: function (response) {
                $("#deleteReviewConfirm").removeAttr("disabled").html($('#deleteReviewConfirm').data('delete'));

                if (response.code === 200) {
                    $('#del-review').modal('hide');
                    toastr.success(response.message);
                    getReviewList(1);
                }
            },
            error: function (error) {
                $("#deleteReviewConfirm").removeAttr("disabled").html($('#deleteReviewConfirm').data('delete'));
                toastr.error(error.responseJSON.message);
            },
        });
    });

}

    function getcurrency() {
        $.ajax({
            url: '/api/getdefaultcurrency', // Laravel route
            type: 'POST',
            success: function (response) {
                currency='$';
                if (response.code== 200) {
                    if(response.data!=''){
                        currency=response.data['symbol'];
                    }
                }
                return currency;
            },
            error: function (xhr) {
                toastr.error('Error:', xhr.responseText);
            }
        });

    }




    $("#service_price").on("input", function () {
        $(this).val($(this).val().replace(/[^0-9]/g, ""));

        if ($(this).val().length > 5) {
            $(this).val($(this).val().slice(0, 5));
        }
    });

    $("#fixed_price").on("input", function () {
        $(this).val($(this).val().replace(/[^0-9]/g, ""));

        if ($(this).val().length > 5) {
            $(this).val($(this).val().slice(0, 5));
        }
    });

    var currentLang = $('body').data('lang');

    const validationMessage = {
        en: {
            source_name: {
                required: "The name field is required.",
                minlength: "The name must be at least 5 characters.",
                maxlength: "The name cannot exceed 255 characters.",
            },
            source_code: {
                required: "The service code is required.",
                minlength: "The service code must be at least 3 characters.",
                maxlength: "The service code cannot exceed 100 characters.",
            },
            category: {
                required: "Please select a category.",
            },
            Subcategory_fied: {
                required: "Please select a subcategory.",
            },
            source_desc: {
                required: "The description is required.",
                minlength: "The description must be at least 10 characters.",
            },
            price_type: {
                required: "Please select a price type.",
            },
            fixed_price: {
                required: "The price is required.",
                number: "The price must be a valid number.",
            },
            "source_country[]": {
                required: "Please select at least one country.",
            },
            "source_city[]": {
                required: "Please select at least one city.",
            },
            "service_name[]": {
                required: "The service name is required.",
                minlength: "The service name must be at least 3 characters.",
            },
            "service_price[]": {
                required: "The service price is required.",
                number: "The service price must be a valid number.",
            },
            "service_desc[]": {
                required: "The service description is required.",
                minlength: "The service description must be at least 10 characters.",
            },
            seo_title: {
                required: "The SEO title is required.",
                maxlength: "The SEO title cannot exceed 100 characters.",
            },
            tags: {
                required: "Please enter tags.",
                minlength: "Tags must be at least 3 characters.",
            },
            content: {
                required: "The SEO description is required.",
                minlength: "The SEO description must be at least 10 characters.",
            },
            "logo[]": {
                required: "The service image is required.",
                extension: "Only JPG, JPEG, PNG, and SVG files are allowed.",
            },
        },
        ar: {
            source_name: {
                required: "حقل الاسم مطلوب.",
                minlength: "يجب أن يكون الاسم على الأقل 5 أحرف.",
                maxlength: "لا يمكن أن يتجاوز الاسم 255 حرفًا.",
            },
            source_code: {
                required: "حقل رمز الخدمة مطلوب.",
                minlength: "يجب أن يكون رمز الخدمة على الأقل 3 أحرف.",
                maxlength: "لا يمكن أن يتجاوز رمز الخدمة 100 حرف.",
            },
            category: {
                required: "يرجى اختيار الفئة.",
            },
            Subcategory_fied: {
                required: "يرجى اختيار الفئة الفرعية.",
            },
            source_desc: {
                required: "الوصف مطلوب.",
                minlength: "يجب أن يكون الوصف على الأقل 10 أحرف.",
            },
            price_type: {
                required: "يرجى اختيار نوع السعر.",
            },
            fixed_price: {
                required: "السعر مطلوب.",
                number: "يجب أن يكون السعر رقمًا صالحًا.",
            },
            "source_country[]": {
                required: "يرجى اختيار بلد واحد على الأقل.",
            },
            "source_city[]": {
                required: "يرجى اختيار مدينة واحدة على الأقل.",
            },
            "service_name[]": {
                required: "اسم الخدمة مطلوب.",
                minlength: "يجب أن يكون اسم الخدمة على الأقل 3 أحرف.",
            },
            "service_price[]": {
                required: "سعر الخدمة مطلوب.",
                number: "يجب أن يكون سعر الخدمة رقمًا صالحًا.",
            },
            "service_desc[]": {
                required: "وصف الخدمة مطلوب.",
                minlength: "يجب أن يكون وصف الخدمة على الأقل 10 أحرف.",
            },
            seo_title: {
                required: "عنوان تحسين محركات البحث (SEO) مطلوب.",
                maxlength: "لا يمكن أن يتجاوز عنوان تحسين محركات البحث (SEO) 100 حرف.",
            },
            tags: {
                required: "يرجى إدخال العلامات.",
                minlength: "يجب أن تكون العلامات على الأقل 3 أحرف.",
            },
            content: {
                required: "وصف تحسين محركات البحث (SEO) مطلوب.",
                minlength: "يجب أن يكون وصف تحسين محركات البحث (SEO) على الأقل 10 أحرف.",
            },
            "logo[]": {
                required: "صورة الخدمة مطلوبة.",
                extension: "يُسمح فقط بملفات JPG و JPEG و PNG و SVG.",
            },

        },
    };

    $(document).ready(function () {
        $("#adminUpdateService").validate({
            rules: {
                source_name: {
                    required: true,
                    minlength: 5,
                    maxlength: 255,
                },
                source_code: {
                    required: true,
                    minlength: 3,
                    maxlength: 100,
                },
                category: {
                    required: true,
                },
                Subcategory_fied: {
                    required: true,
                },
                source_desc: {
                    required: true,
                    minlength: 10,
                },
                price_type: {
                    required: true,
                },
                fixed_price: {
                    required: true,
                    number: true,
                },
                "source_country[]": {
                    required: false,
                },
                "source_city[]": {
                    required: false,
                },
                "service_name[]": {
                    minlength: 3,
                },
                "service_price[]": {
                    number: true,
                },
                "service_desc[]": {
                    minlength: 10,
                },
                seo_title: {
                    required: true,
                    maxlength: 100,
                },
                tags: {
                    required: true,
                    minlength: 3,
                },
                content: {
                    required: true,
                    minlength: 10,
                },
                "logo[]": {
                    required: false,
                    extension: "jpg|jpeg|png|svg",
                },
            },
            messages: validationMessage[currentLang],
            errorElement: "span",
            errorPlacement: function (error, element) {
                error.addClass("invalid-feedback");
                element.closest(".mb-3").append(error);
            },
            highlight: function (element, errorClass, validClass) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass("is-invalid").addClass("is-valid");
            },
            submitHandler: function (form) {
                // Allow form submission
                form.submit();
            }
        });
    });

    $(".categoryProviderSelect").on("change", function () {
        const categoryId = $(this).val();

        const subcategoriesDropdown = $(".subcategories");

        if (categoryId) {
            fetchSubcategories(categoryId);
        }
    });

    function fetchSubcategories(categoryId, selectedSubcategory = null) {
        $.ajax({
            url: "/get-subcategories",
            type: "POST",
            data: { category_id: categoryId },
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (data) {
                let subcategoriesHtml =
                    '<option value="">Select Sub Category</option>';
                data.forEach((subcategory) => {
                    subcategoriesHtml += `<option value="${subcategory.id}" ${
                        subcategory.id == selectedSubcategory ? "selected" : ""
                    }>${subcategory.name}</option>`;
                });
                $(".subcategories").html(subcategoriesHtml);
            },
            error: function (xhr) {
                const errorMessage =
                    xhr.responseJSON && xhr.responseJSON.error
                        ? xhr.responseJSON.error
                        : "Failed to fetch subcategories. Please try again.";
                toastr.error("Error:", errorMessage);
            },
        });
    }

    $(document).ready(function () {
        let selectedFiles = new DataTransfer();

        $('#logo').on('change', function (event) {
            const files = event.target.files;
            for (let i = 0; i < files.length; i++) {
                selectedFiles.items.add(files[i]);
            }
            this.files = selectedFiles.files;
        });
    });

    const logoInput = document.getElementById('logo');
	if (logoInput) {
     logoInput.addEventListener('change', function(event) {
        const files = event.target.files;
        const previewContainer = document.getElementById('image_preview_container');
        // previewContainer.innerHTML = ''; // Clear any previous previews

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();

          reader.onload = function(e) {
            // Create a div for the image preview and delete button
            const imageDiv = document.createElement('div');
            imageDiv.classList.add('image-preview');
            imageDiv.classList.add('position-relative');
            imageDiv.classList.add('mb-3');

            const image = document.createElement('img');
            image.src = e.target.result;
            image.classList.add('img-thumbnail');
            image.classList.add('border');
            image.style.width = '155px';
            image.style.height = '155px';

            // Create a delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn');
            deleteButton.classList.add('btn-danger');
            deleteButton.classList.add('position-absolute');
            deleteButton.classList.add('top-0');
            deleteButton.classList.add('end-0');
            deleteButton.textContent = 'X';

            // Append image and delete button to the image div
            imageDiv.appendChild(image);
            imageDiv.appendChild(deleteButton);

            // Append the div to the preview container
            previewContainer.appendChild(imageDiv);

            // Delete image on button click
            deleteButton.addEventListener('click', function() {
              imageDiv.remove();
            });
          };

          // Read the image file
          reader.readAsDataURL(file);
        }
      });
    }


      $(document).ready(function () {
        let selectedFiles = new DataTransfer();

        $('#logo').on('change', function (event) {
            const files = event.target.files;
            for (let i = 0; i < files.length; i++) {
                selectedFiles.items.add(files[i]);
            }
            this.files = selectedFiles.files;
        });
    });
    const logonew = document.getElementById('logonew');
	if (logonew) {
        logonew.addEventListener('change', function(event) {
        const files = event.target.files;
        const previewContainer = document.getElementById('image_preview_container');
        // previewContainer.innerHTML = ''; // Clear any previous previews

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();

          reader.onload = function(e) {
            // Create a div for the image preview and delete button
            const imageDiv = document.createElement('div');
            imageDiv.classList.add('image-preview');
            imageDiv.classList.add('position-relative');
            imageDiv.classList.add('mb-3');

            const image = document.createElement('img');
            image.src = e.target.result;
            image.classList.add('img-thumbnail');
            image.classList.add('border');
            image.style.width = '155px';
            image.style.height = '155px';

            // Create a delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn');
            deleteButton.classList.add('btn-danger');
            deleteButton.classList.add('position-absolute');
            deleteButton.classList.add('top-0');
            deleteButton.classList.add('end-0');
            deleteButton.textContent = 'X';

            // Append image and delete button to the image div
            imageDiv.appendChild(image);
            imageDiv.appendChild(deleteButton);

            // Append the div to the preview container
            previewContainer.appendChild(imageDiv);

            // Delete image on button click
            deleteButton.addEventListener('click', function() {
              imageDiv.remove();
            });
          };

          // Read the image file
          reader.readAsDataURL(file);
        }
      });
    }
      // Check if the image exists
 function checkImageExists(imageUrl, callback) {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = imageUrl;
}


$(document).ready(function () {
    $('.language-select').on('click', function () {
        const languageId = $(this).data('id');
        const url = `/adminLanguagedefault/${languageId}`; // Use template literals to include languageId in the URL

        $.ajax({
            url: url,
            method: 'GET',
            data: {
                _token: '{{ csrf_token() }}' // CSRF token for security
            },
            success: function (response) {
                location.reload();
                if (response.success) {

                } else {
                    // toastr.error(response.message || 'Failed to update language.');
                }
            },

            error: function (xhr, status, error) {
                toastr.error('An error occurred: ' + error);
            }
        });
    });
});
function searchInJson(keyToSearch, jsonData) {
    keyToSearch = keyToSearch.toLowerCase();
    let result = '';

    $.each(jsonData, function (key, value) {
        if (key.toLowerCase().includes(keyToSearch)) {
            result = value;
        }
    });

    if (result) {
        return result;
    }
}

function loadJsonFile(searchKey, callback) {
    const jsonFilePath = '/lang/ar.json';
    $.getJSON(jsonFilePath, function (data) {
        let lang = searchInJson(searchKey, data);
        callback(lang);
    }).fail(function () {
        alert('Failed to load JSON file.');
    });
}
if(pageValue=='admin.ticket' || pageValue=='staff.tickets'){
    applyTicketStatusStyles();
    function   applyTicketStatusStyles(){
        $('.ticket-status').each(function (index) {
            const status = $(this).data('status');
            let statusClass = '';
            let statusText = '';

            // Define status classes and texts
            switch (status) {
                case 1:
                    statusText = 'Open';
                    statusClass = 'badge badge-primary-transparent ms-2';
                    break;
                case 2:
                    statusText = 'Inprogress';
                    statusClass = 'badge badge-soft-info ms-2';
                    break;
                case 3:
                    statusText = 'Assigned';
                    statusClass = 'badge badge-soft-warning ms-2';
                    break;
                case 4:
                    statusText = 'Closed';
                    statusClass = 'badge badge-soft-success ms-2';
                    break;
                default:
                    statusText = 'Unknown';
                    statusClass = 'status-unknown';
            }

            const $this = $(this);

            $this.addClass(statusClass);
        });
    }
    applypriorityStatusStyles();

    function   applypriorityStatusStyles(){
        $('.priority-status').each(function (index) {
            const status = $(this).data('status');
            let statusClass = '';
            let statusText = '';

            // Define status classes and texts
            switch (status) {
                case "High":
                    statusText = 'High';
                    statusClass = 'badge badge-danger';
                    break;
                case "Medium":
                    statusText = 'Medium';
                    statusClass = 'badge badge-orange';
                    break;
                case "Low":
                    statusText = 'Low';
                    statusClass = 'badge badge-warning';
                    break;
                default:
                    statusText = 'Unknown';
                    statusClass = 'status-unknown';
            }

            const $this = $(this);

            $this.addClass(statusClass);
        });
    }
    function storeTicketId(ticketId) {
        // Send an AJAX request to store the ticket ID in the session
        fetch('/store-ticket-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ ticket_id: ticketId })
        })
        .then(response => response.json())
        .then(data => {
            var currentPath = window.location.pathname;
            // Redirect to the ticket details page
            if(currentPath=='/admin/tickets'){
               window.location.href = "/admin/ticket-details";
            }else{
                window.location.href = "/staff/ticketdetails";
            }
        })
        .catch(error => {
            console.error('Error storing ticket ID:', error);
        });
    }

     $(document).ready(function () {
        $('#summernote').summernote();
        $('.assignid').on('click',function(){
            var id=$(this).data('id');
            $('.ticketid').val(id);
        })
        $('#assignticketform').on('submit', function (event) {
            event.preventDefault();
            var userid=$('#user_id').val();
            var username=$('#user_id option:selected').text();
            var id=$('input[name="ticket_id"]').val();
            if(userid!=''){
                let formData = {
                    id: id,
                    user_id: $('#user_id').val(),
                    auth_id: $('.auth_id').val(),
                    status:'2',
                    type: 'assignticket'
                };
                $.ajax({
                    url: '/api/updateticketstatus',
                    type: 'POST',
                    data:formData,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $("#assignticket").attr("disabled", true).html('<div class="spinner-border text-light" role="status"></div>');
                    }
                })
                .done((response) => {
                    $("#assignticket").removeAttr("disabled").html("Save");

                    if (response.code=='200') {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $('#assign_ticket').modal('hide');
                        var assigndata=$('.assigneddetails'+id);
                        var assignhtml=`<img src="${response.data.assinee_profile_image}" class="avatar avatar-xs rounded-circle me-2" alt="img">
                                                    Assigned to <span class="text-dark ms-1 assigneename">${username}</span>`;
                        assigndata.append(assignhtml);
                        $('#assignBtn'+ id).addClass('d-none');
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $("#assignticket").removeAttr("disabled").html("Save");

                    if (error.status === 422) {
                        $.each(error.responseJSON.errors, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr.error('An error occurred while adding the data.');
                    }
                });
            }else{
                toastr.info('Please Select Assignee');
            }
        });
    });
}
if(pageValue=='admin.ticketdetails' || pageValue=='staff.ticketdetails'){
    applyTicketStatusStyles();
    function  applyTicketStatusStyles(){
        $('.ticket-status').each(function (index) {
            const status = $(this).data('status');
            let statusClass = '';
            let statusText = '';

            // Define status classes and texts
            switch (status) {
                case 1:
                    statusText = 'Open';
                    statusClass = 'badge badge-primary-transparent ms-2';
                    break;
                case 2:
                    statusText = 'Inprogress';
                    statusClass = 'badge badge-soft-info ms-2';
                    break;
                case 3:
                    statusText = 'Assigned';
                    statusClass = 'badge badge-soft-warning ms-2';
                    break;
                case 4:
                    statusText = 'Closed';
                    statusClass = 'badge badge-soft-success ms-2';
                    break;
                default:
                    statusText = 'Unknown';
                    statusClass = 'status-unknown';
            }

            const $this = $(this);
            $this.addClass(statusClass);

        });
    }
    applypriorityStatusStyles();

    function   applypriorityStatusStyles(){
        $('.priority-status').each(function (index) {
            const status = $(this).data('status');
            let statusClass = '';
            let statusText = '';

            // Define status classes and texts
            switch (status) {
                case "High":
                    statusText = 'High';
                    statusClass = 'badge badge-danger';
                    break;
                case "Medium":
                    statusText = 'Medium';
                    statusClass = 'badge badge-orange';
                    break;
                case "Low":
                    statusText = 'Low';
                    statusClass = 'badge badge-warning';
                    break;
                default:
                    statusText = 'Unknown';
                    statusClass = 'status-unknown';
            }

            const $this = $(this);

            $this.addClass(statusClass);
        });
    }
    $(document).ready(function () {
        $('#summernote').summernote();
        $('#replyform').on('submit', function (event) {
            event.preventDefault();
            var summernoteContent = $('#summernote').summernote('code');
            // Set the content to the target field
            $('.description').val(summernoteContent);
            if(summernoteContent!=''){
                let formData = {
                    ticket_id: $('.ticket_id').val(),
                    user_id: $('.user_id').val(),
                    description:summernoteContent
                };
                $.ajax({
                    url: '/api/ticket/storehistory',
                    type: 'POST',
                    data:formData,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json'
                    },
                    beforeSend: function () {
                        $("#postreply").attr("disabled", true).html('<div class="spinner-border text-light" role="status"></div>');
                    }
                })
                .done((response) => {
                    $("#postreply").removeAttr("disabled").html("Post");

                    if (response.code=='200') {
                        if (languageId === 2) {
                            loadJsonFile(response.message, function (langtst) {
                                toastr.success(langtst);
                            });
                        }else{
                            toastr.success(response.message);
                        }
                        $('#add_reply').modal('hide');
                        let commentsSection = document.getElementById('comments-section');
                        let newCommentDiv = document.createElement('div');
                        newCommentDiv.innerHTML =  response.comments.trim();
                        commentsSection.prepend(newCommentDiv.firstElementChild);
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".add_ticket_btn").removeAttr("disabled").html("Save");

                    if (error.status === 422) {
                        $.each(error.responseJSON.errors, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr.error('An error occurred while adding the data.');
                    }
                });
            }else{
                toastr.info('Please Select Assignee');
            }
        });
    });
    $('.updatestatus').click(function(){
        var oldstatus=$(this).data('status');
        var ticketid=$(this).data('ticket_id');
        var status=$('.status').val();
        var statusname=$('.status option:selected').text();
        var adminid=localStorage.getItem('user_id');
        var assignid=$('#assign_id').val();
        if(oldstatus!=status){
            let formData = {
                id: ticketid,
                status:status,
                auth_id:adminid,
                assign_id:assignid
            };
            $.ajax({
                url: '/api/updateticketstatus',
                type: 'POST',
                data:formData,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                    'Accept': 'application/json'
                },
                beforeSend: function () {
                    $(".updatestatus").attr("disabled", true).html('<div class="spinner-border text-light" role="status"></div>');
                }
            })
            .done((response) => {
                $(".updatestatus").removeAttr("disabled").html("Update Ticket Status");
                if (response.code=='200') {
                    $('.ticketstatus' + ticketid).text(statusname);
                    $('.ticket-status').attr('data-status', status);
                    if (status == 4) {
                        $('#ticketCloseDate').removeClass('d-none');
                    } else {
                        $('#ticketCloseDate').addClass('d-none');
                    }
                    applyTicketStatusStyles();
                    if (languageId === 2) {
                        loadJsonFile(response.message, function (langtst) {
                            toastr.success(langtst);
                        });
                    }else{
                        toastr.success(response.message);
                    }
                } else {
                    toastr.error(response.message);
                }
            })
            .fail((error) => {
                $(".updatestatus").removeAttr("disabled").html("Update Ticket Status");

                if (error.status === 422) {
                    $.each(error.responseJSON.errors, function (key, val) {
                        $("#" + key).addClass("is-invalid");
                        $("#" + key + "_error").text(val[0]);
                    });
                } else {
                    toastr.error('An error occurred while adding the data.');
                }
            });
        }else{
            toastr.info('Please Change Ticket Status');
        }
    })
}

if (pageValue === 'admin.staffs') {

    $(document).ready(function () {
        $('.selects').select2();
        getStaffList();
        getRoles();

        $('#staffForm').validate({
            rules: {
                first_name: {
                    required: true,
                    maxlength: 100,
                    pattern: /^[a-zA-Z]+$/
                },
                last_name: {
                    required: true,
                    maxlength: 100,
                    pattern: /^[a-zA-Z]+$/
                },
                user_name: {
                    required: true,
                    maxlength: 100,
                    remote: {
                        url: '/api/user/check-unique',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            user_name: function() {
                                return $('#user_name').val();
                            },
                            id: function() {
                                return $('#id').val();
                            },
                        }
                    }
                },
                email: {
                    required: true,
                    email: true,
                    remote: {
                        url: '/api/user/check-unique',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            email: function() {
                                return $('#email').val();
                            },
                            id: function() {
                                return $('#id').val();
                            },
                        }
                    }
                },
                phone_number: {
                    required: true,
                    minlength: 10,
                    maxlength: 12
                },
                gender: {
                    required: true
                },
                dob: {
                    required: false,
                },
                address: {
                    required: false,
                    maxlength: 150
                },
                country: {
                    required: false
                },
                state: {
                    required: false
                },
                city: {
                    required: false
                },
                postal_code: {
                    required: false,
                    maxlength: 6,
                    pattern: /^[a-zA-Z0-9]*$/
                },
                profile_image: {
                    extension: "jpeg|jpg|png",
                    filesize: 2048,
                },
                role_id: {
                    required: true
                },
            },
            messages: {
                first_name: {
                    required: $('#first_name_error').data('required'),
                    maxlength: $('#first_name_error').data('max'),
                    pattern: $('#first_name_error').data('alpha'),
                },
                last_name: {
                    required: $('#last_name_error').data('required'),
                    maxlength: $('#last_name_error').data('max'),
                    pattern: $('#last_name_error').data('alpha'),
                },
                user_name: {
                    required: $('#user_name_error').data('required'),
                    maxlength: $('#user_name_error').data('max'),
                    remote: $('#user_name_error').data('exists'),
                },
                email: {
                    required: $('#email_error').data('required'),
                    email: $('#email_error').data('format'),
                    remote: $('#email_error').data('exists'),
                },
                phone_number: {
                    required: $('#phone_number_error').data('required'),
                    minlength: $('#phone_number_error').data('between'),
                    maxlength: $('#phone_number_error').data('between'),
                },
                gender: {
                    required: $('#gender_error').data('required'),
                },
                dob: {
                    required: "Date of birth is required.",
                    date: "Please enter a valid date."
                },
                address: {
                    required: $('#address_error').data('required'),
                    maxlength: $('#address_error').data('max'),
                },
                country: {
                    required: $('#country_error').data('required'),
                },
                state: {
                    required: $('#state_error').data('required'),
                },
                city: {
                    required: $('#city_error').data('required'),
                },
                postal_code: {
                    required: $('#postal_code_error').data('required'),
                    maxlength: $('#postal_code_error').data('max'),
                    pattern: $('#postal_code_error').data('char'),
                },
                profile_image: {
                    extension: $('#profile_image_error').data('extension'),
                    filesize: $('#profile_image_error').data('size'),
                },
            },
            errorPlacement: function (error, element) {
                if (element.hasClass("select2-hidden-accessible")) {
                    var errorId = element.attr("id") + "_error";
                    $("#" + errorId).text(error.text());
                } else {
                    var errorId = element.attr("id") + "_error";
                    $("#" + errorId).text(error.text());
                }
            },
            highlight: function (element) {
                if ($(element).hasClass("select2-hidden-accessible")) {
                    $(element).next(".select2-container").addClass("is-invalid").removeClass('is-valid');
                }
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element) {
                if ($(element).hasClass("select2-hidden-accessible")) {
                    $(element).next(".select2-container").removeClass("is-invalid").addClass('is-valid');
                }
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                $('#parent_id').val(localStorage.getItem('user_id'));

                var formData = new FormData(form);
                formData.set("status", $("#status").is(":checked") ? 1 : 0);

                $.ajax({
                    url: "/api/save-admin-details",
                    type: "POST",
                    data: formData,
                    enctype: "multipart/form-data",
                    contentType: false,
                    processData: false,
                    cache: false,
                    beforeSend: function () {
                        $("#staff_save_btn").attr("disabled", true).html(
                            '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                        );
                    },
                    success: function (response) {
                        if ($.fn.DataTable.isDataTable('#staffTable')) {
                            $('#staffTable').DataTable().destroy();
                        }
                        $(".error-text").text("");
                        $("#staff_save_btn").removeAttr("disabled").html($('#staff_save_btn').data('save'));
                        $(".form-control").removeClass("is-invalid is-valid");
                        $(".select2-container").removeClass('is-invalid is-valid');
                        if (response.code === 200) {
                            toastr.success(response.message);
                            $('#add_staff_modal').modal('hide');
                            getStaffList();
                        }
                    },
                    error: function (error) {
                        $(".error-text").text("");
                        $("#staff_save_btn").removeAttr("disabled").html($('#staff_save_btn').data('save'));
                        $(".form-control").removeClass("is-invalid is-valid");
                        $(".select2-container").removeClass('is-invalid is-valid');
                        if (error.responseJSON.code === 422) {
                            $.each(error.responseJSON.errors, function(key, val) {
                                $("#" + key).addClass("is-invalid");
                                $("#" + key + "_error").text(val[0]);
                            });
                        } else {
                            toastr.error(error.responseJSON.message);
                        }
                    }
                });

            }
        });

        $('#editStaffForm').validate({
            rules: {
                first_name: {
                    required: true,
                    maxlength: 100,
                    pattern: /^[a-zA-Z]+$/
                },
                last_name: {
                    required: true,
                    maxlength: 100,
                    pattern: /^[a-zA-Z]+$/
                },
                user_name: {
                    required: true,
                    maxlength: 100,
                    remote: {
                        url: '/api/user/check-unique',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            user_name: function() {
                                return $('#edit_user_name').val();
                            },
                            id: function() {
                                return $('#id').val();
                            },
                        }
                    }
                },
                email: {
                    required: true,
                    email: true,
                    remote: {
                        url: '/api/user/check-unique',
                        type: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                            'Accept': 'application/json'
                        },
                        data: {
                            email: function() {
                                return $('#edit_email').val();
                            },
                            id: function() {
                                return $('#id').val();
                            },
                        }
                    }
                },
                phone_number: {
                    required: true,
                    minlength: 10,
                    maxlength: 12
                },
                gender: {
                    required: true
                },
                dob: {
                    required: false,
                },
                address: {
                    required: false,
                    maxlength: 150
                },
                country: {
                    required: false
                },
                state: {
                    required: false
                },
                city: {
                    required: false
                },
                postal_code: {
                    required: false,
                    maxlength: 6,
                    pattern: /^[a-zA-Z0-9]*$/
                },
                profile_image: {
                    extension: "jpeg|jpg|png",
                    filesize: 2048,
                },
                role_id: {
                    required: true
                },
            },
            messages: {
                first_name: {
                    required: $('#first_name_error').data('required'),
                    maxlength: $('#first_name_error').data('max'),
                    pattern: $('#first_name_error').data('alpha'),
                },
                last_name: {
                    required: $('#last_name_error').data('required'),
                    maxlength: $('#last_name_error').data('max'),
                    pattern: $('#last_name_error').data('alpha'),
                },
                user_name: {
                    required: $('#user_name_error').data('required'),
                    maxlength: $('#user_name_error').data('max'),
                    remote: $('#user_name_error').data('exists'),
                },
                email: {
                    required: $('#email_error').data('required'),
                    email: $('#email_error').data('format'),
                    remote: $('#email_error').data('exists'),
                },
                phone_number: {
                    required: $('#phone_number_error').data('required'),
                    minlength: $('#phone_number_error').data('between'),
                    maxlength: $('#phone_number_error').data('between'),
                },
                gender: {
                    required: $('#gender_error').data('required'),
                },
                dob: {
                    required: "Date of birth is required.",
                    date: "Please enter a valid date."
                },
                address: {
                    required: $('#address_error').data('required'),
                    maxlength: $('#address_error').data('max'),
                },
                country: {
                    required: $('#country_error').data('required'),
                },
                state: {
                    required: $('#state_error').data('required'),
                },
                city: {
                    required: $('#city_error').data('required'),
                },
                postal_code: {
                    required: $('#postal_code_error').data('required'),
                    maxlength: $('#postal_code_error').data('max'),
                    pattern: $('#postal_code_error').data('char'),
                },
                profile_image: {
                    extension: $('#profile_image_error').data('extension'),
                    filesize: $('#profile_image_error').data('size'),
                },
            },
            errorPlacement: function (error, element) {
                if (element.hasClass("select2-hidden-accessible")) {
                    var errorId = element.attr("id") + "_error";
                    $("#" + errorId).text(error.text());
                } else {
                    var errorId = element.attr("id") + "_error";
                    $("#" + errorId).text(error.text());
                }
            },
            highlight: function (element) {
                if ($(element).hasClass("select2-hidden-accessible")) {
                    $(element).next(".select2-container").addClass("is-invalid").removeClass('is-valid');
                }
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element) {
                if ($(element).hasClass("select2-hidden-accessible")) {
                    $(element).next(".select2-container").removeClass("is-invalid").addClass('is-valid');
                }
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                var formData = new FormData(form);
                formData.set("status", $("#edit_status").is(":checked") ? 1 : 0);
                formData.append('parent_id', localStorage.getItem('user_id'));

                $.ajax({
                    url: "/api/save-admin-details",
                    type: "POST",
                    data: formData,
                    enctype: "multipart/form-data",
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json',
                        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
                    },
                    beforeSend: function () {
                        $("#staff_edit_btn").attr("disabled", true).html(
                            '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                        );
                    },
                    success: function (response) {
                        if ($.fn.DataTable.isDataTable('#staffTable')) {
                            $('#staffTable').DataTable().destroy();
                        }
                        $(".error-text").text("");
                        $("#staff_edit_btn").removeAttr("disabled").html($('#staff_edit_btn').data('save'));
                        $(".form-control").removeClass("is-invalid is-valid");
                        $(".select2-container").removeClass('is-invalid is-valid');
                        if (response.code === 200) {
                            toastr.success(response.message);
                            $('#edit_staff_modal').modal('hide');
                            getStaffList();
                        }
                    },
                    error: function (error) {
                        $(".error-text").text("");
                        $("#staff_edit_btn").removeAttr("disabled").html($('#staff_edit_btn').data('save'));
                        $(".form-control").removeClass("is-invalid is-valid");
                        $(".select2-container").removeClass('is-invalid is-valid');
                        if (error.responseJSON.code === 422) {
                            $.each(error.responseJSON.errors, function(key, val) {
                                $("#" + key).addClass("is-invalid");
                                $("#" + key + "_error").text(val[0]);
                            });
                        } else {
                            toastr.error(error.responseJSON.message);
                        }
                    }
                });

            }
        });

        $.validator.addMethod("filesize", function (value, element, param) {
            if (element.files.length === 0) return true;
            return element.files[0].size <= param * 1024;
        }, "File size must be less than {0} KB.");

    });


    $("#phone_number").on("input", function () {
        $(this).val($(this).val().replace(/[^0-9]/g, ""));
        if ($(this).val().length > 12) {
            $(this).val($(this).val().slice(0, 12));
        }
    });

    $("#postal_code").on("input", function () {
        if ($(this).val().length > 6) {
            $(this).val($(this).val().slice(0, 6));
        }
    });

    $("#edit_phone_number").on("input", function () {
        $(this).val($(this).val().replace(/[^0-9]/g, ""));
        if ($(this).val().length > 12) {
            $(this).val($(this).val().slice(0, 12));
        }
    });

    $("#edit_postal_code").on("input", function () {
        if ($(this).val().length > 6) {
            $(this).val($(this).val().slice(0, 6));
        }
    });

    $('#profile_image').on('change', function (event) {
        if ($(this).val() !== '') {
            $(this).valid();
        }
        let reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').attr('src', e.target.result).show();
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    $('#edit_profile_image').on('change', function (event) {
        if ($(this).val() !== '') {
            $(this).valid();
        }
        let reader = new FileReader();
        reader.onload = function (e) {
            $('#editImagePreview').attr('src', e.target.result).show();
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    $('#gender').on('change', function () {
        $(this).valid();
    });
    $('#country').on('change', function () {
        $(this).valid();
    });
    $('#state').on('change', function () {
        $(this).valid();
    });
    $('#city').on('change', function () {
        $(this).valid();
    });

    $('#country').on('change', function () {
        const selectedCountry = $(this).val();
        clearDropdown($('.state'));
        clearDropdown($('.city'));
        if (selectedCountry != '') {
            getStates(selectedCountry);
        }
    });

    $('#state').on('change', function () {
        const selectedState = $(this).val();
        clearDropdown($('.city'));
        getCities(selectedState);
    });

    $('#edit_country').on('change', function () {
        const selectedCountry = $(this).val();
        clearDropdown($('.state'));
        clearDropdown($('.city'));
        if (selectedCountry != '') {
            getStates(selectedCountry);
        }
    });

    $('#edit_state').on('change', function () {
        const selectedState = $(this).val();
        clearDropdown($('.city'));
        getCities(selectedState);
    });

    function getStates(selectedCountry = '', selectedState = '') {
        $.ajax({
            url: "/get-states",
            type: "GET",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            data: {
                country_id: selectedCountry
            },
            dataType: 'json',
            success: function (response) {
                if (response && response.data && response.data.length > 0) {
                    const stateDropdown = $('.state');
                    response.data.forEach(state => {
                        stateDropdown.append(`<option value="${state.id}" ${selectedState == state.id ? 'selected' : ''}>${state.name}</option>`);
                    });
                }
            },
            error: function (error) {
                $(".form-control").removeClass("is-invalid is-valid");
                if (error.responseJSON.code === 422) {
                    $.each(error.responseJSON.errors, function (key, val) {
                        $("#" + key + "_del").addClass("is-invalid");
                        $("#" + key + "_del_error").text(val[0]);
                    });
                } else {
                    toastr.error(error.responseJSON.message);
                }
            },
        });
    }

    function getCities(selectedState = '', selectedCity = '') {
        $.ajax({
            url: "/get-cities",
            type: "GET",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            data: {
                state_id: selectedState
            },
            dataType: 'json',
            success: function (response) {
                if (response && response.data && response.data.length > 0) {
                    const stateDropdown = $('.city');
                    response.data.forEach(city => {
                        stateDropdown.append(`<option value="${city.id}" ${selectedCity == city.id ? 'selected' : ''}>${city.name}</option>`);
                    });
                }
            },
            error: function (error) {
                $(".form-control").removeClass("is-invalid is-valid");
                if (error.responseJSON.code === 422) {
                    $.each(error.responseJSON.errors, function (key, val) {
                        $("#" + key + "_del").addClass("is-invalid");
                        $("#" + key + "_del_error").text(val[0]);
                    });
                } else {
                    toastr.error(error.responseJSON.message);
                }
            },
        });
    }

    function clearDropdown(dropdown) {
        dropdown.empty().append($('<option>', {
            value: '',
            text: 'Select',
            disabled: true,
            selected: true
        }));
    }

    $('#add_staff_btn').on('click', function() {
        const stateSelect = $('.state');
        clearDropdown(stateSelect);
        const citySelect = $('.city');
        clearDropdown(citySelect);
        $('#gender').val('').trigger('change');
        $('#country').val('').trigger('change');
        $('#role_id').val('').trigger('change');
        $('#imagePreview').attr('src', $('#imagePreview').data('image'));
        $(".form-control").removeClass("is-invalid is-valid");
        $(".select2-container").removeClass('is-invalid is-valid');
        $(".error-text").text("");
        $('#staffForm').trigger('reset');
        $('#id').val('');

    });

    function getRoles() {
        $.ajax({
            url: "/api/role/list",
            type: "POST",
            data: {
                user_id: localStorage.getItem('user_id')
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            dataType: 'json',
            success: function (response) {
                if (response && response.data && response.data.length > 0) {
                    response.data.forEach(role => {
                        $('.role-list').append(`<option value="${role.id}">${role.role_name}</option>`);
                    });
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            },
        });
    }

    function getStaffList() {
        var id = localStorage.getItem('user_id');
        $.ajax({
            url: "/api/admin/get-staff-list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "desc",
                sort_by: "id",
                id: id
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === 200) {

                    let staffs = response.data;
                    let tableBody = "";

                    if (staffs.length === 0) {
                        if ($.fn.DataTable.isDataTable('#staffTable')) {
                            $('#staffTable').DataTable().destroy();
                        }
                        tableBody += `
                            <tr>
                                <td colspan="7" class="text-center">${$('#staffTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        staffs.forEach((staff, index) => {
                            tableBody += `
                               <tr>
                                <td>${index + 1}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a href="#" class="avatar avatar-lg me-2">
                                            <img src="${staff.profile_image}" class="rounded-circle"
                                                alt="user">
                                        </a>
                                        <div>
                                            <h6 class="fs-14 fw-medium"><a href="#">${staff.first_name} ${staff.last_name}</a></h6>
                                            <span class="fs-12">${staff.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>${staff.created_at}</td>
                                ${ $('#has_permission').data('edit') == 1 ?
                                `<td>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input admin_staff_status" ${staff.status == 1 ? 'checked' : ''} type="checkbox" role="switch" id="switch-sm" data-id="${staff.id}">
                                    </div>
                                </td>` : ''
                                }
                                ${ $('#has_permission').data('visible') == 1 ?
                                `<td>
                                    <li style="list-style: none;">
                                    ${ $('#has_permission').data('edit') == 1 ?
                                    `<a href="javascript:void(0);" class="edit_staff_btn" data-bs-toggle="modal" data-bs-target="#edit_staff_modal"
                                        data-id = "${staff.id}"
                                        data-user_name = "${staff.user_name}"
                                        data-first_name = "${staff.first_name}"
                                        data-last_name = "${staff.last_name}"
                                        data-email = "${staff.email}"
                                        data-phone_number = "${staff.phone_number}"
                                        data-profile_image = "${staff.profile_image}"
                                        data-gender = "${staff.gender}"
                                        data-dob = "${staff.dob}"
                                        data-address = "${staff.address}"
                                        data-country_id = "${staff.country_id}"
                                        data-state_id = "${staff.state_id}"
                                        data-city_id = "${staff.city_id}"
                                        data-postal_code = "${staff.postal_code}"
                                        data-bio = "${staff.bio}"
                                        data-role = "${staff.role_id}"
                                        data-status = "${staff.status}" >
                                        <i class="ti ti-pencil m-2 fs-20"></i></a>` : '' }
                                    ${ $('#has_permission').data('delete') == 1 ?
                                    `<a href="javascript:void(0);" class="delete_staff_btn" data-id="${staff.id}" data-bs-toggle="modal" data-bs-target="#del-staff">
                                        <i class="ti ti-trash m-2 fs-20"></i></a>` : '' }
                                    </li>
                                </td>` : ''
                                }
                            </tr>
                            `;
                        });
                    }

                    $('#staffTable tbody').html(tableBody);
                    if ((staffs.length != 0) && !$.fn.DataTable.isDataTable('#staffTable')) {
                        $('#staffTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                } else {
                    toastr.error("An error occurred while fetching.");
                }
            },
        });
    }

    let initialPhoneNumber = null;

    $(document).on('click', '.edit_staff_btn', function() {

        $(".form-control").removeClass("is-invalid is-valid");
        $(".select2-container").removeClass('is-invalid is-valid');
        $(".error-text").text("");
        $('#staffForm').trigger('reset');

        const id = $(this).data('id');
        const user_name = $(this).data('user_name');
        const first_name = $(this).data('first_name');
        const last_name = $(this).data('last_name');
        const email = $(this).data('email');
        const phone_number = $(this).data('phone_number');
        const profile_image = $(this).data('profile_image');
        const gender = $(this).data('gender');
        const dob = $(this).data('dob');
        const bio = $(this).data('bio');
        const address = $(this).data('address');
        const country_id = $(this).data('country_id');
        const state_id = $(this).data('state_id');
        const city_id = $(this).data('city_id');
        const postal_code = $(this).data('postal_code');
        const status = $(this).data('status');
        const role = $(this).data('role');

        $('#edit_country').val(country_id).trigger('change');
        getStates(country_id, state_id);
        getCities(state_id, city_id);

        $('#id').val(id);
        $('#edit_user_name').val(user_name);
        $('#edit_first_name').val(first_name);
        $('#edit_last_name').val(last_name);
        $('#edit_email').val(email);
        if (profile_image) {
            $('#editImagePreview').attr('src', profile_image);
        } else {
            $('#editImagePreview').attr('src', $('#editImagePreview').data('image'));
        }
        $('#edit_gender').val(gender).trigger('change');
        $('#edit_address').val(address);
        $('#edit_dob').val(dob);
        $('#edit_postal_code').val(postal_code);
        $('#edit_bio').text(bio);
        $('#edit_status').prop('checked', status);
        $('#edit_role').val(role).trigger('change');

        const phoneNumber = phone_number.trim();
        const phoneInput = document.querySelector(".edit_staff_phone_number");
        const hiddenInput = document.querySelector("#edit_staff_phone_number");

        if ($(phoneInput).data('itiInstance')) {
            $(phoneInput).data('itiInstance').destroy();
        }
        const iti = intlTelInput(phoneInput, {
            utilsScript: window.location.origin + "/assets/plugins/intltelinput/js/utils.js",
            separateDialCode: true,
        });
        $(phoneInput).data('itiInstance', iti);

        if (phoneNumber) {
            iti.setNumber(phoneNumber);
            hiddenInput.value = iti.getNumber();
            initialPhoneNumber = phoneNumber;
        }

        phoneInput.addEventListener("countrychange", function() {
            const currentPhoneNumber = iti.getNumber();
            if (currentPhoneNumber !== initialPhoneNumber) {
                hiddenInput.value = currentPhoneNumber;
            }
        });

        if (!hiddenInput.value) {
            hiddenInput.value = initialPhoneNumber;
        }

    });

    $(document).on('click', '.delete_staff_btn', function() {
        var id = $(this).data('id');
        $('#confirm_staff_delete').data('id', id);
    });

    $(document).on('click', '#confirm_staff_delete', function(event) {
        event.preventDefault();

        var id = $(this).data('id');

        $.ajax({
            url: '/api/admin/delete-staff',
            type: 'POST',
            data: {
                id: id
            },
            dataType: 'json',
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === 200) {
                    toastr.success(response.message);
                    $('#del-staff').modal('hide');
                    getStaffList();
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            }
        });
    });

    $(document).on('change', '.admin_staff_status', function () {
        let id = $(this).data('id');
        let status = $(this).is(':checked') ? 1 : 0;

        var data = {
            'id': id,
            'status': status,
        };

        $.ajax({
            url: '/api/admin/staff-status-change',
            type: 'POST',
            data: data,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                if (response.code === 200) {
                    toastr.success(response.message);
                    getStaffList();
                }
            },
            error: function (error) {
                toastr.error('An error occurred while updating status');
            }
        });
    });
}

if (pageValue === 'set-password') {

    $(document).ready(function () {
        $('#setPasswordForm').validate({
            rules: {
                new_password: {
                    required: true,
                    minlength: 8,
                    notEqualTo: '#current_password'
                },
                confirm_password: {
                    required: true,
                    equalTo: '#new_password'
                }
            },
            messages: {
                new_password: {
                    required: $('#new_password_error').data('required'),
                    minlength: $('#new_password_error').data('min'),
                    notEqualTo: $('#new_password_error').data('not_equal')
                },
                confirm_password: {
                    required: $('#confirm_password_error').data('required'),
                    equalTo: $('#confirm_password_error').data('equal')
                }
            },
            errorPlacement: function (error, element) {
                var errorId = element.attr("id") + "_error";
                $("#" + errorId).text(error.text());
            },
            highlight: function (element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
                $('#' + element.id).siblings('span').addClass('me-3');
            },
            unhighlight: function (element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
                var errorId = element.id + "_error";
                $("#" + errorId).text("");
                $('#' + element.id).siblings('span').addClass('me-3');
            },
            onkeyup: function(element) {
                $(element).valid();
            },
            onchange: function(element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                var formData = new FormData(form);
                $.ajax({
                    url: "/update-password",
                    type: "POST",
                    data: formData,
                    contentType: false,
                    processData: false,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                        'Accept': 'application/json',
                        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
                    },
                    beforeSend: function () {
                        $("#set_password_btn").attr("disabled", true).html(
                            '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                        );
                    },
                    success: function (response) {
                        $(".error-text").text("");
                        $("#set_password_btn").removeAttr("disabled").html($('#set_password_btn').data('save'));
                        $(".form-control").removeClass("is-invalid is-valid");
                        $(".select2-container").removeClass('is-invalid is-valid');
                        if (response.code === 200) {
                            toastr.success(response.message);
                            window.location.href = response.redirectUrl;
                        }
                    },
                    error: function (error) {
                        $(".error-text").text("");
                        $("#set_password_btn").removeAttr("disabled").html($('#set_password_btn').data('save'));
                        $(".form-control").removeClass("is-invalid is-valid");
                        $(".select2-container").removeClass('is-invalid is-valid');
                        if (error.responseJSON.code === 422) {
                            $.each(error.responseJSON.errors, function(key, val) {
                                $("#" + key).addClass("is-invalid");
                                $("#" + key + "_error").text(val[0]);
                            });
                        } else {
                            toastr.error(error.responseJSON.message);
                        }
                    }
                });
            }
        });
    });


}
notificationcount();
function notificationcount(){
    var adminid=localStorage.getItem('user_id');

    $.ajax({
        url: '/api/notification/getnotificationcount',
        type: 'GET',
        data : {type: 'admin',authid: adminid},
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
            'Accept': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
            if (response.code== "200") {
                var data=response.data['unreadNotificationCount'];
                const belldiv=$(".bellcount");
                belldiv.empty();
                if(data>0){
                    const html=`<span class="notification-dot position-absolute start-80 translate-middle p-1 bg-danger border border-light rounded-circle">
                    </span>`;
                    belldiv.append(html);
                }
            } else {
                toastr.error(response.message);
            }
        },
        error: function(xhr, status, error) {
            if (languageId === 2) {
                loadJsonFile('error_occurred_fetching_data', function (langtst) {
                    toastr.error(langtst);
                });
            }else{
                toastr.error('An error occurred while fetching the data.');
            }
        }

    });
}
$('.notify-link').off('click').on('click', function () {
    notificationList();
});

// Attach click event for mark all as read
$(document).off('click', '.markallread').on('click', '.markallread', function (e) {
    e.preventDefault();
    e.stopPropagation();
    markAllRead();
});
function notificationList(){
    var adminid=localStorage.getItem('user_id');
    $.ajax({
        url: '/api/notification/notificationlist',
        type: 'GET',
        data : {type: 'admin',authid: adminid},
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
            'Accept': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
            if (response.code== "200") {
                var data=response.data['notifications'];
                var authuser=response.data['auth_user'];
                var count=response.data['count'];
                if(count!=0){
                    const belldiv=$("#notification-data");
                    belldiv.empty();
                    if(data!=""){
                        $('.notificationcount').text("("+response.data['count']+")");
                        data.forEach(val => {
                            const defaultimage =  '/assets/img/profile-default.png';
                            const profileImage ="";
                            if(authuser==val.from_user_id){
                                const profileImage = val.from_profileimg && val.from_profileimg !== 'N/A'
                                ? `/storage/profile/${val.from_profileimg}` : defaultimage;
                            }else{
                                const profileImage = val.to_profileimg && val.to_profileimg !== 'N/A'
                                ? `/storage/profile/${val.to_profileimg}` : defaultimage;
                            }
                            var bellhtml=`<div class="border-bottom mb-3 pb-3">
                                            <div class="d-flex">
                                                <span class="avatar avatar-lg me-2 flex-shrink-0">
                                                            <img src="${profileImage || defaultimage}" alt="Profile" class="rounded-circle">
                                                        </span>
                                                <div class="flex-grow-1">
                                                    <div class="d-flex align-items-center">
                                                    <p class="mb-1 w-100">`;
                                                        if(authuser==val.from_user_id){
                                                            if(val.from_description){
                                                                bellhtml+=`${val.from_description}</p>`;
                                                            }
                                                        }else{
                                                            if(val.to_description){
                                                                bellhtml+=`${val.to_description} </p>`;
                                                            }
                                                        }
                                                    bellhtml+=`<span class="d-flex justify-content-end "> <i class="ti ti-point-filled text-primary"></i></span>
                                                    </div>
                                                </div>
                                            </div>
                                    </div>`;
                                    belldiv.append(bellhtml);
                        });

                    }else{
                        var msg="No Data Found";
                        $('.notification-title').hide();
                        $('.markallread').hide();
                        $('.cancelnotify').hide();
                        $('.viewall').hide();
                        if (languageId === 2) {
                            loadJsonFile('No Data Found', function (langtst) {
                                msg=langtst;
                                bellhtml = `<div class="text-center">` + msg + `</div>`;
                                $('#notification-data').html(bellhtml);
                            });
                        }else{
                            bellhtml =`<div class="text-center">`+msg+`</div>`;
                            $('#notification-data').html(bellhtml);
                        }
                    }
                }else{
                    const belldiv=$("#notification-data");
                    belldiv.empty();
                    let msg="No New Notification Found";
                    if (languageId === 2) {
                        loadJsonFile(msg, function (langtst) {
                            msg=langtst;
                            bellhtml = `<div class="text-center">` + msg + `</div><br>`;
                            $('#notification-data').html(bellhtml);
                        });
                    }else{
                        bellhtml =`<div class="text-center">`+msg+`</div><br>`;
                        $('#notification-data').html(bellhtml);
                    }
                }
            } else {
                toastr.error(response.message);
            }
        },
        error: function(xhr, status, error) {
            if (languageId === 2) {
                loadJsonFile('error_occurred_fetching_data', function (langtst) {
                    toastr.error(langtst);
                });
            }else{
                toastr.error('An error occurred while fetching the data.');
            }
        }

    });
}
function markAllRead(){
    var adminid=localStorage.getItem('user_id');
    $.ajax({
        url: '/api/notification/updatereadstatus',
        type: 'POST',
        data : {type: 'admin' , authid : adminid},
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
            'Accept': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
            notificationcount(auth_provider_id);
            if (response.code== "200") {
                const belldiv=$("#notification-data");
                belldiv.empty();
                let msg="No New Notification Found";
                if (languageId === 2) {
                    loadJsonFile(msg, function (langtst) {
                        msg=langtst;
                        bellhtml = `<div class="text-center">` + msg + `</div>`;
                        $('#notification-data').html(bellhtml);
                    });
                }else{
                    bellhtml =`<div class="text-center">`+msg+`</div>`;
                    $('#notification-data').html(bellhtml);
                }
            }
        }, error: function(xhr, status, error) {
            if (languageId === 2) {
                loadJsonFile('error_occurred_update_data', function (langtst) {
                    toastr.error(langtst);
                });
            }else{
                toastr.error('An error occurred while update data.');
            }
        }

    });
}
$(".cancelnotify").on("click", function(e) {
    e.preventDefault(); // Prevent default link behavior
    $(".notification-dropdown").removeClass("show"); // Hide the dropdown
});


//file-storage
if (pageValue === "admin.file-storage") {
    function toggleCheckbox(currentId, otherId) {
        const currentCheckbox = document.getElementById(currentId);
        const otherCheckbox = document.getElementById(otherId);

        if (currentCheckbox.checked) {
            otherCheckbox.checked = false;
        }
    }

    $(document).ready(function () {
        loadAwsSetting();
    });

    function loadAwsSetting() {
        $.ajax({
            url: "/api/file-storage/list",
            type: "POST",
            data: { group_id: 20 },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
            },
            success: function (response) {
                if (response.code === 200) {
                    const requiredKeys = [
                        "aws_access_key",
                        "aws_secret_access_key",
                        "aws_region",
                        "aws_bucket",
                        "aws_url",
                        "aws_status",
                        "local_status",
                    ];

                    const filteredSettings = response.data.settings.filter(
                        (setting) => requiredKeys.includes(setting.key)
                    );

                    filteredSettings.forEach((setting) => {
                        if (setting.key === "aws_status") {
                            if (setting.value === "1") {
                                $("#aws_status").prop("checked", true);
                            } else {
                                $("#aws_status").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });

                    filteredSettings.forEach((setting) => {
                        if (setting.key === "local_status") {
                            if (setting.value === "1") {
                                $("#local_status").prop("checked", true);
                            } else {
                                $("#local_status").prop("checked", false);
                            }
                        } else {
                            $("#" + setting.key).val(setting.value);
                        }
                    });
                }
            },
            error: function (xhr) {
                if (xhr.responseJSON.code === 404) {
                    toastr.error(xhr.responseJSON.message);
                }
            },
        });
    }
    $(document).ready(function () {
        $("#fileStorageForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            $.ajax({
                url: "/api/file-storage/save/aws",
                method: "POST",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                cache: false,
                beforeSend: function () {
                    $(".aws_setting_btn").attr("disabled", true);
                    $(".aws_setting_btn").html(
                        '<div class="spinner-border text-light" role="status"></div>'
                    );
                },
            })
                .done((response, statusText, xhr) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".aws_setting_btn").removeAttr("disabled");
                    const updateText =
                        document.getElementById("btn_file").dataset.updateText;
                    document.getElementById("btn_file").innerText = updateText;
                    if (response.code === 200) {
                        toastr.success(response.message);
                        loadCredentialSetting();
                        $("#add_google_captacha").modal("hide");
                    } else {
                        toastr.error(response.message);
                    }
                })
                .fail((error) => {
                    $(".error-text").text("");
                    $(".form-control").removeClass("is-invalid");
                    $(".aws_setting_btn").removeAttr("disabled");
                    const updateText =
                        document.getElementById("btn_file").dataset.updateText;
                    document.getElementById("btn_file").innerText = updateText;

                    if (error.status == 422) {
                        $.each(error.responseJSON, function (key, val) {
                            $("#" + key).addClass("is-invalid");
                            $("#" + key + "_error").text(val[0]);
                        });
                    } else {
                        toastr(error.responseJSON.message, "bg-danger");
                    }
                });
        });
    });

    $(document).ready(function () {
        $("#local_status").on("change", function () {
            let localStatus = $(this).is(":checked") ? 1 : 0;

            let formData = {
                local_status: localStatus,
            };

            $.ajax({
                url: "/api/file-storage/status/local",
                type: "POST",
                data: formData,
                dataType: "json",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error("Failed to update captcha status.");
                    }
                },
                error: function (error) {
                    console.error("Error updating captcha status:", error);
                    toastr.error("An error occurred while updating.");
                },
            });
        });
    });

    $(document).ready(function () {
        $("#aws_status").on("change", function () {
            let awsStatus = $(this).is(":checked") ? 1 : 0;

            let formData = {
                aws_status: awsStatus,
            };

            $.ajax({
                url: "/api/file-storage/status/aws",
                type: "POST",
                data: formData,
                dataType: "json",
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("admin_token"),
                    Accept: "application/json",
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message);
                    } else {
                        toastr.error("Failed to update captcha status.");
                    }
                },
                error: function (error) {
                    console.error("Error updating captcha status:", error);
                    toastr.error("An error occurred while updating.");
                },
            });
        });
    });
}

function formatCurrency(value) {
    return parseFloat(value).toString();
}

if (pageValue === 'admin.addons') {

    $(document).ready(function () {
        listAddonModules();    
    });

    function listAddonModules() {
        $.ajax({
            url: "/api/admin/addon-module-list",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                if (response.code === 200) {

                    let addons = response.data;
                    let tableBody = "";

                    if (addons.length === 0) {
                        $('#addonModuleTable').DataTable().destroy();
                        tableBody += `
                            <tr>
                                <td colspan="5" class="text-center">${$('#addonModuleTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        addons.forEach((addon, index) => {
                            tableBody += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${addon.name}</td>
                                    ${ $('#has_permission').data('edit') == 1 ?
                                    `<td>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input addon_status" ${addon.status == 1 ? 'checked' : ''} type="checkbox" role="switch" id="switch-sm" data-id="${addon.id}">
                                        </div>
                                    </td>` : ''
                                    }
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <a href="/reload/${addon.name}">
                                                <i class="ti ti-refresh fs-20"></i></a>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        });
                    }

                    $('#addonModuleTable tbody').html(tableBody);

                    if ((addons.length != 0) && !$.fn.DataTable.isDataTable('#addonModuleTable')) {
                        $('#addonModuleTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    function listNewAddonModules() {
        $.ajax({
            url: "/api/new-addon-modules",
            type: "POST",
            dataType: "json",
            data: {
                order_by: "asc",
                sort_by: "id",
            },
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token"),
                Accept: "application/json",
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                if (response.code === 200) {

                    let addons = response.data;
                    let tableBody = "";

                    if (addons.length === 0) {
                        $('#newAddonModuleTable').DataTable().destroy();
                        tableBody += `
                            <tr>
                                <td colspan="5" class="text-center">${$('#newAddonModuleTable').data('empty')}</td>
                            </tr>`;
                    } else {
                        addons.forEach((addon, index) => {
                            tableBody += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${addon.module_name}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            ${ addon.status == 1 ? 
                                                `<span class="badge ${(addon.status == 1)? 'badge-soft-success' : 'badge-soft-danger'} d-inline-flex align-items-center">
                                                    <i class="ti ti-circle-filled fs-5 me-1"></i>${(addon.status == 1)? 'Activated' : ''}
                                                </span>` : 
                                                
                                                `<a class="btn btn-primary btn-sm me-2" href="${addon.purchase_link}" target="_blank">
                                                    Purchase </a>
                                                <a class="btn btn-primary btn-sm purchase_btn" href="" data-bs-toggle="modal" data-bs-target="#purchase_modal" data-module="${addon.module_name}" data-git_link="${addon.git_link}">
                                                    Activate </a>`
                                                
                                            }
                                        </div>
                                    </td>
                                </tr>
                            `;
                        });
                    }

                    $('#newAddonModuleTable tbody').html(tableBody);

                    if ((addons.length != 0) && !$.fn.DataTable.isDataTable('#newAddonModuleTable')) {
                        $('#newAddonModuleTable').DataTable({
                            ordering: true,
                            language: datatableLang
                        });
                    }
                }
            },
            error: function (error) {
                if (error.status === 422) {
                    var errors = error.responseJSON.errors;
                    if (errors) {
                        $.each(errors, function (key, messages) {
                            toastr.error(messages[0]);
                        });
                    } else {
                        toastr.error("An error occurred while fetching.");
                    }
                }
            },
        });
    }

    $(document).on('change', '.addon_status', function () {
        let id = $(this).data('id');
        let status = $(this).is(':checked') ? 1 : 0;

        var data = {
            'id': id,
            'status': status,
        };

        $.ajax({
            url: '/api/admin/change-addon-status',
            type: 'POST',
            data: data,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                if (response.code === 200) {
                    toastr.success(response.message);
                    listAddonModules();
                    location.reload();
                }
            },
            error: function (error) {
                toastr.error('An error occurred while updating status');
            }
        });
    });

    $(document).on('click', '#installed_addon', function() {
        $('#newAddonModuleTable').addClass('d-none');
        $('#addonModuleTable').removeClass('d-none');
        if ($.fn.DataTable.isDataTable('#newAddonModuleTable')) {
            $('#newAddonModuleTable').DataTable().destroy();
        }
        if ($.fn.DataTable.isDataTable('#addonModuleTable')) {
            $('#addonModuleTable').DataTable().destroy();
        }
        $('#addonModuleTable tbody').empty();

        listAddonModules();
    });

    $(document).on('click', '#new_addon', function() {
        $('#addonModuleTable').addClass('d-none');
        $('#newAddonModuleTable').removeClass('d-none');
        if ($.fn.DataTable.isDataTable('#addonModuleTable')) {
            $('#addonModuleTable').DataTable().destroy();
        }
        if ($.fn.DataTable.isDataTable('#newAddonModuleTable')) {
            $('#newAddonModuleTable').DataTable().destroy();
        }
        $('#newAddonModuleTable tbody').empty();
        listNewAddonModules();
    });

    $(document).on('click', '.purchase_btn', function () {

        $('#module_name').val($(this).data('module'));
        $('#git_link').val($(this).data('git_link'));

        $('#purchase_modal').modal('show');
    });

    $(document).on('click', '.purchase_confirm_btn', function(event) {
        event.preventDefault();

        var formData = new FormData();
        formData.append('module_name', $('#module_name').val());
        formData.append('git_link', $('#git_link').val());

        $.ajax({
            url: "/api/purchase-module",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            cache: false,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('admin_token'),
                'Accept': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
                $(".purchase_confirm_btn").attr("disabled", true).html(
                    '<span class="spinner-border spinner-border-sm align-middle" role="status" aria-hidden="true"></span>'
                );
            },
            success: function (response) {
                $(".error-text").text("");
                $(".purchase_confirm_btn").removeAttr("disabled").html($('.purchase_confirm_btn').data('save'));
                $(".form-control").removeClass("is-invalid is-valid");
                $(".select2-container").removeClass('is-invalid is-valid');
                $('#purchase_modal').modal('hide');
                if (response.code === 200) {
                    toastr.success(response.message);
                    listNewAddonModules();
                    location.reload();
                }

            },
            error: function (error) {
                $(".error-text").text("");
                $(".purchase_confirm_btn").removeAttr("disabled").html($('.purchase_confirm_btn').data('save'));
                $(".form-control").removeClass("is-invalid is-valid");
                $(".select2-container").removeClass('is-invalid is-valid');
                if (error.responseJSON.code === 422) {
                    $.each(error.responseJSON.errors, function(key, val) {
                        $("#" + key).addClass("is-invalid");
                        $("#" + key + "_error").text(val[0]);
                    });
                } else {
                    toastr.error(error.responseJSON.message);
                }
            }
        });

    });

}