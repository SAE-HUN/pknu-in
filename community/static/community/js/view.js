function write_comment(_this){
    let form = $(_this).closest('form');
    let textarea = $(form).find('textarea')
    var token = getCookie('csrftoken');
    $.ajax({
        headers: { "X-CSRFToken": token },
        url: $(form).attr('action'),
        type: "POST",
        dataType: "json",
        data: {content:textarea.val()},
        success: function(response){
            if (response.result === true){
                $(textarea).val('');
                $('ul#comment_ul').replaceWith(response.comments)
                $("div.footer_fix").replaceWith(response.footer)
            }
            else{
                alert(response.message);
            }
        }
    })
}

function write_recomment(_this){
    let form = $(_this).closest('form');
    let textarea = $(form).find('textarea')
    var token = getCookie('csrftoken');
    $.ajax({
        headers: { "X-CSRFToken": token },
        url: $(form).attr('action'),
        type: "POST",
        dataType: "json",
        data: {content:textarea.val()},
        success: function(response){
            if (response.result === true){
                $(_this).closest('div.u_cbox').next().replaceWith(response.recomments);
                $("div.footer_fix").replaceWith(response.footer)
                removeCommentWrite();
            }
            else{
                alert(response.message);
            }
        }
    })
}

function like(category, postID) {
    $.ajax({
        url: "/" + category + "/" + postID + "/like",
        type: "GET",
        dataType: "json",
        success: function(response){
            if (response.result === true){
                $("div.footer_fix").replaceWith(response.html);
            }
            else{
                alert(response.message);
            }
        }
    })
}

function delete_comment(event, _this) {
    event.preventDefault();
    $.ajax({
        url: $(_this).attr('href'),
        type: "GET",
        dataType: "json",
        success: function(response){
            if(response.result===true){
                $('ul#comment_ul').replaceWith(response.comments);
            }
            else{
                alert(response.message)
            }
        },
         error: function(xhr, status, error){
             var errorMessage = xhr.status + ': ' + xhr.statusText
             alert('Error - ' + errorMessage);
         }
    })
}
function delete_recomment(event, _this, commentID) {
    event.preventDefault();
    $.ajax({
        url: $(_this).attr('href'),
        type: "GET",
        dataType: "json",
        data:{commentID:commentID},
        success: function(response){
            if(response.result===true){
                $(_this).closest('ul[class=recomment_ul]').replaceWith(response.recomments);
            }
        },
         error: function(xhr, status, error){
             var errorMessage = xhr.status + ': ' + xhr.statusText
             alert('Error - ' + errorMessage);
         }
    })
}