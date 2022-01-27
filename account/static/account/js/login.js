function make_newNode(message){	
	var newNode = document.createElement('strong');
	newNode.innerHTML = message;
	newNode.setAttribute('id', 'nicknameMsg')
	newNode.setAttribute('class', 'txt_nick')
	return newNode
}
function validate_username(){
	var username = document.getElementById('id')
	if (username.value.length === 0){
		var newNode = make_newNode('아이디를 입력해주세요.')
		username.parentNode.parentNode.parentNode.insertBefore(newNode, username.parentNode.parentNode.nextSibling)
		return false
	}
	else if (username.value.length !== 9){
		var newNode = make_newNode('아이디로 올바른 학번 입력해주세요.')
		username.parentNode.parentNode.parentNode.insertBefore(newNode, username.parentNode.parentNode.nextSibling)	
		return false
	}
}
function validate_password(){
	var password = document.getElementById('pw')
	if (password.value.length === 0){
		var newNode = make_newNode('비밀번호를 입력해주세요.')
		password.parentNode.parentNode.parentNode.insertBefore(newNode, password.parentNode.parentNode.nextSibling)
		return false
	}
}