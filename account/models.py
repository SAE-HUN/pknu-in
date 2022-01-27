from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_nickname(nickname):
	if Profile.objects.filter(nickname__iexact=nickname).exists():
		raise ValidationError(
			'이미 사용 중인 닉네임입니다.',
			code='unique'
		)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.TextField(max_length=10, validators=[validate_nickname])
    major = models.CharField(max_length=20, null=True)
    profile_image = models.URLField(default="https://ssl.pstatic.net/static/cafe/cafe_pc/default/cafe_profile_77.png")
    
    def __str__(self):
    	return self.nickname

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
	if created:
		Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
	instance.profile.save()