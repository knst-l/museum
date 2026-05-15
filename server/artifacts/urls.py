from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ArtifactCategoryViewSet,
    ArtifactViewSet,
    GalleryFolderViewSet,
    HallCategoryViewSet,
    HallViewSet,
    MediaArchiveItemViewSet,
)

router = DefaultRouter()
router.register(r"hall-categories", HallCategoryViewSet)
router.register(r"halls", HallViewSet)
router.register(r"artifact-categories", ArtifactCategoryViewSet)
router.register(r"artifacts", ArtifactViewSet)
router.register(r"gallery-folders", GalleryFolderViewSet)
router.register(r"media-archive-items", MediaArchiveItemViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
