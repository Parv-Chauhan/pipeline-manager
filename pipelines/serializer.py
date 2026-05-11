from rest_framework import serializers
from .models import Pipeline, PipelineRun

class PipelineRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipelineRun
        fields = '__all__'

class PipelineSerializer(serializers.ModelSerializer):
    runs = PipelineRunSerializer(many=True, read_only=True)
    last_run_status = serializers.SerializerMethodField()

    class Meta:
        model = Pipeline
        fields = ['id', 'name', 'description', 'source', 'status', 'created_at', 'updated_at', 'runs', 'last_run_status']

    def get_last_run_status(self, obj):
        last = obj.runs.order_by('-started_at').first()
        return last.status if last else 'never'
    