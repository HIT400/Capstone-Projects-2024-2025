# tests/services/test_tender.py
import pytest
from unittest.mock import MagicMock
from app.services.tender import create_tender
from app.models.tender import TenderCreate
from app.schemas.db_config import User

#############################
# Purpose: Test individual units (functions/classes) in isolation.
#
# Tools:
#   - unittest.mock or pytest-mock for mocking dependencies
#   - pytest
##############################
def test_create_tender_success():
    mock_db = MagicMock()
    mock_user = User(id="user-id-123")
    tender_data = TenderCreate(
        title="Test Tender",
        description="Test Description",
        procurement_method="open",
        procurement_method_type="international",
        expected_value=100000,
        currency="USD",
        value_added_tax_included=True,
        status="active",
        closing_date="2025-12-31",
        procurement_category_id="cat123",
        procurement_subcategory_id="subcat456",
        items=[]  # keep simple for now
    )

    # call service
    tender_id = create_tender(mock_db, tender_data, mock_user, [])

    assert tender_id is not None
    mock_db.commit.assert_called_once()
