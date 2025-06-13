from fastapi import UploadFile
from typing import List, Dict, Tuple
from dataclasses import dataclass, asdict, field
import json
import logging
from sqlalchemy.orm import Session
from app.schemas.db_config import Tender, Bid, Contract, BidEvaluation, ContractStatus, TenderStatus, Award,  SessionLocal
from datetime import datetime
from openai import OpenAI
from decouple import config
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
import pytz
import os

logging.basicConfig(level=logging.INFO)

llm_client = OpenAI(
    api_key=config('LLM_API_KEY'),
    base_url=config('LLM_BASE_URL')
)

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)
    
scheduler = BackgroundScheduler()
@dataclass
class BidEvaluationSchema:
    bid_id: str
    total_score: float
    price_score: float
    technical_score: float
    compliance_score: float
    evaluation_summary: str
    flags: List[str]
    evaluation_date: datetime

    def to_dict(self):
        return asdict(self)
    
    def to_json(self):
        return json.dumps(self.to_dict(), cls=EnhancedJSONEncoder)

@dataclass
class ContractSchema:
    contract_id: str
    tender_id: str
    contract_text: str
    contract_value: float
    status: ContractStatus
    contract_date: datetime 

    def to_dict(self):
        return asdict(self)
    
    def to_json(self):
        return json.dumps(self.to_dict(), cls=EnhancedJSONEncoder)

class BidEvaluationService:
    def __init__(self, db: Session):
        self.db = db
        self.llm_service = llm_client

    def evaluate_bids_for_tender(self, tender_id: str) -> List[BidEvaluationSchema]:
        """Evaluate all bids for a given tender."""
        tender = self.db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise ValueError(f"Tender {tender_id} not found")

        bids = self.db.query(Bid).filter(Bid.tender_id == tender_id).all()
        if not bids:
            return []

        tender_requirements = self._get_tender_requirements(tender)
        evaluations = [self._evaluate_single_bid(bid, tender_requirements) for bid in bids]
        print("Evaluations: ", evaluations)
        return evaluations

    def _get_tender_requirements(self, tender: Tender) -> Dict:
        """Extract structured requirements from tender."""
        return {
            "items": [{
                "id": item.id,
                "description": item.description,
                "quantity": item.quantity,
                "unit_name": item.unit_name,
                "delivery_date_end": item.delivery_date_end.isoformat() if item.delivery_date_end else None,
            } for item in tender.items],
            "value_amount": tender.value_amount,
            "value_currency": tender.value_currency,
            "closing_date": tender.closing_date.isoformat() if tender.closing_date else None,
        }

    def _evaluate_single_bid(self, bid: Bid, tender_requirements: Dict) -> BidEvaluationSchema:
        """Evaluate a single bid using LLM analysis."""
        bid_data = self._prepare_bid_data(bid)
        prompt = self._construct_evaluation_prompt(bid_data, tender_requirements)
        evaluation_result = self._get_llm_evaluation(prompt)
        structured_evaluation = self._parse_llm_evaluation(evaluation_result)


        try:
            db_bid_evaluation = BidEvaluation(
                bid_id=bid.id,
                total_score=structured_evaluation['total_score'],
                price_score=structured_evaluation['price_score'],
                technical_score=structured_evaluation['technical_score'],
                compliance_score=structured_evaluation['compliance_score'],
                evaluation_summary=structured_evaluation['summary'],
                flags=structured_evaluation['flags'],
            )
            
            self.db.add(db_bid_evaluation)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e

        return BidEvaluationSchema(
            bid_id=bid.id,
            total_score=structured_evaluation['total_score'],
            price_score=structured_evaluation['price_score'],
            technical_score=structured_evaluation['technical_score'],
            compliance_score=structured_evaluation['compliance_score'],
            evaluation_summary=structured_evaluation['summary'],
            flags=structured_evaluation['flags'],
            evaluation_date=datetime.now()
        )

    def _prepare_bid_data(self, bid: Bid) -> Dict:
        """Prepare bid data in a structured format for evaluation."""
        return {
            "bid_id": bid.id,
            "bid_amount": bid.bid_amount,
            "items": [{
                "item_id": item.item_id,
                "description": item.description,
                "quantity": item.quantity,
                "unit_name": item.unit_name,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
            } for item in bid.bid_items],
            "documents": [{"name": doc.name} for doc in bid.documents],
            "supplier": {
                "id": bid.supplier.id,
                "legal_name": bid.supplier.legal_name,
            }
        }

    def _construct_evaluation_prompt(self, bid_data: Dict, tender_requirements: Dict) -> str:
        """Construct a detailed prompt for the LLM to evaluate the bid."""
        prompt = {
            "instructions": """
            Please evaluate this bid against the tender requirements. Provide your evaluation in the following JSON format:
            {
                "total_score": float (0-100),
                "price_score": float (0-100),
                "technical_score": float (0-100),
                "compliance_score": float (0-100),
                "summary": "Detailed evaluation summary as a string",
                "flags": ["list", "of", "warning", "flags"]
            }
            
            Scoring criteria:
            - Price score: Compare bid amount against tender value and market rates
            - Technical score: Evaluate specifications, quantities, and delivery dates
            - Compliance score: Check document completeness and supplier credentials
            - Total score: Weighted average of above scores (40% price, 40% technical, 20% compliance)
            
            Flags should indicate any concerns such as:
            - Pricing anomalies
            - Missing documentation
            - Technical specification mismatches
            - Delivery timeline issues
            - Supplier qualification concerns
            
            Your response must be valid JSON matching this exact schema.
            """,
            "tender_requirements": tender_requirements,
            "bid_details": bid_data
        }
        return json.dumps(prompt, indent=2)

    def _get_llm_evaluation(self, prompt: str) -> str:
        """Get evaluation from LLM service."""
        try:
            response = self.llm_service.chat.completions.create(
                model="deepseek-v2:16b",
                messages=[
                    {
                        "role": "system", 
                        "content": """You are a procurement expert evaluating bids. 
                        Always respond with valid JSON following the exact schema specified in the prompt.
                        All scores must be floating point numbers between 0 and 100.
                        The flags array must contain strings describing specific concerns.
                        The summary must be a detailed string explaining the evaluation rationale."""
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }  
            )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"Error getting LLM evaluation: {e}")
            raise

    def _parse_llm_evaluation(self, llm_response: str) -> Dict:
        """Parse and validate LLM response into structured evaluation data."""
        try:
            evaluation_data = json.loads(llm_response)
            
            required_fields = {
                'total_score': float,
                'price_score': float,
                'technical_score': float,
                'compliance_score': float,
                'summary': str,
                'flags': list
            }
            
            for field, expected_type in required_fields.items():
                if field not in evaluation_data:
                    raise ValueError(f"Missing required field: {field}")
                if not isinstance(evaluation_data[field], expected_type):
                    raise ValueError(f"Invalid type for {field}: expected {expected_type}")
                
                if field.endswith('_score'):
                    score = evaluation_data[field]
                    if not (0 <= score <= 100):
                        raise ValueError(f"Score out of range for {field}: {score}")
            
            if not all(isinstance(flag, str) for flag in evaluation_data['flags']):
                raise ValueError("All flags must be strings")
                
            return evaluation_data
        except json.JSONDecodeError:
            raise ValueError("Failed to parse LLM response as JSON")
    

    def _award_contract(self, tender_id: str, bid_id: str) -> Award:
        """Create an award entry for the winning bid."""
        try:
            bid = self.db.query(Bid).filter(Bid.id == bid_id).first()
            if not bid:
                raise ValueError(f"Bid with id {bid_id} not found.")
            
            award = self.db.query(Award).filter(Award.tender_id == tender_id).first()
            if award:
                return award
            
            print("Creating award for tender", tender_id  )

            award = Award(
                tender_id=tender_id,
                bid_id=bid_id,
                supplier_id=bid.supplier_id,
                award_date=datetime.now()
            )

            self.db.add(award)
            self.db.commit()
            self.db.refresh(award)
            logging.info(f"Created award {award.id} for tender {tender_id}")
            return award
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error creating award: {e}")
            raise

    def _generate_contract(self, bid_evaluation: BidEvaluationSchema, bid: Bid, tender: Tender, award: Award) -> ContractSchema:
        """Generate contract text for the winning bid using LLM and save as a document."""
        contract_prompt = self._construct_contract_prompt(bid_evaluation, bid, tender)
        contract_text = self._get_llm_contract(contract_prompt)

        contract = Contract(
            tender_id=tender.id,
            award_id=award.id,
            supplier_id=bid.supplier.id,
            contract_text=contract_text,
            # status=ContractStatus.ACTIVE,
            contract_value=bid.bid_amount
        )  
        self.db.add(contract)
        self.db.commit()

        contracts_dir = os.path.join('contracts')
        os.makedirs(contracts_dir, exist_ok=True)
        
        filename = f"contract_{contract.id}.txt"
        file_path = os.path.join(contracts_dir, filename)
        with open(file_path, 'w') as f:
            f.write(contract_text)
        
        logging.info(f"Contract document saved to {file_path}")
        
        return ContractSchema(
            contract_id=contract.id,
            tender_id=tender.id,
            contract_text=contract_text,
            contract_value=bid.bid_amount,
            status=ContractStatus.ACTIVE,
            contract_date=datetime.now()
        )
    

    def _construct_contract_prompt(self, bid_evaluation: BidEvaluationSchema, bid: Bid, tender: Tender) -> str:
        """Construct a detailed prompt for the LLM to generate a contract."""
        prompt = {
            "instructions": """
            Please generate a formal contract for the winning bid in a procurement process.
            The contract should include the following sections:
            - Introduction: Overview of the tender and the awarded supplier.
            - Scope of Work: Detailed description of what the winning bid covers.
            - Terms and Conditions: Any relevant terms, such as delivery dates, payment terms, and performance requirements.
            - Bid Evaluation Summary: Include a summary of the bid evaluation process.
            - Signatures: Placeholder for signatures of the supplier and procuring entity.

            Ensure that the language is formal and legally binding.
            """,
            "bid_evaluation": bid_evaluation.to_dict(),
            "bid_details": {
                "bid_amount": bid.bid_amount,
                "items": [{
                    "item_id": item.item_id,
                    "description": item.description,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total_price": item.total_price,
                } for item in bid.bid_items],
                "supplier": {
                    "id": bid.supplier.id,
                    "legal_name": bid.supplier.legal_name,
                }
            },
            "tender_details": {
                "id": tender.id,
                "title": tender.title,
                "closing_date": tender.closing_date,
                "value_amount": tender.value_amount,
                "value_currency": tender.value_currency
            }
        }

        return json.dumps(prompt, cls=EnhancedJSONEncoder, indent=2)
    
    def process_closed_tenders(self):
        """Automatically evaluate bids and award contracts for closed tenders."""
        now = datetime.now(pytz.utc)
        
        closed_tenders = self.db.query(Tender).filter(
            Tender.closing_date <= now,
            Tender.evaluated == False
        ).all()
        
        logging.info(f"Found {len(closed_tenders)} tenders to process")
        
        for tender in closed_tenders:
            try:
                logging.info(f"Processing tender {tender.id} (closed on {tender.closing_date})")
                
                
                evaluations = self.evaluate_bids_for_tender(tender.id)
                if evaluations:
                    best_bid = max(evaluations, key=lambda e: e.total_score)
                    
                    bid = self.db.query(Bid).filter(Bid.id == best_bid.bid_id).first()
                    
                    award = self._award_contract(tender.id, best_bid.bid_id)
                    self._generate_contract(best_bid, bid, tender, award)

                    tender.evaluated = True
                    tender.status = TenderStatus.AWARDED
                    
                    logging.info(f"Contract awarded for tender {tender.id} to bid {best_bid.bid_id}")
                else:
                    logging.info(f"No valid bids found for tender {tender.id}")
                
                self.db.commit()
                
            except Exception as e:
                self.db.rollback()
                logging.error(f"Error processing tender {tender.id}: {str(e)}")

    def _get_llm_contract(self, prompt: str) -> str:
        """Get contract text from LLM service."""
        try:
            response = self.llm_service.chat.completions.create(
                model="deepseek-v2:16b",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a legal expert generating contracts for procurement processes.
                        Ensure the contract is legally sound, includes all necessary sections, and uses formal language."""
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" } 
            )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"Error generating contract: {e}")
            raise

    def check_tender_notice_issues(self, file: UploadFile) -> List[str]:
        """
        Takes a multipart file representing a tender notice.
        Returns a list of issues found. If none, returns an empty list.
        """
        try:
            content = file.file.read().decode('utf-8') 
        except Exception as e:
            raise ValueError(f"Could not read file: {e}")

        prompt = json.dumps({
            "instructions": """
                You are a procurement compliance expert. Carefully analyze the following tender notice.
                Identify any compliance issues, ambiguities, missing information, or potential legal risks.
                Return your findings as a JSON object with the structure:
                {
                    "issues": ["Issue 1", "Issue 2", ...]
                }
                If there are no issues, return an empty list.
            """,
            "tender_notice": content
        }, indent=2)

        try:
            response = self.llm_service.chat.completions.create(
                model="deepseek-v2:16b",
                messages=[
                    {"role": "system", "content": "You are a legal and procurement compliance expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            llm_output = json.loads(response.choices[0].message.content)

            if "issues" not in llm_output or not isinstance(llm_output["issues"], list):
                raise ValueError("LLM response did not contain a valid 'issues' array.")

            return llm_output["issues"]
        except Exception as e:
            logging.error(f"LLM analysis failed: {e}")
            raise ValueError("Failed to evaluate tender notice.")



def check_and_process_closed_tenders():
    """Background task to check for closed tenders and process them."""
    logging.info("Running scheduled check for closed tenders")
    db = SessionLocal() 
    try:
        service = BidEvaluationService(db)
        service.process_closed_tenders()
    except Exception as e:
        logging.error(f"Error in scheduled tender processing: {str(e)}")
    finally:
        db.close()


def setup_scheduler():
    """Set up the scheduler with the tender processing job."""
    scheduler.add_job(
        check_and_process_closed_tenders,
        trigger=IntervalTrigger(minutes=1),
        id="process_closed_tenders",
        name="Process tenders with elapsed closing dates",
        replace_existing=True,
    )
    
    scheduler.add_job(
        check_and_process_closed_tenders,
        trigger=CronTrigger(hour=0, minute=0),
        id="daily_tender_processing",
        name="Daily tender processing",
        replace_existing=True,
    )
    
    if not scheduler.running:
        scheduler.start()
        logging.info("Tender processing scheduler started")