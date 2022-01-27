var images = [];
$(function(){

    var ul = $('#upload ul');

    $('#drop_file').click(function(){
        $(this).next('input').click();
    });

    $('#upload').fileupload({

        dropZone: $('#drop'),
        add: function (e, data) {

            var tpl = $('<li class="working"><span></span></li>');

            if (data.files && data.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function(e) {
                    tpl.prepend('<img width="200" src="'+e.target.result+'">');
                    images.push(e.target.result);
                    addOnclick(tpl, tpl.find('span')[0]);
                }
                
                reader.readAsDataURL(data.files[0]);

            }

            data.context = tpl.appendTo(ul);
            
        },

        fail:function(e, data){
            data.context.addClass('error');
        }

    });

});

function addOnclick(tpl, instance){
    instance.addEventListener("click", function(){
        var index = $(instance).closest('.working').prevAll().length;
        images.splice(index, 1);
        tpl.fadeOut(function(){
            tpl.remove();
        })
    })
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setFormData(){
    var body = document.getElementById('body')
    body.style.display = 'none';
    let userAgentString = navigator.userAgent;
    let IExplorerAgent = userAgentString.indexOf("MSIE") > -1 || userAgentString.indexOf("rv:") > -1;
    if (!IExplorerAgent){
        body.after('Loading...');
    }
    var formData = new FormData();
    var category = document.getElementById('menuid_list').value;
    var title = document.getElementById('subject').value;
    var description = document.getElementById('description').value;
    formData.append('category', category);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('images', JSON.stringify(images));
    submit(formData);
}