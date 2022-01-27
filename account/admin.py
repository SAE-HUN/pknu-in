from django.contrib import admin

from community.models import Post
from .models import Profile

class PostInline(admin.TabularInline):
	model = Post

class ProfileAdmin(admin.ModelAdmin):
	list_per_page = 10
	list_display = (
		'user', 'nickname', 'major',
	)
	search_fields = ('user__username', 'nickname', 'major', )

admin.site.register(Profile, ProfileAdmin)