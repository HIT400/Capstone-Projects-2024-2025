// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title DataVerification
 * @dev Store and verify document hashes on the blockchain
 */
contract DataVerification {
    // Structure to store document information
    struct Document {
        string title;
        string contentHash;
        address owner;
        uint256 timestamp;
        string documentId;
        bool exists;
    }

    // Mapping from document ID to Document struct
    mapping(string => Document) private documents;
    
    // Mapping from title to document ID
    mapping(string => string) private titleToDocumentId;
    
    // Array to store all document IDs
    string[] private documentIds;

    // Events
    event DocumentStored(string documentId, string title, string contentHash, address owner, uint256 timestamp);
    event DocumentVerified(string documentId, string title, bool verified);

    /**
     * @dev Store a document's hash on the blockchain
     * @param _title Title of the document
     * @param _contentHash Hash of the document content
     * @param _documentId Unique identifier for the document
     * @return success Whether the operation was successful
     */
    function storeDocument(string memory _title, string memory _contentHash, string memory _documentId) public returns (bool success) {
        // Check if title is already used
        require(bytes(titleToDocumentId[_title]).length == 0, "Title already exists");
        
        // Store document information
        documents[_documentId] = Document({
            title: _title,
            contentHash: _contentHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            documentId: _documentId,
            exists: true
        });
        
        // Update mappings and arrays
        titleToDocumentId[_title] = _documentId;
        documentIds.push(_documentId);
        
        // Emit event
        emit DocumentStored(_documentId, _title, _contentHash, msg.sender, block.timestamp);
        
        return true;
    }

    /**
     * @dev Verify if a document's hash matches the stored hash
     * @param _title Title of the document
     * @param _contentHash Hash to verify against
     * @return verified Whether the hashes match
     */
    function verifyDocument(string memory _title, string memory _contentHash) public returns (bool verified) {
        // Get document ID from title
        string memory documentId = titleToDocumentId[_title];
        
        // Check if document exists
        require(bytes(documentId).length > 0, "Document not found");
        
        // Get document from mapping
        Document memory doc = documents[documentId];
        
        // Verify hash
        bool isMatch = keccak256(abi.encodePacked(doc.contentHash)) == keccak256(abi.encodePacked(_contentHash));
        
        // Emit verification event
        emit DocumentVerified(documentId, _title, isMatch);
        
        return isMatch;
    }

    /**
     * @dev Get document information by title
     * @param _title Title of the document
     * @return title Title of the document
     * @return contentHash Hash of the document content
     * @return owner Address of the document owner
     * @return timestamp Time when document was stored
     * @return documentId Unique identifier for the document
     */
    function getDocumentByTitle(string memory _title) public view returns (
        string memory title,
        string memory contentHash,
        address owner,
        uint256 timestamp,
        string memory documentId
    ) {
        string memory docId = titleToDocumentId[_title];
        require(bytes(docId).length > 0, "Document not found");
        
        Document memory doc = documents[docId];
        
        return (
            doc.title,
            doc.contentHash,
            doc.owner,
            doc.timestamp,
            doc.documentId
        );
    }

    /**
     * @dev Get all document IDs
     * @return All document IDs
     */
    function getAllDocumentIds() public view returns (string[] memory) {
        return documentIds;
    }
    
    /**
     * @dev Get document count
     * @return Number of documents stored
     */
    function getDocumentCount() public view returns (uint256) {
        return documentIds.length;
    }
}