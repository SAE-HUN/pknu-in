function make_newNode(message){	
	var newNode = document.createElement('strong');
	newNode.innerHTML = message;
	newNode.setAttribute('id', 'nicknameMsg')
	newNode.setAttribute('class', 'txt_nick')
	return newNode
}

function validate_all(){
    let userAgentString = navigator.userAgent;
    let IExplorerAgent = userAgentString.indexOf("MSIE") > -1 || userAgentString.indexOf("rv:") > -1;
    if (IExplorerAgent){
    	return true
    }
	var form = document.getElementById('join_form');
	var elements = form.elements;
	for(var i=2; i<4; i++){
		var item = elements.item(i);
		if (!item.checked){
			alert('약관을 동의해주세요.');
			return false
		}
	}
	for(var i=4; i<elements.length; i++){
		item = elements.item(i);
		if (!item.value){
			var newNode = make_newNode('필수정보 입니다.')
			item.parentNode.parentNode.insertBefore(newNode, item.parentNode.nextElementSibling)
			item.focus()
			return false
		}
	}
}
function validate_password(){
	var pswd2 = document.getElementById('pswd2');
	var pswd3 = document.getElementById('pswd3');
	if (pswd2.value !== pswd3.value){
		var newNode = make_newNode('비밀번호가 일치하지 않습니다.')
		pswd3.parentNode.parentNode.insertBefore(newNode, pswd3.parentNode.nextElementSibling)
		return false
	}
}

function validate_nickname(){
	var nickname = document.getElementById('nickname')
    var strongs = document.querySelectorAll('strong#nicknameMsg')
    let userAgentString = navigator.userAgent;
    let IExplorerAgent = userAgentString.indexOf("MSIE") > -1 || userAgentString.indexOf("rv:") > -1;
    if (IExplorerAgent){
        for (var i = strongs.length - 1; i >= 0; i--) {
            strongs[i].innerText = "";
            strongs[i].outerText = "";
        }   
    }
    else{
        strongs.forEach(function(currentValue, currentIndex, listObj){
            currentValue.remove();
        })
    }
	if (nickname.value.length <2 || nickname.value.length >10){
		var newNode = make_newNode('닉네임은 최소 2글자 이상 10글자 이하여야 합니다.')
		nickname.parentNode.parentNode.insertBefore(newNode, nickname.parentNode.nextElementSibling)
		return false
	}
	else{
		$.ajax({
			url: '/account/validate_nickname',
			type: "GET",
			dataType: "json",
			data: {
				nickname: nickname.value
			},
			success: function(response){
				if (response.result === true){
					var newNode = make_newNode('멋진 닉네임이네요!')
					nickname.parentNode.parentNode.insertBefore(newNode, nickname.parentNode.nextElementSibling)
				}
				else{
					var newNode = make_newNode('이미 사용 중인 닉네임입니다.')
					nickname.parentNode.parentNode.insertBefore(newNode, nickname.parentNode.nextElementSibling)
					return false
				}
			}
		})
	}
	
}

function validate_username(){
	var username = document.getElementById('id')
	if (username.value.length !== 9){
		var newNode = make_newNode('올바른 포털 아이디를 입력해주세요.')
		username.parentNode.parentNode.insertBefore(newNode, username.parentNode.nextElementSibling)	
		return false
	}
}