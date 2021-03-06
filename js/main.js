var PATH;
var MESSAGE_SPEED = 500;
var messages = { errors: Array(), successes: Array() };
var userContentEditor;
var pageHeadingEditor;

function loadPage(obj, inline)
{
    
    /*
        The jQuery address plugin does not work if the link is
        in the AJAX content area (main). This fixes that.
    */
    if(!inline)
    {
        var url = (""+window.location).replace(/([^\#!])\/[0-9]+\/[a-zA-Z-_\.\|']+\/?/, "\$1");
        if(url != window.location)
            window.location = url+'#!/'+obj.rel.substring(8);
        else
            window.location='#!/'+obj.rel.substring(8);
    }
    else
    {
        var main = $('#main');
        main.addClass('loading');

        // Fade out content to emphasize loading animation
        $('#mainContent').css('opacity', '0.3');

        $.getJSON(obj, function(data)
        {
            if(typeof data['redirect'] != "undefined" && data['redirect'][0].toString() != "") 
            {
                if(data['ajax'])
                    loadPage(data['redirect'][0], true);
                else
                    window.location = data['redirect'][0];
            }
            else
            {
                $('#mainContent').css('opacity', '1');
                $('.pageStyle').remove();
                $('head').append(getStyles(data['styles']));
                main.removeClass('loading');
                main.html(data['markup'].toString());
                $(document).attr('title', data['title'].toString());
                bindClick();

                loadEditor();
            }
        });
    }
    return false;
}

function loadEditor()
{
    /*
        Loading of nicEdit for editing page content
        Only applicable if the userContent div exists
            -By default, only exists when user is logged in
             and permitted to edit the given page

        Note: This is NOT where security is handled
    */
    if(typeof $('#userContent').val() != "undefined")
    {
        adminPanel();
    }
}

function formSubmit(obj, callBack, postCallBack)
{
    var form = $(obj);
    var submit = form.find('input[type="submit"]');
    submit.attr('disabled', 'disabled');
    submit.after('<span class="waitingNotice">Please wait...</span>');
    $.post(obj.action, form.serialize(), function(data)
    {
        if(typeof callBack == "undefined" || callBack(data))
        {
            try
            {
                // Return data is JSON object string, so eval to get object
                var message = $.parseJSON(data);
                if(message != "undefined")
                {
                    if(typeof message['redirect'] != "undefined" && message['redirect'][0].toString() != "")
                    {
                        if(!message['ajax'])
                            window.location = message['redirect'][0];
                        else
                        {
                            if(message['redirect'][0].toString() == "-1")
                                location.reload();
                            else
                                window.location = message['redirect'][0];
                                //loadPage(message['redirect'][0], true);
                        }
                    }
                    else
                        showAll(message);
                }
            }
            catch(err)
            {
                /*
                alert(err);
                setError('<pre>'+data+'</pre>');
                showErrors(messages['errors']);
                */
                $('html').html(data);
            }
        }

        form.find('.waitingNotice').remove();
        submit.removeAttr('disabled');
        $(window).scrollTop(0);
        if(typeof postCallBack != "undefined")
            postCallBack(data);
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

function showAll(message, errorsId, successesId)
{
    /*
        errorsId and successesId are the IDs for the HTML element to contain the messages
    */
    if(typeof errorsId == "undefined")
        errorsId = "errors";
    if(typeof successesId == "undefined")
        successesId = "successes";

    var errors = $('#'+errorsId);
    errors.css('display', 'none');
    var successes = $('#'+successesId);
    successes.css('display', 'none');

    showErrors(message['errors'], errorsId, successesId);
    showSuccesses(message['successes'], errorsId, successesId);
    showFieldErrors(message['fieldErrors']);
}

function showErrors(messages, errorsId, successesId)
{
    if(typeof messages != "undefined")
    {
        if(typeof errorsId == "undefined")
            errorsId = "errors";
        if(typeof successesId == "undefined")
            successesId = "successes";

        $('#'+successesId).css('display', 'none');
        var errors = $('#'+errorsId);
        errors.css('display', 'none');
        errors.html(getMessageList(messages));
        errors.fadeIn(MESSAGE_SPEED);
        errors.css('display', 'block');
    }
}

function showSuccesses(messages, errorsId, successesId)
{
    /*
        errorsId and successesId are the IDs for the HTML element to contain the messages
    */
    if(typeof messages != "undefined")
    {
        if(typeof errorsId == "undefined")
            errorsId = "errors";
        if(typeof successesId == "undefined")
            successesId = "successes";

        $('#'+errorsId).css('display', 'none');
        var successes = $('#'+successesId);
        successes.css('display', 'none');
        successes.html(getMessageList(messages));
        successes.fadeIn(MESSAGE_SPEED);
        successes.css('display', 'block');
        successes.delay(2000).fadeOut(MESSAGE_SPEED);
    }
}

function showFieldErrors(messages)
{
    $('.fieldError').remove();
    if(typeof messages != "undefined")
    {
        for(i in messages)
        {
            var error = $('#'+i);
            error.after(messages[i]);
        }
    }
}

function getStyles(styles)
{
    var output = '';
    for(i in styles)
        output += '<link rel="stylesheet" href="'+styles[i]+'" class="pageStyle" />';
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

function bindClick()
{
    $('#content a[rel]').unbind('click').click(function()
    {
        return loadPage(this);
    });
}

function cancelClicked()
{
    $('form').append('<input type="hidden" name="cancel" value="1" />');
}

var first = true;
/*
$.address.externalChange(function(event)
{
    var url = event.value.substring(1);
    if(window.location.toString().charAt(window.location.toString().length-1) == '/' || window.location.toString().indexOf('#!') != -1)
    {   
        if(!(first && url == ''))
        {   
            first = false;
            loadPage(PATH+url, true);
        }   
        else
            loadEditor();
    }   
    else
        loadEditor();
    bindClick();
});
*/

$(document).ready(function()
{
    PATH = $('#path').val();
    loadEditor();
    $.ajaxSetup(
    {
        error:function(x,e)
        {
            if(x.status==0)
                alert('You are offline!!\n Please Check Your Network.');
            else if(x.status==404)
                loadPage(PATH+"errors/404.php", true);
            else if(x.status==500)
                alert('Internel Server Error.');
            else if(e=='parsererror')
                alert('Error.\nParsing JSON Request failed.');
            else if(e=='timeout')
                alert('Request Time out.');
            else
                alert('Unknow Error.\n'+x.responseText);
        }
    });
});
