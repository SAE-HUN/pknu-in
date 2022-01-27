from community.models import Image

import requests
import re

def upload_image(post, images):
	for image in images:
		p = re.compile("data:image/.+;.+,(.+)")
		s = p.search(image)
		if s:
			src = imgur(s.group(1))
			if src is not False:
				image = Image(post=post, src=src)
				image.save()

def update_image(post, images):
	for image in images:
		if image.startswith('https://i.imgur.com/'):
			src = image
		else:
			p = re.compile("data:image/.+;.+,(.+)")
			s = p.search(image)
			if s:
				src = imgur(s.group(1))
				if src is False:
					continue
			else:
				continue
		image = Image(post=post, src=src)
		image.save()



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