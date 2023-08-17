pragma solidity ^0.8.19;

// SPDX-License-Identifier: MIT

contract AuthContract {
    enum UserRole {
        None,
        User,
        Verifier
    }
    enum RequestStatus {
        Pending,
        Approved,
        Rejected
    }

    mapping(address => UserRole) public userRoles;

    struct DocumentRequest {
        address verifier;
        RequestStatus status;
        bool requestName;
        bool requestDOB;
        bool requestAddress;
    }

    struct DocumentInfo {
        string name;
        string dateOfBirth;
        string addressInfo;
        string documentNumber;
        string documentHash;
    }

    mapping(address => DocumentRequest[]) public userRequests;
    mapping(address => DocumentInfo) public userDocuments;
    mapping(address => mapping(address => DocumentInfo))
        public verifierDocumentAccess;
    address[] public users; // Array to store user addresses

    event OnlyUserModifierExecuted(address indexed user, bool isUser);
    modifier onlyUser() {
        require(
            userRoles[msg.sender] == UserRole.User,
            "Only users can call this function"
        );

        _;
    }

    modifier onlyVerifier() {
        require(
            userRoles[msg.sender] == UserRole.Verifier,
            "Only verifiers can call this function"
        );
        _;
    }

    function registerUser(uint8 role) public {
        require(
            userRoles[msg.sender] == UserRole.None,
            "User already registered"
        );
        require(
            role >= uint8(UserRole.None) && role <= uint8(UserRole.Verifier),
            "Invalid role"
        );

        userRoles[msg.sender] = UserRole(role);
        if (role == uint8(UserRole.User)) {
            users.push(msg.sender); // Add the user to the array when they are registered
        }
    }

    function requestDocumentAccess(
        address user,
        bool requestName,
        bool requestDOB,
        bool requestAddress
    ) public onlyVerifier {
        require(userRoles[user] == UserRole.User, "Invalid user address");

        DocumentRequest memory request = DocumentRequest({
            verifier: msg.sender,
            status: RequestStatus.Pending,
            requestName: requestName,
            requestDOB: requestDOB,
            requestAddress: requestAddress
        });

        userRequests[user].push(request);
    }

    function getUserRequests(
        address user
    ) public view returns (DocumentRequest[] memory) {
        return userRequests[user];
    }

    function approveDocumentAccess(
        address verifier,
        uint256 requestIndex
    ) public onlyUser {
        require(
            userRequests[msg.sender].length > requestIndex,
            "Invalid request index"
        );
        require(
            userRequests[msg.sender][requestIndex].verifier == verifier,
            "Invalid verifier"
        );
        require(
            userRequests[msg.sender][requestIndex].status ==
                RequestStatus.Pending,
            "Request is not pending"
        );
        userRequests[msg.sender][requestIndex].status = RequestStatus.Approved;
        DocumentRequest memory request = userRequests[msg.sender][requestIndex];

    // Create a new DocumentInfo struct to hold the selective sharing attributes
    DocumentInfo memory documentInfo = DocumentInfo({
        name: request.requestName ? userDocuments[msg.sender].name : "",
        dateOfBirth: request.requestDOB ? userDocuments[msg.sender].dateOfBirth : "",
        addressInfo: request.requestAddress ? userDocuments[msg.sender].addressInfo : "",
        documentNumber: userDocuments[msg.sender].documentNumber,
        documentHash: userDocuments[msg.sender].documentHash
    });
       
        verifierDocumentAccess[verifier][msg.sender] = documentInfo;
    }

    function rejectDocumentAccess(
        address verifier,
        uint256 requestIndex
    ) public onlyUser {
        require(
            userRequests[msg.sender].length > requestIndex,
            "Invalid request index"
        );
        require(
            userRequests[msg.sender][requestIndex].verifier == verifier,
            "Invalid verifier"
        );
        require(
            userRequests[msg.sender][requestIndex].status ==
                RequestStatus.Pending,
            "Request is not pending"
        );

        userRequests[msg.sender][requestIndex].status = RequestStatus.Rejected;
        DocumentInfo storage documentInfo = userDocuments[msg.sender];
        documentInfo.name = userRequests[msg.sender][requestIndex].requestName
            ? documentInfo.name
            : "";
        documentInfo.dateOfBirth = userRequests[msg.sender][requestIndex]
            .requestDOB
            ? documentInfo.dateOfBirth
            : "";
        documentInfo.addressInfo = userRequests[msg.sender][requestIndex]
            .requestAddress
            ? documentInfo.addressInfo
            : "";
        verifierDocumentAccess[verifier][msg.sender] = documentInfo;
    }

    function addUserDocument(
        string memory name,
        string memory dateOfBirth,
        string memory addressInfo,
        string memory documentNumber,
        string memory documentHash
    ) public onlyUser {
        DocumentInfo memory documentInfo = DocumentInfo({
            name: name,
            dateOfBirth: dateOfBirth,
            addressInfo: addressInfo,
            documentNumber: documentNumber,
            documentHash: documentHash
        });

        userDocuments[msg.sender] = documentInfo;
    }

    function getVerifierDocumentData(
        address verifier,
        address user
    ) public view returns (DocumentInfo memory) {
        return verifierDocumentAccess[verifier][user];
    }

    function getVerifierAllRequests()
        public
        view
        onlyVerifier
        returns (RequestData[] memory)
    {
        uint256 totalRequests;

        // Loop through all the users to get the total number of requests
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i]; // Get the user address based on the index i

            for (uint256 j = 0; j < userRequests[user].length; j++) {
                DocumentRequest memory request = userRequests[user][j];

                if (request.verifier == msg.sender) {
                    totalRequests++;
                }
            }
        }

        // Create a dynamic array to store the requests
        RequestData[] memory allRequests = new RequestData[](totalRequests);
        uint256 index = 0;

        // Loop through all the users again to collect the requests
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i]; // Get the user address based on the index i

            for (uint256 j = 0; j < userRequests[user].length; j++) {
                DocumentRequest memory request = userRequests[user][j];

                if (request.verifier == msg.sender) {
                    DocumentInfo memory userDocument = verifierDocumentAccess[
                        msg.sender
                    ][user];

                    // Create a new RequestData object with the relevant information
                    RequestData memory requestData = RequestData({
                        userAddress: user,
                        status: request.status,
                        name: request.requestName ? userDocument.name : "",
                        dateOfBirth: request.requestDOB
                            ? userDocument.dateOfBirth
                            : "",
                        addressInfo: request.requestAddress
                            ? userDocument.addressInfo
                            : "",
                        documentNumber: userDocument.documentNumber,
                        documentHash: userDocument.documentHash
                    });

                    // Store the object in the dynamic array
                    allRequests[index] = requestData;
                    index++;
                }
            }
        }

        return allRequests;
    }

    // Define a new struct to hold the request data for each user
    struct RequestData {
        address userAddress;
        RequestStatus status;
        string name;
        string dateOfBirth;
        string addressInfo;
        string documentNumber;
        string documentHash;
    }

    function updateDocumentAccess(
        uint256 requestIndex,
        bool shareName,
        bool shareDOB,
        bool shareAddress
    ) public onlyUser {
        require(
            userRequests[msg.sender].length > requestIndex,
            "Invalid request index"
        );
        require(
            userRequests[msg.sender][requestIndex].status ==
                RequestStatus.Pending,
            "Request is not pending"
        );

        // Update the user's document sharing preferences
        userRequests[msg.sender][requestIndex].requestName = shareName;
        userRequests[msg.sender][requestIndex].requestDOB = shareDOB;
        userRequests[msg.sender][requestIndex].requestAddress = shareAddress;
    }
}
