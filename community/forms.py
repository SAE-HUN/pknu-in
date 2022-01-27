from django import forms

from .models import Post, Comment, Recomment, ReportPost, ReportComment, ReportRecomment

class PostForm(forms.ModelForm):
	class Meta:
		model = Post
		fields = ['category', 'title', 'description']
		error_messages = {
			'category' : {
				'required':'카테고리를 선택해주세요.',
				'invalid_choice': '카테고리를 선택해주세요.',
			},
			'title' : {
				'required':'제목을 입력해주세요.',
			},
			'description' : {
				'required':'내용을 입력해주세요.',
			}
		}

class CommentForm(forms.ModelForm):
	class Meta:
		model = Comment
		fields = ['content']
		error_messages = {
			'content' : {
				'required':'내용을 입력해주세요.',
			},
		}

class RecommentForm(forms.ModelForm):
	class Meta:
		model = Recomment
		fields = ['content']
		error_messages = {
			'content' : {
				'required':'내용을 입력해주세요.',
			},
		}

class ReportForm(forms.ModelForm):
	class Meta:
		fields = ['reason']
		error_messages = {
			'reason' : {
				'required' : '이유를 선택해주세요.'
			}
		}

class ReportPostForm(ReportForm):
	class Meta(ReportForm.Meta):
		model = ReportPost

class ReportCommentForm(ReportForm):
	class Meta(ReportForm.Meta):
		model = ReportComment

class ReportRecommentForm(ReportForm):
	class Meta(ReportForm.Meta):
		model = ReportRecomment