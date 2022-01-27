function make_newNode(message){	
	var newNode = document.createElement('strong');
	newNode.innerHTML = message;
	newNode.setAttribute('id', 'nicknameMsg')
	newNode.setAttribute('class', 'txt_nick')
	return newNode
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
var image;
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            image = e.target.result;
            $('#cafeMemberProfileThumb').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}
function set_formData(){
    var nickname = document.getElementById("nickname").value;
    var formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('image', image);
    submit(formData);
}