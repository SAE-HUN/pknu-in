from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Like, ReportPost, ReportComment, ReportRecomment
from .tasks import upload_to_BMB, upload_to_TWK

@receiver(post_save, sender=ReportPost)
def report_post(sender, instance, **kwargs):
	if instance.post.category != 'NTC':
		if instance.post.reports.all().count() == 10:
			instance.post.blind = True
			instance.post.save()

@receiver(post_save, sender=ReportComment)
def report_comment(sender, instance, **kwargs):
	if instance.comment.reports.all().count() == 10:
		instance.comment.blind = True
		instance.comment.save()


@receiver(post_save, sender=ReportRecomment)
def report_recomment(sender, instance, **kwargs):
	if instance.recomment.reports.all().count() == 10:
		instance.recomment.blind = True
		instance.recomment.save()

@receiver(post_save, sender=Like)
def like_post_save(sender, instance, **kwargs):
	post = instance.post
	like_count = post.likes.count()
	if like_count == 10:
		post.is_popular = True
		post.save()
	if post.category == 'BMB' and like_count == 2:
		upload_to_BMB.delay(post.description, post.get_absolute_url())
	elif post.category == 'TWK' and like_count == 2:
		upload_to_TWK.delay(post.description, post.get_absolute_url())