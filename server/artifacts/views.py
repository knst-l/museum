from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Artifact, ArtifactCategory, GalleryFolder, Hall, HallCategory, MediaArchiveItem
from .serializers import (
    ArtifactCategorySerializer,
    ArtifactCreateUpdateSerializer,
    ArtifactSerializer,
    GalleryFolderSerializer,
    HallCategorySerializer,
    HallCreateUpdateSerializer,
    HallSerializer,
    MediaArchiveItemCreateUpdateSerializer,
    MediaArchiveItemSerializer,
)


class HallCategoryFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = HallCategory
        fields = ["name"]


class HallFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr="icontains")
    category = filters.ModelChoiceFilter(queryset=HallCategory.objects.all())

    class Meta:
        model = Hall
        fields = ["name", "category"]


class ArtifactCategoryFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = ArtifactCategory
        fields = ["name"]


class ArtifactFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr="icontains")
    category = filters.ModelChoiceFilter(queryset=ArtifactCategory.objects.all())
    hall = filters.ModelChoiceFilter(queryset=Hall.objects.all())
    creation_year = filters.NumberFilter()
    creation_year_from = filters.NumberFilter(field_name="creation_year", lookup_expr="gte")
    creation_year_to = filters.NumberFilter(field_name="creation_year", lookup_expr="lte")

    class Meta:
        model = Artifact
        fields = ["name", "category", "hall", "creation_year", "creation_year_from", "creation_year_to"]


class GalleryFolderFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr="icontains")
    is_published = filters.BooleanFilter()

    class Meta:
        model = GalleryFolder
        fields = ["name", "is_published"]


class MediaArchiveItemFilter(filters.FilterSet):
    title = filters.CharFilter(lookup_expr="icontains")
    folder = filters.ModelChoiceFilter(queryset=GalleryFolder.objects.all())
    is_published = filters.BooleanFilter()

    class Meta:
        model = MediaArchiveItem
        fields = ["title", "folder", "is_published"]


class HallCategoryViewSet(viewsets.ModelViewSet):
    queryset = HallCategory.objects.all()
    serializer_class = HallCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HallCategoryFilter
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class HallViewSet(viewsets.ModelViewSet):
    queryset = Hall.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HallFilter
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return HallCreateUpdateSerializer
        return HallSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ArtifactCategoryViewSet(viewsets.ModelViewSet):
    queryset = ArtifactCategory.objects.all()
    serializer_class = ArtifactCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ArtifactCategoryFilter
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class ArtifactViewSet(viewsets.ModelViewSet):
    queryset = Artifact.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ArtifactFilter
    search_fields = ["name", "description"]
    ordering_fields = ["name", "creation_year", "created_at"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ArtifactCreateUpdateSerializer
        return ArtifactSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class GalleryFolderViewSet(viewsets.ModelViewSet):
    queryset = GalleryFolder.objects.all()
    serializer_class = GalleryFolderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = GalleryFolderFilter
    search_fields = ["name", "description"]
    ordering_fields = ["display_order", "name", "created_at"]
    ordering = ["display_order", "id"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ["list", "retrieve"] and not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return queryset


class MediaArchiveItemViewSet(viewsets.ModelViewSet):
    queryset = MediaArchiveItem.objects.select_related("image", "folder").all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MediaArchiveItemFilter
    search_fields = ["title", "description", "year_label"]
    ordering_fields = ["display_order", "title", "created_at"]
    ordering = ["display_order", "id"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ["list", "retrieve"] and not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True, folder__is_published=True)
        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return MediaArchiveItemCreateUpdateSerializer
        return MediaArchiveItemSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
