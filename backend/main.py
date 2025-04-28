from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List
from backend.db import db
from backend.models import ProjectCreate, UploadCreate, TestCaseCreate
import pandas as pd
from bson import ObjectId
import datetime
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve dashboard at root
@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

# Helper to generate next S.No for a project
def get_next_sno(project_code: str, project_id: str):
    last = db.test_cases.find({"project_id": project_id, "s_no": {"$regex": f"^{project_code}-"}}).sort("s_no", -1).limit(1)
    for doc in last:
        last_num = int(doc["s_no"].split("-")[-1])
        return f"{project_code}-{last_num+1:04d}"
    return f"{project_code}-0001"

@app.post("/projects")
def create_project(project: ProjectCreate):
    existing = db.projects.find_one({"name": project.name})
    if existing:
        return {"id": str(existing["_id"]), "name": existing["name"]}
    result = db.projects.insert_one({"name": project.name})
    return {"id": str(result.inserted_id), "name": project.name}

@app.get("/projects")
def list_projects():
    return [{"id": str(p["_id"]), "name": p["name"]} for p in db.projects.find()]

@app.get("/projects/{project_id}")
def get_project(project_id: str):
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": str(project["_id"]), "name": project["name"]}

@app.post("/uploads")
def create_upload(
    project_id: str = Form(...),
    name: str = Form(...),
    reporter: str = Form(...),
    file: UploadFile = File(...)
):
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project_code = project["name"]
    upload_doc = {
        "project_id": project_id,
        "name": name,
        "reporter": reporter,
        "uploaded_at": datetime.datetime.utcnow().isoformat()
    }
    upload_id = db.uploads.insert_one(upload_doc).inserted_id
    # Parse CSV
    df = pd.read_csv(file.file)
    test_cases = []
    for idx, row in df.iterrows():
        sno = get_next_sno(project_code, project_id)
        db.test_cases.insert_one({
            "upload_id": str(upload_id),
            "project_id": project_id,
            "s_no": sno,
            "summary": str(row.get("Summary", "")) if pd.notna(row.get("Summary", "")) else "",
            "data": str(row.get("Data", "")) if pd.notna(row.get("Data", "")) else "",
            "test_steps": str(row.get("test steps", "")) if pd.notna(row.get("test steps", "")) else "",
            "expected_result": str(row.get("exppected result", "")) if pd.notna(row.get("exppected result", "")) else "",
            "execution_status": str(row.get("Execution status", "TODO")) if pd.notna(row.get("Execution status", "TODO")) else "TODO",
            "execution_last_modified_timestamp": None,
            "executed_by": None,
            "comment": None,
            "reporter": reporter
        })
    return {"upload_id": str(upload_id)}

@app.get("/uploads/{project_id}")
def list_uploads(project_id: str):
    return [{"id": str(u["_id"]), "name": u["name"], "reporter": u["reporter"], "uploaded_at": u["uploaded_at"]} for u in db.uploads.find({"project_id": project_id})]

@app.get("/testcases/{project_id}")
def get_testcases(project_id: str):
    testcases = list(db.test_cases.find({"project_id": project_id}))
    return [{
        "id": str(tc["_id"]),
        "s_no": tc["s_no"],
        "summary": tc["summary"],
        "data": tc["data"],
        "test_steps": tc["test_steps"],
        "expected_result": tc["expected_result"],
        "execution_status": tc.get("execution_status", "TODO"),
        "execution_last_modified_timestamp": tc.get("execution_last_modified_timestamp"),
        "executed_by": tc.get("executed_by"),
        "comment": tc.get("comment"),
        "reporter": tc.get("reporter")
    } for tc in testcases]

@app.put("/testcases/{testcase_id}")
def update_testcase(testcase_id: str, data: dict):
    db.test_cases.update_one(
        {"_id": ObjectId(testcase_id)},
        {"$set": data}
    )
    return {"status": "ok"}

@app.delete("/uploads/{upload_id}")
def delete_upload(upload_id: str):
    result = db.uploads.delete_one({"_id": ObjectId(upload_id)})
    db.test_cases.delete_many({"upload_id": upload_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")
    return {"status": "deleted"} 