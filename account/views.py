from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from  django.views.decorators.http import *
from django.contrib.auth import login, authenticate, logout as _logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from .models import Profile
from .forms import UserForm, ProfileForm, LoginForm, FindForm
from .libs.pknu import check_pknu, get_major
from .libs.query import upload_image

@require_http_methods(['GET', 'POST'])
def signup(request):
	if request.method == 'GET':
		return render(request, 'account/join.html')
	else:
		response = {'result': False}
		profile_form = ProfileForm(request.POST)
		if profile_form.is_valid():
			nickname = profile_form.cleaned_data['nickname']
			_password = profile_form.cleaned_data['portal_password']
			user_form = UserForm(request.POST)
			if user_form.is_valid():
				username = user_form.cleaned_data['username']
				password = user_form.cleaned_data['password']
				if check_pknu(id=username, password=_password):
					major = get_major(id=username, password=_password)
					user = User.objects.create_user(username=username, password=password)
					user.profile.nickname = nickname
					user.profile.major = major
					user.save()
					response['result'] = True
					message = '가입 되었습니다.'
					response['url'] = reverse('community:index')
				else:
					message = '포털 아이디 또는 비밀번호를 확인해주세요.'
			else:
				message = [v for v in user_form.errors.values()][0]
		else:
			message = [v for v in profile_form.errors.values()][0]
		response['message'] = message
		return render(request, 'account/alert.html', context=response)

@require_http_methods(["GET", "POST"])
def signin(request):
	if request.method == 'GET':
		return render(request, 'account/login.html')
	else:
		response = {}
		response['result'] = False
		login_form = LoginForm(request.POST)
		if login_form.is_valid():
			username = login_form.cleaned_data['username']
			password = login_form.cleaned_data['password']
			user = authenticate(username=username, password=password)
			if user is not None:
				login(request, user)
				is_long = request.POST.get('nvlong')
				if is_long:
					request.session.set_expiry(2147483647)
				else:
					request.session.set_expiry(600)
				next = request.GET.get('next', '')
				if next == '':
					return redirect(reverse('community:index'))
				else:
					return redirect(next)
			else:
				message = '아이디 또는 비밀번호를 확인해주세요.'
		else:
			message = [v for v in login_form.errors.values()][0]
		response['message'] = message
		return render(request, 'account/alert.html', context=response)

@require_safe 
def logout(request):
	_logout(request)
	return redirect(reverse('community:index'))

@login_required
def mypage(request):
	return render(request, 'account/mypage.html')

@require_http_methods(['GET', 'POST'])
def find_password(request):
	if request.method == 'GET':
		return render(request, 'account/pw_reset.html')
	else:
		response = {}
		response['result'] = False
		find_form = FindForm(request.POST)
		if find_form.is_valid():
			username = find_form.cleaned_data['username']
			password = find_form.cleaned_data['portal_password']
			new_password = find_form.cleaned_data['new_password']
			if User.objects.filter(username=username).exists():
				if check_pknu(id=username, password=password):
					user = get_object_or_404(User, username=username)
					user.set_password(new_password)
					user.save()
					response['result'] = True
					message = '변경되었습니다'
					response['url'] = reverse('account:login')
					_logout(request)
				else:
					message = '포털 아이디 또는 비밀번호를 확인해주세요.'
			else:
				message = '가입된 사용자가 없습니다.'
		else:
			message = [v for v in find_form.errors.values()][0]
		response['message'] = message
		return render(request, 'account/alert.html', context=response)

@login_required
@require_http_methods(['GET', 'POST'])
def set_profile(request):
	if request.method == 'GET':
		return render(request, 'account/profile_setting.html')
	else:
		response = {}
		nickname = request.POST.get('nickname')
		image = request.POST.get('image')
		profile = request.user.profile
		if nickname != profile.nickname and nickname != '' and len(nickname)<11 and len(nickname)>1:
			if User.objects.filter(profile__nickname__iexact=nickname).exists():
				response['result'] = False
				response['message'] = "이미 사용 중인 닉네임입니다."
				return JsonResponse(response)
			profile.nickname = nickname
		if image != profile.profile_image and image != None:
			src = upload_image(image)
			if src != False:
				profile.profile_image = src
		profile.save()
		response['result'] = True
		response['url'] = reverse('account:mypage')
		return JsonResponse(response)

@require_safe
def validate_nickname(request):
	if request.is_ajax():
		nickname = request.GET.get('nickname')
		response = {'result': not Profile.objects.filter(nickname__iexact=nickname).exists()}
		return JsonResponse(response)