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

	for(var i=1; i<elements.length; i++){
		item = elements.item(i);
		if (!item.value){
			var newNode = make_newNode('필수정보 입니다.')
			item.parentNode.parentNode.insertBefore(newNode, item.parentNode.nextSibling)
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
		pswd3.parentNode.parentNode.insertBefore(newNode, pswd3.parentNode.nextSibling)
		return false
	}
}

function validate_username(){
	var username = document.getElementById('id')
	if (username.value.length !== 9){
		var newNode = make_newNode('올바른 포털 아이디를 입력해주세요.')
		username.parentNode.parentNode.insertBefore(newNode, username.parentNode.nextSibling)
		return false
	}
}