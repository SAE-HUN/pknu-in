from PKNUIN.celery import app
from celery.decorators import task
import glob
import os
import io
import requests

@app.task(bind=True)
def upload_to_BMB(self, description, _url):
	url = "https://graph.facebook.com/1544718535795801/feed"
	data = {
		'message': description,
		'link': "www.pknu.in" + _url,
		'access_token': "EAAHrseRYneoBANnXZAD1bWyFBVXPDunDyqEnRFaLl2y7j9dSvVzPDJ7qmcaiA5juQceijZAxnwcxzoxI4dx3MQTqsEfFR4v7ZBK7KFKClH1iNLpjIl6K2C2ZAeX3XBFgZARrEZBCngRBc4gqDgZCAw2R9mXq0MDw6i4fAMkp2ECzAZDZD"
	}
	result = requests.post(url=url, data=data, verify=False)

@app.task(bind=True)
def upload_to_TWK(self, description, _url):
	url = "https://graph.facebook.com/372688786250088/feed"
	data = {
		'message': description,
		'link': "www.pknu.in" + _url,
		'access_token': "EAAHrseRYneoBALN1ambaHWDebhw2aZA3G8EOs2iO7ZA17T1obcUU0RS1vqnK4ZCReEayX5H8kzrpvfcaPF6ijI1CvZC1zGqzdOUgEk1ilLoWkC6dCY7qHsZBQoZAmXuUwJIv98kZAUeNF89BD9nBqttzBUOLC2JIFZBcpkgFmcJbku6JKkPmJyrp"
	}
	result = requests.post(url=url, data=data, verify=False)