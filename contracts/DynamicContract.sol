pragma solidity ^0.8.19;

import "./StringUtils.sol";


// SPDX-License-Identifier: MIT


contract DocumentSharingContract  {
   

    
using StringUtils for string;
// Enumeration for user roles.
    enum UserRole {
        None,
        User,
        Verifier
    }
// Enumeration for document request status.
    enum RequestStatus {
        Pending,
        Approved,
        Rejected,
        Revoked
    }
// Enumeration for filtering document requests.
    enum RequestFilterStatus {
    Any,
    Pending,
    Approved,
    Rejected,
    Revoked
}
 // Mapping to store user roles based on Ethereum addresses.
    mapping(address => UserRole) public userRoles;


// Struct to represent a document request.
    struct DocumentRequest {
        string documentType;
        address verifier;
        RequestStatus status;
        string[] requestedAttributes;
        string[] approvedAttributeKeys;
        string[] approvedAttributeValues;
        string verifierEmail; 
        string userEmail; 
        uint256 timestamp;
    }

  // Struct to represent document information.
    struct DocumentInfo {
        string documentType;
        string[] keys;
        string userEmail;
        mapping(string => string) attributes;

    }
 // Struct to store verifier request information.
    struct VerifierRequestInfo {
        address user;
        uint256 requestIndex;
    }
    
 // Mapping to store document requests made by verifier
  mapping(address => DocumentRequest[]) public userRequests;
// Mapping to store document information for each user.
    mapping(address => DocumentInfo[]) public userDocuments;
// Mapping to manage document access approved by user
    mapping(address => mapping(address => mapping(string => mapping(string => string))))
        public verifierDocumentAccess;

// Mapping to store verifier request information.
    mapping(address => VerifierRequestInfo[]) public verifierRequestsMapping;
    // Mapping to associate Ethereum addresses with email address
    mapping(address => string) public addressToEmail;
    mapping(string => address) public emailToAddress;
    string[] public registeredEmails;


 // Modifier to restrict access to user-only functions
    modifier onlyUser() {
        require(
            userRoles[msg.sender] == UserRole.User,
            "Only users can call this function"
        );
        _;
    }
 // Modifier to restrict access to  verifier-only functions
    modifier onlyVerifier() {
        require(
            userRoles[msg.sender] == UserRole.Verifier,
            "Only verifiers can call this function"
        );
        _;
    }
 // Function to register a user with a specified role and email.
   function registerUser(uint8 role, string memory email) public {
    require(userRoles[msg.sender] == UserRole.None, "User already registered");
    require(role >= uint8(UserRole.None) && role <= uint8(UserRole.Verifier), "Invalid role");
    require(emailToAddress[email] == address(0), "Email already registered");

    userRoles[msg.sender] = UserRole(role);
    addressToEmail[msg.sender] = email;
    emailToAddress[email] = msg.sender;
    registeredEmails.push(email);
}
// Function verfier calls to request acesss
    function requestDocumentAccess(string memory userEmail, string memory documentType, string[] memory attributes)
    public onlyVerifier
{
    address user = emailToAddress[userEmail];
    require(user != address(0), "Invalid email address");
    require(userRoles[user] == UserRole.User, "Email does not belong to a user");

    uint256 requestIndex = userRequests[user].length;
    userRequests[user].push(DocumentRequest({
        documentType: documentType,
        verifier: msg.sender,
        verifierEmail: addressToEmail[msg.sender], 
        userEmail: addressToEmail[user],   
        status: RequestStatus.Pending,
        requestedAttributes: attributes,
        approvedAttributeKeys: new string[](0),
        approvedAttributeValues: new string[](0),
        timestamp: block.timestamp 
    }));
    
    VerifierRequestInfo memory verifierRequestInfo = VerifierRequestInfo({
        user: user,
        requestIndex: requestIndex
    });
    verifierRequestsMapping[msg.sender].push(verifierRequestInfo);
}



    // Function to approve the document access request
    function approveDocumentAccess(uint256 requestIndex,string[] memory approvedKeys) public onlyUser {
        require(
            requestIndex < userRequests[msg.sender].length,
            "Invalid request index"
        );
        DocumentRequest storage request = userRequests[msg.sender][
            requestIndex
        ];
        require(
            request.status == RequestStatus.Pending,
            "Request is not pending"
        );
        request.approvedAttributeKeys = approvedKeys;

        request.status = RequestStatus.Approved;
       

        // Iterate through user's documents to find the requested document
        for (uint256 i = 0; i < userDocuments[msg.sender].length; i++) {
            if (
                keccak256(
                    abi.encodePacked(userDocuments[msg.sender][i].documentType)
                ) == keccak256(abi.encodePacked(request.documentType))
            ) {
                // Found the document, now copy the approved attributes
                for (
                    uint256 j = 0;
                    j < request.approvedAttributeKeys.length;
                    j++
                ) {
                    string memory key = request.approvedAttributeKeys[j];
                    string memory value = userDocuments[msg.sender][i]
                        .attributes[key];
                    request.approvedAttributeValues.push(value);
                    verifierDocumentAccess[request.verifier][msg.sender][
                        request.documentType
                    ][key] = value;
                }
                break;
            }
        }
    }
// function to reject document acess
    function rejectDocumentAccess(uint256 requestIndex) public onlyUser {
        require(
            userRequests[msg.sender].length > requestIndex,
            "Invalid request index"
        );
        require(
            userRequests[msg.sender][requestIndex].status ==
                RequestStatus.Pending,
            "Request is not pending"
        );
        userRequests[msg.sender][requestIndex].status = RequestStatus.Rejected;
    }
// function for user-only role to add their document to blockchian
    function addDocument(
        string memory documentType,
        string[] memory keys,
        string[] memory values
    ) public onlyUser {
        require(
            keys.length == values.length,
            "Keys and values must have the same length"
        );
        DocumentInfo storage documentInfo = userDocuments[msg.sender].push();
        documentInfo.documentType = documentType;
        documentInfo.userEmail = addressToEmail[msg.sender];
        documentInfo.keys = keys;
        for (uint256 i = 0; i < keys.length; i++) {
            documentInfo.attributes[keys[i]] = values[i];
        }
    }
// function for revoking documnet acecess
    function revokeDocumentAttributes(
        uint256 requestIndex,
        string[] memory keysToRevoke
    ) public onlyUser {
        require(
            requestIndex < userRequests[msg.sender].length,
            "Invalid request index"
        );
        DocumentRequest storage request = userRequests[msg.sender][
            requestIndex
        ];
        require(
            request.status == RequestStatus.Approved,
            "Request is not approved"
        );

        for (uint256 k = 0; k < keysToRevoke.length; k++) {
            // For each key to revoke, find the attribute in the approvedAttributeKeys array and remove it.
            for (uint256 i = 0; i < request.approvedAttributeKeys.length; i++) {
                if (
                    keccak256(
                        abi.encodePacked(request.approvedAttributeKeys[i])
                    ) == keccak256(abi.encodePacked(keysToRevoke[k]))
                ) {
                    request.approvedAttributeKeys[i] = request
                        .approvedAttributeKeys[
                            request.approvedAttributeKeys.length - 1
                        ];
                    request.approvedAttributeKeys.pop();

                    request.approvedAttributeValues[i] = request
                        .approvedAttributeValues[
                            request.approvedAttributeValues.length - 1
                        ];
                    request.approvedAttributeValues.pop();

                    // Remove the access from the verifierDocumentAccess mapping.
                    delete verifierDocumentAccess[request.verifier][msg.sender][
                        request.documentType
                    ][keysToRevoke[k]];

                    break;
                }
            }
        }
         request.status = RequestStatus.Revoked;
    }
// function to get user documents based on ethereum address
    function getUserDocuments(
        address user
    )
        public
        view
        onlyUser
        returns (
            string[] memory documentTypes,
            string[][] memory keys,
            string[][] memory values
        )
    {
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
// function to get requests each verfier had made
   function getVerifierRequests()
        public
        view
        onlyVerifier
        returns (DocumentRequest[] memory)
    {
        uint256 length = verifierRequestsMapping[msg.sender].length;
        DocumentRequest[] memory requests = new DocumentRequest[](length);

        for (uint256 i = 0; i < length; i++) {
            VerifierRequestInfo storage info = verifierRequestsMapping[
                msg.sender
            ][i];

            requests[i] = userRequests[info.user][info.requestIndex];
        }

        return requests;
    }

 

    function getUserRequests(
        address user
    ) public view onlyUser returns (DocumentRequest[] memory) {
        require(user == msg.sender, "You can only retrieve your own requests");
        return userRequests[user];
    }

 // search ethereum address by email on blockchain
function getEmailsStartsWith(string memory prefix) public view returns (string[] memory) {
    uint256 matchCount = 0;

    for (uint256 i = 0; i < registeredEmails.length; i++) {
        if (StringUtils.startsWith(registeredEmails[i], prefix)) {
            matchCount++;
        }
    }

    string[] memory matches = new string[](matchCount);
    uint256 index = 0;

    for (uint256 i = 0; i < registeredEmails.length; i++) {
        if (StringUtils.startsWith(registeredEmails[i], prefix)) {
            matches[index] = registeredEmails[i];
            index++;
        }
    }

    return matches;
}





}
