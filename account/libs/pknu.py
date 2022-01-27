import requests
from bs4 import BeautifulSoup
import datetime
import re

# 수강신청, 홈페이지, 도서관
login_urls = ['https://sugang.pknu.ac.kr/com/cmmn/user/logInStdInfo.action', "https://www.pknu.ac.kr/usrLoginActn.do", "https://libweb.pknu.ac.kr/wp-admin/admin-ajax.php"]
login_data = {}

def check_pknu(id, password):
	set_login_data(id=id, password=password)
	p = re.compile('로그인')
	r = requests.post(url=login_urls[1], data=login_data, verify=False)
	s = p.search(r.content.decode('utf-8'))
	if s:
		return True
	else:
		return False

def set_login_data(id, password):
	login_data['user_login'] = id
	login_data['userNo'] = id
	login_data['userid'] = id
	login_data['password'] = password
	login_data['userpwd'] = password
	login_data['userPwd'] = password
	login_data['action'] = 'mpwp_login_sync_local'

def get_major(id, password):
	set_login_data(id, password)
	with requests.session() as session:
		session.post(url="https://sugang.pknu.ac.kr/com/cmmn/user/logIn.action", data=login_data, verify=False)
		r = session.get(url='https://sugang.pknu.ac.kr/aply/applicationConf.jsp', verify=False)
		info = BeautifulSoup(r.content, 'html.parser').find_all('div', {'id':'info'})[1].find_all('dd')
		major = info[1].text
	return major