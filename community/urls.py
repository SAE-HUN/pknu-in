from django.urls import path, re_path

from . import views

app_name = 'community'

urlpatterns = [
    path('', views.index, name='index'),
    path('notice', views.notice, name='notice'),
    path('popular', views.popular, name='popular'),
    path('popular/<int:page>', views.more_popular, name='more_popoular'),
    path('_search', views._search, name='_search'),
    path('search', views.search, name='search'),
    path('search/<int:page>', views.more_search, name='more_search'),
    path('write/', views.write_post, name='write_post'),
    path('more/<int:page>', views.more, name='more'),
    re_path(r'(?P<category>BMB|FRE|TWK|LAF)/$', views.board, name='board'),
    re_path(r'(?P<category>BMB|FRE|TWK|LAF|NTC)/(?P<postID>\d+)/$', views.post_detail, name='post_detail'),
    re_path(r'(?P<category>BMB|FRE|TWK|LAF|NTC)/(?P<postID>\d+)/delete', views.delete_post, name='delete_post'),
    re_path(r'(?P<category>BMB|FRE|TWK|LAF|NTC)/(?P<postID>\d+)/update', views.update_post, name='update_post'),
    re_path(r'(?P<category>BMB|FRE|TWK|LAF|NTC)/(?P<postID>\d+)/report', views.report_post, name='report_post'),
    re_path(r'(?P<category>BMB|FRE|TWK|LAF|NTC)/(?P<postID>\d+)/like', views.like, name='like'),
    re_path(r'(?P<category>BMB|FRE|TWK|LAF|NTC)/(?P<postID>\d+)/comment', views.write_comment, name='write_comment'),
    path('delete/comment/<int:commentID>', views.delete_comment, name='delete_comment'),
    path('report/comment/<int:commentID>', views.report_comment, name='report_comment'),
    path('recomment/comment/<int:commentID>', views.write_recomment, name='write_recomment'),
    path('delete/recomment/<int:recommentID>', views.delete_recomment, name='delete_recomment'),
    path('report/recomment/<int:recommentID>', views.report_recomment, name='report_recomment'),
]