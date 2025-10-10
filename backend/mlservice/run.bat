@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo Starting FastAPI ML Service...
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause