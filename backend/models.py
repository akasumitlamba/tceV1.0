from pydantic import BaseModel, Field
from typing import List, Optional

class ProjectCreate(BaseModel):
    name: str

class Project(BaseModel):
    id: str
    name: str

class UploadCreate(BaseModel):
    project_id: str
    name: str
    reporter: str

class Upload(BaseModel):
    id: str
    project_id: str
    name: str
    reporter: str
    uploaded_at: str

class TestCaseCreate(BaseModel):
    upload_id: str
    project_id: str
    summary: str
    data: str
    test_steps: str
    expected_result: str
    executed_by: Optional[str] = None
    comment: Optional[str] = None

class TestCase(TestCaseCreate):
    id: str
    s_no: str
    execution_status: Optional[str] = None
    execution_last_modified_timestamp: Optional[str] = None 