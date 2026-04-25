from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScienceFieldViewSet, HistoricalFigureViewSet

router = DefaultRouter()
router.register(r'science-fields', ScienceFieldViewSet)
router.register(r'historical-figures', HistoricalFigureViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

