from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageViewSet, Model3DViewSet

router = DefaultRouter()
router.register(r'images', ImageViewSet)
router.register(r'models3d', Model3DViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

