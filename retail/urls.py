from django.urls import path
from . import views

urlpatterns = [
    path('section', views.SectionView.as_view()),
    path('section/image_presigned_post', views.SectionImagePresignedPostView.as_view()),
    path('store/sales', views.SalesInfoAPIView.as_view()),
]



