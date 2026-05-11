from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pipeline, PipelineRun
from .serializer import PipelineSerializer, PipelineRunSerializer
from .etl import run_etl
import threading

class PipelineViewSet(viewsets.ModelViewSet):
    queryset = Pipeline.objects.all().order_by('-created_at')
    serializer_class = PipelineSerializer

    @action(detail=True, methods=['post'])
    def trigger(self, request, pk=None):
        pipeline = self.get_object()

        # Create a new run record
        run = PipelineRun.objects.create(
            pipeline=pipeline,
            status='pending',
            log='Run created, waiting to start...\n'
        )

        # Run ETL in background thread (Celery in production)
        thread = threading.Thread(target=run_etl, args=[run.id])
        thread.daemon = True
        thread.start()

        return Response({
            'message': f'Pipeline "{pipeline.name}" triggered.',
            'run_id': run.id
        }, status=status.HTTP_201_CREATED)


class PipelineRunViewSet(viewsets.ModelViewSet):
    queryset = PipelineRun.objects.all().order_by('-started_at')
    serializer_class = PipelineRunSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        pipeline_id = self.request.query_params.get('pipeline')
        if pipeline_id:
            queryset = queryset.filter(pipeline_id=pipeline_id)
        return queryset
    