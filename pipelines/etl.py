import pandas as pd
from datetime import datetime
from .models import PipelineRun

def run_etl(pipeline_run_id):
    run = PipelineRun.objects.get(id=pipeline_run_id)

    try:
        # Mark as running
        run.status = 'running'
        run.started_at = datetime.utcnow()
        run.log = 'ETL started...\n'
        run.save()

        # ── EXTRACT ──
        run.log += 'Extracting data...\n'
        run.save()

        # Sample financial data (simulates CSV/S3 source)
        data = {
            'company': ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra'],
            'revenue':  [2500, 1800, 1200, None, 900],
            'employees':[600000, 340000, 250000, 220000, 150000],
            'sector':   ['IT', 'IT', 'IT', 'it', 'IT'],
        }
        df = pd.DataFrame(data)
        run.log += f'Extracted {len(df)} records.\n'
        run.save()

        # ── TRANSFORM ──
        run.log += 'Transforming data...\n'
        run.save()

        # 1. Drop nulls
        before = len(df)
        df = df.dropna()
        run.log += f'Null rows removed: {before - len(df)}\n'

        # 2. Normalise sector to uppercase
        df['sector'] = df['sector'].str.upper()

        # 3. Add computed column
        df['revenue_per_employee'] = (df['revenue'] * 1000 / df['employees']).round(2)

        run.log += f'Transformation complete. {len(df)} records ready to load.\n'
        run.save()

        # ── LOAD ──
        run.log += 'Loading data into database...\n'
        run.save()

        # In production this would insert to PostgreSQL/Databricks
        # For now we log the output
        run.log += f'Loaded data:\n{df.to_string()}\n'
        run.records_processed = len(df)
        run.save()

        # ── DONE ──
        run.status = 'success'
        run.finished_at = datetime.utcnow()
        run.log += 'ETL completed successfully.\n'
        run.save()

    except Exception as e:
        run.status = 'failed'
        run.finished_at = datetime.utcnow()
        run.error_message = str(e)
        run.log += f'ERROR: {str(e)}\n'
        run.save()
        