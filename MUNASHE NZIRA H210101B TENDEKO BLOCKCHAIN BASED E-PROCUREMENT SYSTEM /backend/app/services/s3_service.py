from fastapi import UploadFile
import uuid
from typing import List
from sqlalchemy.orm import Session
# from google.cloud import storage
# from azure.storage.blob import BlobServiceClient
# from azure.storage.blob import ContentSettings
import boto3
from decouple import config
from app.services.bidevaluation import BidEvaluationService

# AWS S3
s3_client = boto3.client(
    "s3",
    aws_access_key_id=config('AWS_ACCESS_KEY'),
    aws_secret_access_key=config('AWS_SECRET_KEY'),
    region_name=config('AWS_REGION'),
)

# # Google Cloud Storage
# gcs_client = storage.Client.from_service_account_json(settings.GOOGLE_CREDENTIALS_PATH)
# gcs_bucket = gcs_client.bucket(settings.GCS_BUCKET_NAME)

# # Azure Blob Storage
# azure_client = BlobServiceClient(
#     account_url=f"https://{settings.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net",
#     credential=settings.AZURE_STORAGE_KEY
# )
# azure_container = azure_client.get_container_client(settings.AZURE_CONTAINER_NAME)

# AWS S3 Functions
def upload_file_to_s3(file_path: str, file_name: str) -> str:
    s3_client.upload_file(file_path, config('AWS_BUCKET_NAME'), file_name)
    return f"https://{config('AWS_BUCKET_NAME')}.s3.{config('AWS_REGION')}.amazonaws.com/{file_name}"

def upload_files_to_s3(files: List[UploadFile]) -> List[dict]:
    uploaded_files = []
    
    for file in files:
        original_file_name = file.filename
        file_extension = original_file_name.split(".")[-1]
        unique_file_name = f"{uuid.uuid4()}.{file_extension}"
        s3_client.upload_fileobj(file.file, config('AWS_BUCKET_NAME'), unique_file_name)
        file_url = f"https://{config('AWS_BUCKET_NAME')}.s3.{config('AWS_REGION')}.amazonaws.com/{unique_file_name}"
        
        uploaded_files.append({
            "original_name": original_file_name,
            "url": file_url
        })
    
    return uploaded_files


def handle_files(db: Session ,files: List[UploadFile]) -> List[dict]:
    uploaded_files = []
    
    for file in files:
        service = BidEvaluationService(db)
        issues = service.check_tender_notice_issues(file)
            
        original_file_name = file.filename
        file_extension = original_file_name.split(".")[-1]
        unique_file_name = f"{uuid.uuid4()}.{file_extension}"
        s3_client.upload_fileobj(file.file, config('AWS_BUCKET_NAME'), unique_file_name)
        file_url = f"https://{config('AWS_BUCKET_NAME')}.s3.{config('AWS_REGION')}.amazonaws.com/{unique_file_name}"
        
        uploaded_files.append({
            "original_name": original_file_name,
            "url": file_url,
            "issues": issues
        })
    
    return uploaded_files

# Google Cloud Storage Functions
# def upload_file_to_gcs(file_path: str, file_name: str) -> str:
#     blob = gcs_bucket.blob(file_name)
#     blob.upload_from_filename(file_path)
#     return f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{file_name}"

# def upload_files_to_gcs(files: List[UploadFile]) -> List[dict]:
#     uploaded_files = []
    
#     for file in files:
#         original_file_name = file.filename
#         file_extension = original_file_name.split(".")[-1]
#         unique_file_name = f"{uuid.uuid4()}.{file_extension}"
        
#         blob = gcs_bucket.blob(unique_file_name)
#         blob.upload_from_file(file.file)
#         file_url = f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{unique_file_name}"
        
#         uploaded_files.append({
#             "original_name": original_file_name,
#             "url": file_url
#         })
    
#     return uploaded_files

# # Azure Blob Storage Functions
# def upload_file_to_azure(file_path: str, file_name: str) -> str:
#     with open(file_path, "rb") as data:
#         blob_client = azure_container.get_blob_client(file_name)
#         blob_client.upload_blob(data)
#     return f"https://{settings.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/{settings.AZURE_CONTAINER_NAME}/{file_name}"

# def upload_files_to_azure(files: List[UploadFile]) -> List[dict]:
    # uploaded_files = []
    
    # for file in files:
    #     original_file_name = file.filename
    #     file_extension = original_file_name.split(".")[-1]
    #     unique_file_name = f"{uuid.uuid4()}.{file_extension}"
        
    #     blob_client = azure_container.get_blob_client(unique_file_name)
    #     blob_client.upload_blob(file.file)
    #     file_url = f"https://{settings.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/{settings.AZURE_CONTAINER_NAME}/{unique_file_name}"
        
    #     uploaded_files.append({
    #         "original_name": original_file_name,
    #         "url": file_url
    #     })
    
    # return uploaded_files