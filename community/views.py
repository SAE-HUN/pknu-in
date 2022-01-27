from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string
from django.core.paginator import Paginator
from django.urls import reverse
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.http import require_safe, require_http_methods
from django.core import serializers
from django.contrib.auth.decorators import login_required

from .models import Post, Like, Comment, Recomment, ReportPost, ReportComment, ReportRecomment
from .forms import PostForm, CommentForm, RecommentForm, ReportPostForm, ReportCommentForm, ReportRecommentForm
from .libs.query import upload_image, update_image
import json

@require_safe 
def index(request):
	posts = Post.objects.filter(blind=False, deleted=False)
	posts = Paginator(posts, 20).get_page(1)
	return render(request, 'community/index.html', {'posts':posts, 'category':''})

@require_safe 
def notice(request):
	posts = Post.objects.filter(category='NTC', blind=False, deleted=False)
	posts = Paginator(posts, 20).get_page(1)
	return render(request, 'community/index.html', {'posts':posts, 'category':'NTC'})

@require_safe
def board(request, category):
	posts = Post.objects.filter(category=category, blind=False, deleted=False)
	posts = Paginator(posts, 20).get_page(1)
	return render(request, 'community/board.html', {'posts':posts, 'category':category})

@require_safe
def more(request, page):
	if request.is_ajax():	
		category = request.GET['category']
		if category == '':
			posts = Post.objects.filter(blind=False, deleted=False)
		else:
			posts = Post.objects.filter(category=category, blind=False, deleted=False)
		posts = Paginator(posts, 20).get_page(page)
		more_posts = render_to_string('community/post_list.html', {'posts':posts, 'category': category})
		pagination = render_to_string('community/pagination.html', {'posts':posts, 'category':category})
		return JsonResponse({'posts':more_posts, 'pagination':pagination})

@require_safe
def popular(request):
	posts = Post.objects.filter(is_popular=True, deleted=False, blind=False)
	posts = Paginator(posts, 20).get_page(1)
	return render(request, 'community/popular.html', {'posts':posts, 'category': ''})

@require_safe
def more_popular(request, page):
	if request.is_ajax():
		posts = Post.objects.filter(is_popular=True, blind=False, deleted=False)
		posts = Paginator(posts, 20).get_page(page)
		more_posts = render_to_string('community/post_list.html', {'posts':posts, 'category': ''})
		pagination = render_to_string('community/pagination_popular.html', {'posts':posts})
		return JsonResponse({'posts':more_posts, 'pagination':pagination})

@require_safe
def post_detail(request, category, postID):
	post = get_object_or_404(Post, id=postID, blind=False, deleted=False)
	post.views = post.views + 1
	post.save()
	if request.user.is_authenticated:
		is_liked = Like.objects.filter(user=request.user.profile, post=post).exists()
	else:
		is_liked = False
	return render(request, 'community/view.html', {'post':post, 'is_liked':is_liked})

@login_required
@require_http_methods(['GET', 'POST'])
def write_post(request):
	if request.method == 'GET':
		return render(request, 'community/write.html')
	else:
		category = request.POST.get('category')
		if category == 'NTC':
			raise Http404
		response = {}
		post_form = PostForm(request.POST)
		if post_form.is_valid():
			post = Post(**post_form.cleaned_data, author=request.user.profile)
			post.save()
			images = request.POST.get('images')
			images = json.loads(images)
			upload_image(post, images)
			response['result'] = True
			response['url'] = post.get_absolute_url()
		else:
			response['result'] = False
			response['message'] = [v for v in post_form.errors.values()][0]
		return JsonResponse(response)

@login_required
@require_http_methods(['GET', 'POST'])
def update_post(request, category, postID):
	if Post.objects.filter(id=postID, author=request.user.profile).exists():
		if request.method == 'GET':
			post = get_object_or_404(Post, id=postID, blind=False, deleted=False)
			images = serializers.serialize('json', post.images.all(), fields=('src'))
			return render(request, 'community/update.html', {'post':post, 'before_images':images})
		else:
			category = request.POST.get('category')
			if category == 'NTC':
				raise Http404
			response = {}
			form = PostForm(request.POST)
			if form.is_valid():
				post = get_object_or_404(Post, id=postID)
				cleaned_data = form.cleaned_data
				post.title = cleaned_data['title']
				post.description = cleaned_data['description']
				post.category = cleaned_data['category']
				post.save()
				images = request.POST.get('images')
				images = json.loads(images)
				post.images.all().delete()
				update_image(post, images)
				response['result'] = True
				response['url'] = post.get_absolute_url()
			else:
				response['result'] = False
				response['message'] = [v for v in form.errors.values()][0]
			return JsonResponse(response)
	else:
		raise Http404

@login_required
@require_safe
def delete_post(request, category, postID):
	if Post.objects.filter(id=postID, author=request.user.profile).exists():
		post = get_object_or_404(Post, id=postID, blind=False, deleted=False)
		post.deleted = True
		post.save()
		return redirect(reverse('community:board', args=[post.category]))
	else:
		raise Http404

@login_required
@require_http_methods(['GET', 'POST'])
def report_post(request, category, postID):
	response = dict()
	response['result'] = False
	profile = request.user.profile
	if ReportPost.objects.filter(user=profile, post_id=postID).exists():
		message = '이미 신고 하셨습니다.'
	elif request.method == 'GET':
		post = get_object_or_404(Post, id=postID, blind=False, deleted=False)
		return render(request, 'community/report_post.html', {'post':post})
	elif request.method == 'POST':
		form = ReportPostForm(request.POST)
		if form.is_valid():
			report = ReportPost(user=profile, post_id=postID, reason=form.cleaned_data['reason'])
			report.save()
			response['result'] = True
			message = '신고가 접수 되었습니다.'
			response['url'] = 'history.go(-2)'
		else:
			message = [v for v in form.errors.values()][0]
	response['message'] = message
	return render(request, 'community/alert.html', context=response)

@login_required
@require_safe
def like(request, category, postID):
	if request.is_ajax():
		response = dict()
		profile = request.user.profile
		if Like.objects.filter(user=profile, post_id=postID).exists():
			response['result'] = False
			response['message'] = '이미 좋아요 하셨습니다.'
		else:
			post = get_object_or_404(Post, id=postID, blind=False, deleted=False)
			like = Like(user=profile, post_id=postID)
			like.save()
			response['result'] = True
			response['html'] = render(request, 'community/footer.html', {'is_liked':True, 'post':post}).content.decode('utf-8')
		return JsonResponse(response)

@login_required
@require_http_methods(['POST'])
def write_comment(request, category, postID):
	if request.is_ajax():
		response = dict()
		form = CommentForm(request.POST)
		if form.is_valid():
			profile = request.user.profile
			post = get_object_or_404(Post, id=postID, blind=False, deleted=False)
			comment = Comment(**form.cleaned_data, writer=profile, post=post)
			comment.save()
			is_liked = Like.objects.filter(user=profile, post=post).exists()
			response['result'] = True
			response['comments'] = render(request, 'community/comment_list.html', {'post':post}).content.decode('utf-8')
			response['footer'] = render(request, 'community/footer.html', {'post':post, 'is_liked':is_liked}).content.decode('utf-8')
		else:
			response['result'] = False
			response['message'] = [v for v in form.errors.values()][0]
		return JsonResponse(response)

@login_required
@require_safe
def delete_comment(request, commentID):
	if request.is_ajax():
		if Comment.objects.filter(id=commentID, writer=request.user.profile).exists():
			comment = get_object_or_404(Comment, id=commentID, deleted=False, blind=False)
			comment.deleted = True
			comment.save()
			comments = render(request, 'community/comment_list.html', {'post':comment.post}).content.decode('utf-8')
			return JsonResponse({'result':True, 'comments':comments})

@login_required
@require_http_methods(['GET', 'POST'])
def report_comment(request, commentID):
	response = dict()
	response['result'] = False
	profile = request.user.profile
	if ReportComment.objects.filter(user=profile, comment_id=commentID).exists():
		message = '이미 신고 하셨습니다.'
	elif request.method == 'GET':
		comment = get_object_or_404(Comment, id=commentID, blind=False, deleted=False)
		return render(request, 'community/report_comment.html', {'comment':comment})
	elif request.method == 'POST':
		form = ReportCommentForm(request.POST)
		if form.is_valid():
			report = ReportComment(user=profile, comment_id=commentID, reason=form.cleaned_data['reason'])
			report.save()
			response['result'] = True
			message = '신고가 접수 되었습니다.'
			response['url'] = 'history.go(-2)'
		else:
			message = [v for v in form.errors.values()][0]
	response['message'] = message
	return render(request, 'community/alert.html', context=response)

@login_required
@require_http_methods(['POST'])
def write_recomment(request, commentID):
	if request.is_ajax():
		response = dict()
		form = RecommentForm(request.POST)
		if form.is_valid():
			profile = request.user.profile
			comment = get_object_or_404(Comment, id=commentID, blind=False, deleted=False)
			recomment = Recomment(**form.cleaned_data, writer=profile, comment=comment, post=comment.post)
			recomment.save()
			is_liked = Like.objects.filter(user=profile, post=comment.post).exists()
			response['result'] = True
			response['recomments'] = render(request, 'community/recomment_list.html', {'comment':comment}).content.decode('utf-8')
			response['footer'] = render(request, 'community/footer.html', {'post':comment.post, 'is_liked':is_liked}).content.decode('utf-8')
		else:
			response['result'] = False
			response['message'] = [v for v in form.errors.values()][0]
		return JsonResponse(response)

@login_required
@require_safe
def delete_recomment(request, recommentID):
	if request.is_ajax():
		if Recomment.objects.filter(id=recommentID, writer=request.user.profile).exists():
			recomment = get_object_or_404(Recomment, id=recommentID, blind=False, deleted=False)
			recomment.deleted = True
			recomment.save()
			commentID = request.GET['commentID']
			comment = get_object_or_404(Comment, id=commentID)
			recomments = render(request, 'community/recomment_list.html', {'comment':comment}).content.decode('utf-8')
			return JsonResponse({'result':True, 'recomments':recomments})

@login_required
@require_http_methods(['GET', 'POST'])
def report_recomment(request, recommentID):
	response = dict()
	response['result'] = False
	profile = request.user.profile
	if ReportRecomment.objects.filter(user=profile, recomment_id=recommentID).exists():
		response['result'] = False
		message = '이미 신고 하셨습니다.'
	elif request.method == 'GET':
		recomment = get_object_or_404(Recomment, id=recommentID, blind=False, deleted=False)
		return render(request, 'community/report_recomment.html', {'recomment':recomment})
	elif request.method == 'POST':
		form = ReportRecommentForm(request.POST)
		if form.is_valid():
			report = ReportRecomment(user=profile, recomment_id=recommentID, reason=form.cleaned_data['reason'])
			report.save()
			response['result'] = True
			message = '신고가 접수 되었습니다.'
			response['url'] = 'history.go(-2)'
		else:
			message = [v for v in form.errors.values()][0]
	response['message'] = message
	return render(request, 'community/alert.html', context=response)

@require_safe
def _search(request):
	return render(request, 'community/_search.html')

@require_safe
def search(request):
	keyword = request.GET['keyword']
	category = request.GET['category']
	type = request.GET['type']
	order = request.GET['order']
	if type == 'title':
		posts = Post.objects.filter(title__icontains=keyword)
	elif type == 'description':
		posts = Post.objects.filter(description__icontains=keyword)|Post.objects.filter(title__icontains=keyword)
	else:
		posts = Post.objects.filter(author__nickname__icontains=keyword)
	if category != '':
		posts = posts.filter(category=category)
	if order != '-writed_time':
		posts = posts.order_by(order)
	posts = posts.filter(blind=False, deleted=False)
	posts = Paginator(posts, 20).get_page(1)
	return render(request, 'community/search.html', {'posts':posts, 'keyword':keyword, 'category':category, 'type':type, 'order':order})

@require_safe
def more_search(request, page):
	if request.is_ajax():
		keyword = request.GET['keyword']
		category = request.GET['category']
		type = request.GET['type']
		order = request.GET['order']
		if type == 'title':
			posts = Post.objects.filter(title__icontains=keyword)
		elif type == 'description':
			posts = Post.objects.filter(description__icontains=keyword)|Post.objects.filter(title__icontains=keyword)
		else:
			posts = Post.objects.filter(author__nickname__icontains=keyword)
		if category != '':
			posts = posts.filter(category=category)
		if order != '-writed_time':
			posts = posts.order_by(order)
		posts = posts.filter(blind=False, deleted=False)
		posts = Paginator(posts, 20).get_page(page)
		posts = render_to_string('community/search_list.html', {'posts':posts})
		pagination = render_to_string('community/pagination_search.html', {'posts':posts, 'keyword':keyword, 'category':category, 'type':type, 'order':order})
		return JsonResponse({'posts':posts, 'pagination':pagination})