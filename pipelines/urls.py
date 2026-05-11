from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PipelineViewSet, PipelineRunViewSet

router = DefaultRouter()
router.register(r'pipelines', PipelineViewSet)
router.register(r'runs', PipelineRunViewSet)

urlpatterns = [
    path('', include(router.urls)),
]