pragma solidity ^0.8.19;

// SPDX-License-Identifier: MIT

contract DocumentSharingContract {
    enum UserRole { None, User, Verifier }
    enum RequestStatus { Pending, Approved, Rejected }

    mapping(address => UserRole) public userRoles;

   struct DocumentRequest {
    string documentType;
    address verifier;
    RequestStatus status;
    string[] requestedAttributes;
    string[] approvedAttributeKeys;
    string[] approvedAttributeValues;
}

    struct DocumentInfo {
    string documentType;
    string[] keys;
    mapping(string => string) attributes;
}
struct VerifierRequestInfo {
    address user;
    uint256 requestIndex;
}

    mapping(address => DocumentRequest[]) public userRequests;
    mapping(address => DocumentInfo[]) public userDocuments;
    
    mapping(address => mapping(address => mapping(string => mapping(string => string)))) public verifierDocumentAccess;

   mapping(address => VerifierRequestInfo[]) public verifierRequestsMapping;



    modifier onlyUser() {
        require(userRoles[msg.sender] == UserRole.User, "Only users can call this function");
        _;
    }

    modifier onlyVerifier() {
        require(userRoles[msg.sender] == UserRole.Verifier, "Only verifiers can call this function");
        _;
    }

    function registerUser(uint8 role) public {
        require(userRoles[msg.sender] == UserRole.None, "User already registered");
        require(role >= uint8(UserRole.None) && role <= uint8(UserRole.Verifier), "Invalid role");
        userRoles[msg.sender] = UserRole(role);
    }

    function requestDocumentAccess(address user, string memory documentType, string[] memory attributes)
    public onlyVerifier
{
    require(userRoles[user] == UserRole.User, "Invalid user address");

    uint256 requestIndex = userRequests[user].length;
    userRequests[user].push(DocumentRequest({
        documentType: documentType,
        verifier: msg.sender,
        status: RequestStatus.Pending,
        requestedAttributes: attributes,
        approvedAttributeKeys: new string[](0),
        approvedAttributeValues: new string[](0)
    }));
    
    VerifierRequestInfo memory verifierRequestInfo = VerifierRequestInfo({
        user: user,
        requestIndex: requestIndex
    });
    verifierRequestsMapping[msg.sender].push(verifierRequestInfo);
}



  function updateDocumentAccess(uint256 requestIndex, string[] memory approvedKeys) public onlyUser {
    require(requestIndex < userRequests[msg.sender].length, "Invalid request index");
    DocumentRequest storage request = userRequests[msg.sender][requestIndex];
    require(request.status == RequestStatus.Pending, "Request is not pending");
    request.approvedAttributeKeys = approvedKeys; // Save approved keys
}

// Function to approve the document access request
function approveDocumentAccess(uint256 requestIndex) public onlyUser {
    require(requestIndex < userRequests[msg.sender].length, "Invalid request index");
    DocumentRequest storage request = userRequests[msg.sender][requestIndex];
    require(request.status == RequestStatus.Pending, "Request is not pending");

    request.status = RequestStatus.Approved;

    // Iterate through user's documents to find the requested document
    for (uint256 i = 0; i < userDocuments[msg.sender].length; i++) {
        if (keccak256(abi.encodePacked(userDocuments[msg.sender][i].documentType)) == keccak256(abi.encodePacked(request.documentType))) {
            // Found the document, now copy the approved attributes
            for (uint256 j = 0; j < request.approvedAttributeKeys.length; j++) {
                string memory key = request.approvedAttributeKeys[j];
                string memory value = userDocuments[msg.sender][i].attributes[key];
                request.approvedAttributeValues.push(value);
                verifierDocumentAccess[request.verifier][msg.sender][request.documentType][key] = value;
            }
            break;
        }
    }
}

    function rejectDocumentAccess(uint256 requestIndex)
        public onlyUser
    {
        require(userRequests[msg.sender].length > requestIndex, "Invalid request index");
        require(userRequests[msg.sender][requestIndex].status == RequestStatus.Pending, "Request is not pending");
        userRequests[msg.sender][requestIndex].status = RequestStatus.Rejected;
    }

    function addDocument(string memory documentType, string[] memory keys, string[] memory values)
        public onlyUser
    {
        require(keys.length == values.length, "Keys and values must have the same length");
        DocumentInfo storage documentInfo = userDocuments[msg.sender].push();
        documentInfo.documentType = documentType;
        documentInfo.keys = keys;
        for (uint256 i = 0; i < keys.length; i++) {
            documentInfo.attributes[keys[i]] = values[i];
        }
    }

    function revokeDocumentAttributes(uint256 requestIndex, string[] memory keysToRevoke) public onlyUser {
    require(requestIndex < userRequests[msg.sender].length, "Invalid request index");
    DocumentRequest storage request = userRequests[msg.sender][requestIndex];
    require(request.status == RequestStatus.Approved, "Request is not approved");

    for (uint256 k = 0; k < keysToRevoke.length; k++) {
        // For each key to revoke, find the attribute in the approvedAttributeKeys array and remove it.
        for (uint256 i = 0; i < request.approvedAttributeKeys.length; i++) {
            if (keccak256(abi.encodePacked(request.approvedAttributeKeys[i])) == keccak256(abi.encodePacked(keysToRevoke[k]))) {
                request.approvedAttributeKeys[i] = request.approvedAttributeKeys[request.approvedAttributeKeys.length - 1];
                request.approvedAttributeKeys.pop();

                request.approvedAttributeValues[i] = request.approvedAttributeValues[request.approvedAttributeValues.length - 1];
                request.approvedAttributeValues.pop();

                // Remove the access from the verifierDocumentAccess mapping.
                delete verifierDocumentAccess[request.verifier][msg.sender][request.documentType][keysToRevoke[k]];
                
              
                break;
            }
        }
    }
}


    function getUserDocuments(address user) public view onlyUser returns (string[] memory documentTypes, string[][] memory keys, string[][] memory values) {
    require(user == msg.sender, "You can only retrieve your own documents");
    uint256 length = userDocuments[user].length;
    documentTypes = new string[](length);
    keys = new string[][](length);
    values = new string[][](length);

    for (uint256 i = 0; i < length; i++) {
        documentTypes[i] = userDocuments[user][i].documentType;
        keys[i] = userDocuments[user][i].keys;
        values[i] = new string[](keys[i].length);
        for (uint256 j = 0; j < keys[i].length; j++) {
            values[i][j] = userDocuments[user][i].attributes[keys[i][j]];
        }
    }

    return (documentTypes, keys, values);
}

    function getDocumentAttribute(address verifier, address user, string memory documentType, string memory key)
        public view returns (string memory)
    {
        return verifierDocumentAccess[verifier][user][documentType][key];
    }

  function getVerifierRequests() public view onlyVerifier returns (DocumentRequest[] memory) {
    uint256 length = verifierRequestsMapping[msg.sender].length;
    DocumentRequest[] memory requests = new DocumentRequest[](length);

    for (uint256 i = 0; i < length; i++) {
        VerifierRequestInfo storage info = verifierRequestsMapping[msg.sender][i];
        
        requests[i] = userRequests[info.user][info.requestIndex];
    }

    return requests;
}


function getApprovedData(address user, string memory documentType) public view onlyVerifier returns (string[] memory keys, string[] memory values) {
    DocumentInfo[] storage documents = userDocuments[user];
    for (uint256 i = 0; i < documents.length; i++) {
        if (keccak256(abi.encodePacked(documents[i].documentType)) == keccak256(abi.encodePacked(documentType))) {
            keys = documents[i].keys;
            values = new string[](keys.length);
            for (uint256 j = 0; j < keys.length; j++) {
                values[j] = verifierDocumentAccess[msg.sender][user][documentType][keys[j]];
            }
            break;
        }
    }
    return (keys, values);
}


    function getUserRequests(address user) public view onlyUser returns (DocumentRequest[] memory) {
    require(user == msg.sender, "You can only retrieve your own requests");
    return userRequests[user];
}

}
