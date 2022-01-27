from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from account.models import Profile
from .models import Post, Like, Comment, Recomment, Image, ReportPost, ReportComment, ReportRecomment

class PostAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'title', 'category',
		'link_to_author', 'writed_time',
		'views', 'likes_count',
		'comments_count',
		'deleted', 'blind',
	)
	list_display_links = ['title']
	list_editable = ('category', 'deleted', 'blind')
	list_filter = ('category',)
	search_fields = ('title', 'author__nickname', 'author__user__username',)
	date_hierarchy = 'writed_time'

	def link_to_author(self, obj):
		link = reverse('admin:auth_user_change', args=[obj.author.user.id])
		return format_html('<a href="{}">{}</a>', link, obj.author)

	def likes_count(self, obj):
		return Like.objects.filter(post=obj).count()

	def comments_count(self, obj):
		return Comment.objects.filter(post=obj).count()

	fieldsets = (
		('기본 정보', {
			'fields' : ('author', 'category',)
		}),
		('제목 및 내용', {
			'fields' : ('title', 'description', )
		}),
		('기타', {
			'fields' : (('deleted', 'blind', 'is_popular'), ),
		}),
	)

class CommentAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'content', 'link_to_post',
		'link_to_writer', 'writed_time',
		'deleted', 'blind',
	)
	list_display_links = ['content']
	list_editable = ('deleted', 'blind', )
	search_fields = ('content', 'post__title', 'post__description', 'writer__user__username', 'writer__nickname', )
	date_hierarchy = 'writed_time'

	fieldsets = (
		('기본 정보', {
			'fields' : ('writer', 'post', )
		}),
		('내용', {
			'fields' : (('content', ), )
		}),
		('삭제 및 차단', {
			'fields' : (('deleted', 'blind', ), )
		}),
	)

	def link_to_writer(self, obj):
		link = reverse('admin:auth_user_change', args=[obj.writer.user.id])
		return format_html('<a href="{}">{}</a>', link, obj.writer)

	def link_to_post(self, obj):
		link = reverse('admin:community_post_change', args=[obj.post.id])
		return format_html('<a href="{}">{}</a>', link, obj.post)

class RecommentAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'content', 'link_to_comment',
		'link_to_post', 'link_to_writer', 'writed_time',
		'deleted', 'blind',
	)
	list_display_links = ['content']
	list_editable = ('deleted', 'blind', )
	search_fields = ('content', 'post__title', 'post__description', 'writer__user__username', 'writer__nickname', )
	date_hierarchy = 'writed_time'

	fieldsets = (
		('기본 정보', {
			'fields' : ('writer', 'comment', 'post', )
		}),
		('내용', {
			'fields' : (('content', ), )
		}),
		('삭제 및 차단', {
			'fields' : (('deleted', 'blind', ), )
		}),
	)

	def link_to_writer(self, obj):
		link = reverse('admin:auth_user_change', args=[obj.writer.user.id])
		return format_html('<a href="{}">{}</a>', link, obj.writer)

	def link_to_post(self, obj):
		link = reverse('admin:community_post_change', args=[obj.post.id])
		return format_html('<a href="{}">{}</a>', link, obj.post)

	def link_to_comment(self, obj):
		link = reverse('admin:community_comment_change', args=[obj.comment.id])
		return format_html('<a href="{}">{}</a>', link, obj.comment)

class ReportPostAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'post',
		'reason', 'user',
	)
	list_filter = ('reason', )
	list_editable = ('reason', )
	search_fields = ('post__title', 'post__description', 'user__nickname', 'user__user__username', )

class ReportCommentAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'comment',
		'reason', 'user',
	)
	list_filter = ('reason', )
	list_editable = ('reason', )
	search_fields = ('comment__content', 'user__nickname', 'user__user__username', )

class ReportRecommentAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'recomment',
		'reason', 'user',
	)
	list_filter = ('reason', )
	list_editable = ('reason', )
	search_fields = ('recomment__content', 'user__nickname', 'user__user__username', )

class LikeAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'post', 'user',
	)

class ImageAdmin(admin.ModelAdmin):
	list_per_page = 15
	list_display = (
		'id', 'src', 'post',
	)
	search_fields = ('post__title', 'post__description', )


admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Recomment, RecommentAdmin)
admin.site.register(ReportPost, ReportPostAdmin)
admin.site.register(ReportComment, ReportCommentAdmin)
admin.site.register(ReportRecomment, ReportRecommentAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(Image, ImageAdmin)