import requests
import re

def upload_image(image):
	src = False
	p = re.compile("data:image/.+;.+,(.+)")
	s = p.search(image)
	if s:
		src = imgur(s.group(1))
		print(src)
	return src

def imgur(image):
	url = 'https://api.imgur.com/3/image'
	payload = {'image': image}
	files = {}
	headers = {
  		'Authorization': 'Client-ID 7cb0e94ae311927'
	}
	response = requests.request('POST', url, headers = headers, data = payload, files=files, allow_redirects=False).json()
	if response['success']==True:
		return response['data']['link']
	else:
		return False