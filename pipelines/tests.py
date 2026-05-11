from django.test import TestCase
from .models import Pipeline, PipelineRun

class PipelineModelTest(TestCase):

    def test_create_pipeline(self):
        pipeline = Pipeline.objects.create(
            name='Test Pipeline',
            description='A test pipeline',
            source='CSV',
            status='active'
        )
        self.assertEqual(pipeline.name, 'Test Pipeline')
        self.assertEqual(pipeline.status, 'active')

    def test_pipeline_str(self):
        pipeline = Pipeline.objects.create(
            name='My Pipeline', source='S3'
        )
        self.assertEqual(str(pipeline), 'My Pipeline')

    def test_create_pipeline_run(self):
        pipeline = Pipeline.objects.create(
            name='Run Test Pipeline', source='API'
        )
        run = PipelineRun.objects.create(
            pipeline=pipeline,
            status='success',
            records_processed=10
        )
        self.assertEqual(run.status, 'success')
        self.assertEqual(run.records_processed, 10)