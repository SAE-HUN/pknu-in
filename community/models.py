from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta

class Content(models.Model):
	writed_time = models.DateTimeField(auto_now_add=True)
	deleted = models.BooleanField(default=False)
	blind = models.BooleanField(default=False)

	def is_until_today(self):
		time_until = timezone.now() - self.writed_time
		if time_until > timedelta(days=1):
			return False
		else:
			return True

	def is_until_a_hour(self):
		time_until = timezone.now() - self.writed_time
		if time_until > timedelta(seconds=3600):
			return False
		else:
			return True

	def is_just_now(self):
		time_until = timezone.now() - self.writed_time
		if time_until > timedelta(seconds=60):
			return False
		else:
			return True

	class Meta:
		abstract = True

class Post(Content):
	author = models.ForeignKey(
		'account.Profile',
		on_delete=models.CASCADE,
		related_name='posts',
		related_query_name='post',
	)
	
	CATEGORY_CHOICES = (
		('FRE', '자유게시판'),
		('BMB', '대나무숲'),
		('TWK', '반짝정원'),
		('LAF', '분실물'),
		('NTC', '공지사항'),
	)

	id = models.AutoField(primary_key=True)	
	title = models.CharField(max_length=100)
	description = models.TextField()
	category = models.CharField(max_length=3, choices=CATEGORY_CHOICES)
	views = models.PositiveSmallIntegerField(default=0)
	is_popular = models.BooleanField(default=False)

	def __str__(self):
		return self.title

	def get_absolute_url(self):
		return reverse('community:post_detail', args=[self.category, self.id])

	class Meta:
		ordering = ['-writed_time']

class Like(models.Model):
	post = models.ForeignKey(
		Post,
		on_delete=models.CASCADE,
		related_name='likes',
		related_query_name='like',
	)
	user = models.ForeignKey(
		'account.Profile',
		on_delete=models.CASCADE,
		related_name='likes',
		related_query_name='like',
	)
	id = models.AutoField(primary_key=True)
	class Meta:
		ordering = ['-id']

class Image(models.Model):
	post = models.ForeignKey(
		Post,
		on_delete=models.CASCADE,
		related_name='images',
		related_query_name='image',
	)
	id = models.AutoField(primary_key=True)
	src = models.URLField()

class Comment(Content):
	post = models.ForeignKey(
		Post,
		on_delete=models.CASCADE,
		related_name='comments',
		related_query_name='comment',
	)

	writer = models.ForeignKey(
		'account.Profile',
		on_delete=models.CASCADE,
		related_name='comments',
		related_query_name='comment',
	)

	id = models.AutoField(primary_key=True)
	content = models.TextField()

	def __str__(self):
		return self.content
	
class Recomment(Content):
	post = models.ForeignKey(
		Post,
		on_delete=models.CASCADE,
		related_name='recomments',
		related_query_name='recomment',
	)

	comment = models.ForeignKey(
		Comment,
		on_delete=models.CASCADE,
		related_name='recomments',
		related_query_name='recomment',
	)

	writer = models.ForeignKey(
		'account.Profile',
		on_delete=models.CASCADE,
		related_name='recomments',
		related_query_name='recomment',
	)

	id = models.AutoField(primary_key=True)
	content = models.TextField()

	def __str__(self):
		return self.content

class Report(models.Model):
	REASON_CHOICES = (
		('DFB', '게시판에 적합하지않은 게시물'),
		('UPP', '허가받지 않은 홍보게시물'),
		('DBI', '특정인을 유추하여 명예훼손이 가능한 게시물'),
		('ETC', '기타'),
	)

	id = models.AutoField(primary_key=True)
	reason = models.CharField(max_length=3, choices=REASON_CHOICES)

	class Meta:
		abstract = True

class ReportPost(Report):
	post = models.ForeignKey(
		Post,
		on_delete=models.CASCADE,
		related_name='reports',
		related_query_name='report',
	)

	user = models.ForeignKey(
		'account.Profile',
		on_delete=models.CASCADE,
		related_name='reports_of_post',
		related_query_name='report_of_post',
	)

class ReportComment(Report):
	comment = models.ForeignKey(
		Comment,
		on_delete=models.CASCADE,
		related_name='reports',
		related_query_name='report',
	)

	user = models.ForeignKey(
		'account.Profile',
		on_delete=models.CASCADE,
		related_name='reports_of_comment',
		related_query_name='report_of_comment',
	)

class ReportRecomment(Report):
	recomment = models.ForeignKey(
		Recomment,
		on_delete=models.CASCADE,
		related_name='reports',
		related_query_name='report',
	)

	user = models.ForeignKey(
		'account.Profile',
		on_delete=models.CASCADE,
		related_name='reports_of_recomment',
		related_query_name='report_of_recomment',
	)