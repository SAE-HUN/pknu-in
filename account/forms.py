from django import forms
from .models import Profile

from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class UserForm(forms.ModelForm):

	class Meta:
		model = User
		fields = ['username', 'password']
		error_messages = {
			'username': {
				'required': _('포털아이디를 입력해주세요.'),
				'unique': _('이미 가입되어있는 학번입니다.')
			},
			'password': {
				'required': _('포털비밀번호를 입력해주세요.'),
			}
		}

class ProfileForm(forms.ModelForm):
	term1 = forms.BooleanField(
		error_messages={'required': _('약관 동의 후 가입하실 수 있습니다.'),}
	)
	term2 = forms.BooleanField(
		error_messages={'required': _('약관 동의 후 가입하실 수 있습니다.'),}
	)
	portal_password = forms.CharField(
		max_length=50,
		error_messages={'required': _('포털비밀번호를 입력해주세요.'),}
	)

	class Meta:
		model = Profile
		fields = ['nickname']
		error_messages = {
			'nickname': {
				'required':  _('닉네임을 입력해주세요.'),
				'min_length': _('닉네임은 최소 2자리 이상으로 가능합니다.'),
				'max_length': _('닉네임은 최대 10자리까지 가능합니다.'),
				'unique': _('이미 사용 중인 닉네임입니다.'),
			}
		}

class LoginForm(forms.Form):
	username = forms.CharField(
		min_length=9,
		max_length=9,
		error_messages={
			'min_length': _('아이디로 9자리 학번을 입력해주세요.'),
			'max_length': _('아이디로 9자리 학번을 입력해주세요.'),
			'required': _('아이디를 입력해주세요.')
		}
	)
	password = forms.CharField(
		max_length = 50,
		error_messages={'required': _('비밀번호를 입력해주세요.')}
	)

class FindForm(forms.Form):
	username = forms.CharField(
		min_length=9,
		max_length=9,
		error_messages={
			'min_length': _('아이디로 9자리 학번을 입력해주세요.'),
			'max_length': _('아이디로 9자리 학번을 입력해주세요.'),
			'required': _('아이디를 입력해주세요.')
		}
	)
	portal_password = forms.CharField(
		max_length=50,
		error_messages={'required': _('포털비밀번호를 입력해주세요.'),}
	)
	new_password = forms.CharField(
		max_length = 50,
		error_messages={'required': _('새 비밀번호를 입력해주세요.')}
	)