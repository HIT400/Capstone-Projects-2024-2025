import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple

from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
from eth_account import Account
from decouple import config


class TendekoBlockchainService:
    """Service for interacting with the Tendeko smart contract system."""
    
    def __init__(self, artifacts_dir: str= "/Users/munashenzira/Documents/Tendeko/smart_contract/build/contracts", rpc_url: str = "http://127.0.0.1:8545"):
        """
        Initialize the TendekoBlockchainService.
        
        Args:
            artifacts_dir: Directory containing Truffle-generated contract JSON files
            rpc_url: The URL of the Ethereum node (default: local Ganache)
        """
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        
        self.contracts = {}
        self.load_contracts(artifacts_dir)
        
        if self.w3.eth.accounts:
            self.w3.eth.default_account = self.w3.eth.accounts[0]
            self.address = self.w3.eth.default_account
        else:
            private_key = config("PRIVATE_KEY")
            if private_key:
                self.account = Account.from_key(private_key)
                self.address = self.account.address
                self.private_key = private_key
            else:
                raise ValueError("No accounts available and no private key provided")
    
    def load_contracts(self, artifacts_dir: str):
        """
        Load all contract artifacts from the specified directory.
        
        Args:
            artifacts_dir: Directory containing Truffle-generated contract JSON files
        """
        contract_files = [
            "TendekoEProcurement.json",
            "TendekoTenderManagement.json",
            "TendekoBidManagement.json",
            "TendekoAwardManagement.json",
            "TendekoContractManagement.json",
            "TendekoStorage.json"
        ]
        
        for contract_file in contract_files:
            file_path = os.path.join(artifacts_dir, contract_file)
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    contract_json = json.load(f)
                
                contract_name = contract_json.get("contractName", contract_file.replace(".json", ""))
                self.contracts[contract_name] = {
                    "abi": contract_json["abi"],
                    "bytecode": contract_json.get("bytecode")
                }
                
                networks = contract_json.get("networks", {})
                if networks:
                    network_id = next(iter(networks))
                    self.contracts[contract_name]["address"] = networks[network_id]["address"]
        
        if "TendekoEProcurement" in self.contracts and "address" in self.contracts["TendekoEProcurement"]:
            main_address = self.contracts["TendekoEProcurement"]["address"]
            self.main_contract = self.w3.eth.contract(
                address=main_address,
                abi=self.contracts["TendekoEProcurement"]["abi"]
            )
        else:
            raise ValueError("Main contract (TendekoEProcurement) not found or not deployed")
        
    def _build_and_send_tx(self, function, gas_limit=3000000):
        """Helper method to build and send a transaction."""
        if hasattr(self, 'private_key'):
            tx = function.build_transaction({
                'from': self.address,
                'nonce': self.w3.eth.get_transaction_count(self.address),
                'gas': gas_limit,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        else:
            tx_hash = function.transact({
                'from': self.address,
                'gas': gas_limit
            })
        
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_receipt
    
    def deploy_contract(self, initial_admin_address=None):
        """
        Deploy a new instance of the TendekoEProcurement contract.
        
        Args:
            initial_admin_address: Address to set as initial admin (default: sender's address)
            
        Returns:
            Address of the newly deployed contract
        """
        if not initial_admin_address:
            initial_admin_address = self.address
            
        contract_factory = self.w3.eth.contract(
            abi=self.contracts["TendekoEProcurement"]["abi"], 
            bytecode=self.contracts["TendekoEProcurement"]["bytecode"]
        )
        
        if hasattr(self, 'private_key'):
            construct_txn = contract_factory.constructor(initial_admin_address).build_transaction({
                'from': self.address,
                'nonce': self.w3.eth.get_transaction_count(self.address),
                'gas': 5000000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(construct_txn, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        else:
            tx_hash = contract_factory.constructor(initial_admin_address).transact({
                'from': self.address, 
                'gas': 5000000
            })
            
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_receipt.contractAddress
    
    def change_admin(self, new_admin_address: str) -> Dict:
        """Change the admin of the contract."""
        function = self.main_contract.functions.changeAdmin(new_admin_address)
        return self._build_and_send_tx(function)
    
    def authorize_entity(self, entity_address: str) -> Dict:
        """Authorize a new entity to use the system."""
        function = self.main_contract.functions.authorizeEntity(entity_address)
        return self._build_and_send_tx(function)
    
    def deauthorize_entity(self, entity_address: str) -> Dict:
        """Deauthorize an entity from using the system."""
        function = self.main_contract.functions.deauthorizeEntity(entity_address)
        return self._build_and_send_tx(function)
    
    def set_min_bid_time_window(self, days: int) -> Dict:
        """Set the minimum bidding time window in days."""
        function = self.main_contract.functions.setMinBidTimeWindow(days)
        return self._build_and_send_tx(function)
    
    def toggle_system(self, active: bool) -> Dict:
        """Enable or disable the entire system."""
        function = self.main_contract.functions.toggleSystem(active)
        return self._build_and_send_tx(function)
    
    def create_tender(
        self, 
        tender_id: str, 
        title: str, 
        closing_date_days: int, 
        value_amount: int, 
        value_currency: str, 
        hash_of_details: str
    ) -> Dict:
        """
        Create a new tender.
        
        Args:
            tender_id: Unique identifier for the tender
            title: Title/description of the tender
            closing_date_days: Number of days from now when the tender will close
            value_amount: Estimated value amount of the tender
            value_currency: Currency of the value amount
            hash_of_details: IPFS hash or other reference to tender details
            
        Returns:
            Transaction receipt
        """
        closing_date = int((datetime.now() + timedelta(days=closing_date_days)).timestamp())
        
        tender_input = (
            tender_id,          
            title,              
            closing_date,        
            int(value_amount),   
            value_currency,     
            hash_of_details      
        )
        
        function = self.main_contract.functions.createTender(tender_input)
        return self._build_and_send_tx(function)
    
    def update_tender_status(self, tender_id: str, status: str) -> Dict:
        """
        Update the status of a tender.
        
        Args:
            tender_id: ID of the tender to update
            status: New status (ACTIVE, CANCELLED, COMPLETED, etc.)
            
        Returns:
            Transaction receipt
        """
        function = self.main_contract.functions.updateTenderStatus(tender_id, status)
        return self._build_and_send_tx(function)
    
    def submit_bid(
        self, 
        tender_id: str, 
        bid_id: str, 
        bid_amount: int, 
        hash_of_documents: str
    ) -> Dict:
        """
        Submit a bid for a tender.
        
        Args:
            tender_id: ID of the tender to bid on
            bid_id: Unique identifier for this bid
            bid_amount: Amount of the bid
            hash_of_documents: IPFS hash or other reference to bid documents
            
        Returns:
            Transaction receipt
        """
        bid_input = {
            'tenderID': tender_id,
            'bidID': bid_id,
            'bidAmount': bid_amount,
            'hashOfDocuments': hash_of_documents
        }
        
        function = self.main_contract.functions.submitBid(bid_input)
        return self._build_and_send_tx(function)

    def award_tender(
        self,
        tender_id: str,
        award_id: str,
        bid_id: str,
        supplier_address: str,
        hash_of_evaluation: str
    ) -> Dict:
        """
        Award a tender to a specific bid.
        
        Args:
            tender_id: ID of the tender being awarded
            award_id: Unique identifier for this award
            bid_id: ID of the winning bid
            supplier_address: Ethereum address of the winning supplier
            hash_of_evaluation: IPFS hash or other reference to evaluation documents
            
        Returns:
            Transaction receipt
        """
        award_input = {
            'tenderID': tender_id,
            'awardID': award_id,
            'bidID': bid_id,
            'supplier': supplier_address,
            'hashOfEvaluation': hash_of_evaluation
        }
        
        function = self.main_contract.functions.awardTender(award_input)
        return self._build_and_send_tx(function)
    

    def create_contract(
        self,
        contract_id: str,
        tender_id: str,
        award_id: str,
        contract_value: int,
        hash_of_contract: str
    ) -> Dict:
        """
        Create a contract for an awarded tender.
        
        Args:
            contract_id: Unique identifier for this contract
            tender_id: ID of the related tender
            award_id: ID of the related award
            contract_value: Final value of the contract
            hash_of_contract: IPFS hash or other reference to contract documents
            
        Returns:
            Transaction receipt
        """
        contract_input = (
            contract_id,      
            tender_id,         
            award_id,          
            int(contract_value),
            hash_of_contract  
        )
        
        function = self.main_contract.functions.createContract(contract_input)
        return self._build_and_send_tx(function)

    def get_tender_details(self, tender_id: str) -> Dict:
        """
        Get details about a tender.
        
        Args:
            tender_id: ID of the tender
            
        Returns:
            Dict containing tender details
        """
        tender = self.main_contract.functions.getTender(tender_id).call()

        print("Tender: ", tender)
        
        if not tender[0]: 
            return None
            
        closing_date_dt = datetime.fromtimestamp(tender[2])
        
        return {
            'tenderID': tender[0],
            'title': tender[1],
            'closingDate': tender[2],
            'closingDateFormatted': closing_date_dt.strftime('%Y-%m-%d %H:%M:%S'),
            'valueAmount': tender[3],
            'valueCurrency': tender[4],
            'status': tender[5],
            'hashOfDetails': tender[6],
            'procuringEntity': tender[7],
            'isEvaluated': tender[8]
        }
    
    def get_award_details(self, award_id: str) -> Dict:
        """
        Get details about an award.
        
        Args:
            award_id: ID of the award
            
        Returns:
            Dict containing award details
        """
        award = self.main_contract.functions.awards(award_id).call()
        
       
        if not award[0]:  # Check if awardID is empty
            return None
            
        award_date_dt = datetime.fromtimestamp(award[4])
        
        return {
            'awardID': award[0],
            'tenderID': award[1],
            'bidID': award[2],
            'supplier': award[3],
            'awardDate': award[4],
            'awardDateFormatted': award_date_dt.strftime('%Y-%m-%d %H:%M:%S'),
            'hashOfEvaluation': award[5]
        }
    
    def get_contract_details(self, contract_id: str) -> Dict:
        """
        Get details about a contract.
        
        Args:
            contract_id: ID of the contract
            
        Returns:
            Dict containing contract details
        """
        contract = self.main_contract.functions.contracts(contract_id).call()
        
        # Handle case where contract might not exist
        if not contract[0]:  # Check if contractID is empty
            return None
            
        contract_date_dt = datetime.fromtimestamp(contract[4])
        
        return {
            'contractID': contract[0],
            'tenderID': contract[1],
            'awardID': contract[2],
            'supplier': contract[3],
            'contractDate': contract[4],
            'contractDateFormatted': contract_date_dt.strftime('%Y-%m-%d %H:%M:%S'),
            'contractValue': contract[5],
            'hashOfContract': contract[6],
            'status': contract[7]
        }

    def get_admin_address(self) -> str:
        """Get the current admin address."""
        try:
            return self.main_contract.functions.admin().call()
        except Exception:
            return None

    def is_system_active(self) -> bool:
        """Check if the procurement system is currently active."""
        try:
            return self.main_contract.functions.systemActive().call()
        except Exception:
            return None
    
    def get_min_bid_time_window(self) -> int:
        """Get the minimum bid time window in days."""
        try:
            seconds = self.main_contract.functions.minBidTimeWindow().call()
            return seconds // 86400  
        except Exception:
            return None

    def get_authorized_entities(self) -> List[str]:
        """Get the list of authorized entities."""
        try:
            entities = []
            i = 0
            while True:
                try:
                    entity = self.main_contract.functions.authorizedEntities(i).call()
                    entities.append(entity)
                    i += 1
                except Exception:
                    break
            return entities
        except Exception:
            return []
    
    def get_tender_events(self, from_block=0) -> List[Dict]:
        """
        Get all TenderCreated events.
        
        Args:
            from_block: Block number to start searching from
            
        Returns:
            List of TenderCreated events
        """
        tender_created_filter = self.main_contract.events.TenderCreated.create_filter(
            fromBlock=from_block
        )
        return [dict(evt) for evt in tender_created_filter.get_all_entries()]
    
    def get_bid_events(self, tender_id=None, from_block=0) -> List[Dict]:
        """
        Get all BidSubmitted events, optionally filtered by tender ID.
        
        Args:
            tender_id: Optional tender ID to filter by
            from_block: Block number to start searching from
            
        Returns:
            List of BidSubmitted events
        """
        if tender_id:
            bid_filter = self.main_contract.events.BidSubmitted.create_filter(
                fromBlock=from_block,
                argument_filters={"tenderID": tender_id}
            )
        else:
            bid_filter = self.main_contract.events.BidSubmitted.create_filter(
                fromBlock=from_block
            )
        return [dict(evt) for evt in bid_filter.get_all_entries()]
    
    def get_award_events(self, tender_id=None, from_block=0) -> List[Dict]:
        """
        Get all TenderAwarded events, optionally filtered by tender ID.
        
        Args:
            tender_id: Optional tender ID to filter by
            from_block: Block number to start searching from
            
        Returns:
            List of TenderAwarded events
        """
        if tender_id:
            award_filter = self.main_contract.events.TenderAwarded.create_filter(
                fromBlock=from_block,
                argument_filters={"tenderID": tender_id}
            )
        else:
            award_filter = self.main_contract.events.TenderAwarded.create_filter(
                fromBlock=from_block
            )
        return [dict(evt) for evt in award_filter.get_all_entries()]
    
    def get_contract_events(self, tender_id=None, from_block=0) -> List[Dict]:
        """
        Get all ContractSigned events, optionally filtered by tender ID.
        
        Args:
            tender_id: Optional tender ID to filter by
            from_block: Block number to start searching from
            
        Returns:
            List of ContractSigned events
        """
        if tender_id:
            contract_filter = self.main_contract.events.ContractSigned.create_filter(
                fromBlock=from_block,
                argument_filters={"tenderID": tender_id}
            )
        else:
            contract_filter = self.main_contract.events.ContractSigned.create_filter(
                fromBlock=from_block
            )
        return [dict(evt) for evt in contract_filter.get_all_entries()]
    
    def get_tender_status_events(self, tender_id=None, from_block=0) -> List[Dict]:
        """
        Get all TenderStatusUpdated events, optionally filtered by tender ID.
        
        Args:
            tender_id: Optional tender ID to filter by
            from_block: Block number to start searching from
            
        Returns:
            List of TenderStatusUpdated events
        """
        if tender_id:
            status_filter = self.main_contract.events.TenderStatusUpdated.create_filter(
                fromBlock=from_block,
                argument_filters={"tenderID": tender_id}
            )
        else:
            status_filter = self.main_contract.events.TenderStatusUpdated.create_filter(
                fromBlock=from_block
            )
        return [dict(evt) for evt in status_filter.get_all_entries()]
                

# Example usage:
# if __name__ == "__main__":
    # Initialize service
    # service = TendekoService(
    #     artifacts_dir="/Users/munashenzira/Documents/Tendeko/smart_contract/build/contracts"
    # )
    
    # # Example: Create a tender
    # try:
    #     receipt = service.create_tender(
    #         tender_id="TENDER-2025-001",
    #         title="Construction of Municipal Building",
    #         closing_date_days=30,
    #         value_amount=1000000,
    #         value_currency="USD",
    #         hash_of_details="ipfs://QmTenderDetails123"
    #     )
    #     print(f"Tender created: {receipt['transactionHash'].hex()}")
        
    #     # Wait a moment for the transaction to be fully processed
    #     time.sleep(2)
        
    #     # Get the tender details
    #     tender = service.get_tender_details("TENDER-2025-001")
    #     print(f"Tender details: {tender}")
        
    #     # Submit a bid as another account
    #     bid_account = service.w3.eth.accounts[1]
    #     service.address = bid_account  # Change sender
        
    #     bid_receipt = service.submit_bid(
    #         tender_id="TENDER-2025-001",
    #         bid_id="BID-001",
    #         bid_amount=950000,
    #         hash_of_documents="ipfs://QmBidDocs123"
    #     )
    #     print(f"Bid submitted: {bid_receipt['transactionHash'].hex()}")
        
    #     # Switch back to admin account
    #     service.address = service.w3.eth.accounts[0]
        
    #     # Check bid events
    #     bid_events = service.get_bid_events(tender_id="TENDER-2025-001")
    #     print(f"Bid events: {bid_events}")
        
    # except Exception as e:
    #     print(f"Error in example: {e}")
    # service = TendekoService(
    #     contract_json_path="/Users/munashenzira/Documents/Tendeko/smart_contract/build/contracts/TendekoEProcurement.json"
    # )
    
    # try:
    #     receipt = service.create_tender(
    #         tender_id="TENDER-2025-001",
    #         title="Construction of Municipal Building",
    #         closing_date_days=30,
    #         value_amount=1000000,
    #         value_currency="USD",
    #         hash_of_details="ipfs://QmTenderDetails123"
    #     )
    #     print(f"Tender created: {receipt['transactionHash'].hex()}")
        
    #     # Wait a moment for the transaction to be fully processed
    #     time.sleep(2)
        
    #     # Get the tender details
    #     tender = service.get_tender_details("TENDER-2025-001")
    #     print(f"Tender details: {tender}")
        
    # except Exception as e:
    #     print(f"Error creating tender: {e}")