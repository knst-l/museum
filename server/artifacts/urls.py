from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HallCategoryViewSet, 
    HallViewSet, 
    ArtifactCategoryViewSet, 
    ArtifactViewSet
)

router = DefaultRouter()
router.register(r'hall-categories', HallCategoryViewSet)
router.register(r'halls', HallViewSet)
router.register(r'artifact-categories', ArtifactCategoryViewSet)
router.register(r'artifacts', ArtifactViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

