var MESSAGE_SPEED = 500;
var messages = { errors: {}, successes: {} };

function loadPage(obj)
{
    var main = $('#main');
    main.addClass('loading');

    // Clears everything out so all the user sees is the loading animation
    main.html("");

    $.getJSON(obj, function(data)
    {
        $('.pageStyle').remove();
        $('head').append(getStyles(data['styles']));
        $('head').css('width', 'auto');
        main.html(data['markup'].toString());
        main.removeClass('loading');
        $('title').html(data['title'].toString());
    });
    return false;
}

function formSubmit(obj)
{
    var form = $(obj);
    $.post(obj.action, form.serialize(), function(data)
    {
        // Return data is JSON object string, so eval to get object
        var message = $.parseJSON(data);
        showAll(message);
    });
    return false;
}

function setError(message)
{
    messages['errors'][messages['errors'].length] = message;
}

function setSuccess(message)
{
    messages['successes'][messages['successes'].length] = message;
}

function showAll(message)
{
    showErrors(message['errors']);
    showSuccesses(message['successes']);
}

function showErrors(messages)
{
    if(typeof messages != "undefined")
    {
        $('#success').css('display', 'none');
        var error = $('#error');
        error.css('display', 'none');
        error.html(getMessageList(messages));
        error.fadeIn(MESSAGE_SPEED);
    }
}

function showSuccesses(messages)
{
    if(typeof messages != "undefined")
    {
        $('#error').css('display', 'none');
        var success = $('#success');
        success.css('display', 'none');
        success.html(getMessageList(messages));
        success.fadeIn(MESSAGE_SPEED);
    }
}

function getStyles(styles)
{
    var output = '';
    for(i in styles)
        output += '<link rel="stylesheet" type"text/css" href="'+styles[i]+'" class="pageStyle" />';
    return output;
}

function getMessageList(messages)
{
    /*
        Converts a list of user notification messages to an unordered list
    */
    var output = '<ul>';
    for(i in messages)
        output += '<li>'+messages[i]+'</li>';
    output += '</ul>';
    return output;
}
