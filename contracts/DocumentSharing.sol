// pragma solidity ^0.8.19;

// // SPDX-License-Identifier: MIT

// contract AuthContract {
//     enum UserRole {
//         None,
//         User,
//         Verifier
//     }
//     enum RequestStatus {
//         Pending,
//         Approved,
//         Rejected
//     }

//     mapping(address => UserRole) public userRoles;

//     struct DocumentRequest {
//         string documentType;
//         address verifier;
//         RequestStatus status;
//         bool requestName;
//         bool requestDOB;
//         bool requestAddress;
//     }

//     struct DocumentInfo {
//         string documentType;
//         string name;
//         string dateOfBirth;
//         string addressInfo;
//         string documentNumber;
//         string documentHash;
//     }

//     mapping(address => DocumentRequest[]) public userRequests;
//     mapping(address => DocumentInfo[]) public userDocuments;
//     mapping(address => mapping(address => mapping(string => DocumentInfo)))
//         public verifierDocumentAccess;
//     address[] public users;

//     modifier onlyUser() {
//         require(
//             userRoles[msg.sender] == UserRole.User,
//             "Only users can call this function"
//         );
//         _;
//     }

//     modifier onlyVerifier() {
//         require(
//             userRoles[msg.sender] == UserRole.Verifier,
//             "Only verifiers can call this function"
//         );
//         _;
//     }

//     function registerUser(uint8 role) public {
//         require(
//             userRoles[msg.sender] == UserRole.None,
//             "User already registered"
//         );
//         require(
//             role >= uint8(UserRole.None) && role <= uint8(UserRole.Verifier),
//             "Invalid role"
//         );

//         userRoles[msg.sender] = UserRole(role);
//         if (role == uint8(UserRole.User)) {
//             users.push(msg.sender);
//         }
//     }

//     function requestDocumentAccess(
//         address user,
//         string memory documentType,
//         bool requestName,
//         bool requestDOB,
//         bool requestAddress
//     ) public onlyVerifier {
//         require(userRoles[user] == UserRole.User, "Invalid user address");

//         DocumentRequest memory request = DocumentRequest({
//             documentType: documentType,
//             verifier: msg.sender,
//             status: RequestStatus.Pending,
//             requestName: requestName,
//             requestDOB: requestDOB,
//             requestAddress: requestAddress
//         });

//         userRequests[user].push(request);
//     }

//     function getUserRequests(
//         address user
//     ) public view returns (DocumentRequest[] memory) {
//         return userRequests[user];
//     }

//     function approveDocumentAccess(
//         address verifier,
//         uint256 requestIndex
//     ) public onlyUser {
//         require(
//             userRequests[msg.sender].length > requestIndex,
//             "Invalid request index"
//         );
//         require(
//             userRequests[msg.sender][requestIndex].verifier == verifier,
//             "Invalid verifier"
//         );
//         require(
//             userRequests[msg.sender][requestIndex].status ==
//                 RequestStatus.Pending,
//             "Request is not pending"
//         );

//         userRequests[msg.sender][requestIndex].status = RequestStatus.Approved;

//         DocumentRequest memory request = userRequests[msg.sender][requestIndex];

//         string memory documentType = request.documentType;
//         DocumentInfo memory requestedDocument;

//         for (uint256 i = 0; i < userDocuments[msg.sender].length; i++) {
//             if (
//                 keccak256(bytes(userDocuments[msg.sender][i].documentType)) ==
//                 keccak256(bytes(documentType))
//             ) {
//                 requestedDocument = userDocuments[msg.sender][i];
//                 break;
//             }
//         }

//         DocumentInfo memory documentInfo = DocumentInfo({
//             documentType: documentType,
//             name: request.requestName ? requestedDocument.name : "",
//             dateOfBirth: request.requestDOB ? requestedDocument.dateOfBirth : "",
//             addressInfo: request.requestAddress ? requestedDocument.addressInfo : "",
//             documentNumber: requestedDocument.documentNumber,
//             documentHash: requestedDocument.documentHash
//         });

//         verifierDocumentAccess[verifier][msg.sender][documentType] = documentInfo;
//     }

//     function rejectDocumentAccess(
//         address verifier,
//         uint256 requestIndex
//     ) public onlyUser {
//         require(
//             userRequests[msg.sender].length > requestIndex,
//             "Invalid request index"
//         );
//         require(
//             userRequests[msg.sender][requestIndex].verifier == verifier,
//             "Invalid verifier"
//         );
//         require(
//             userRequests[msg.sender][requestIndex].status ==
//                 RequestStatus.Pending,
//             "Request is not pending"
//         );

//         userRequests[msg.sender][requestIndex].status = RequestStatus.Rejected;
//     }

//     function addUserDocument(
//         string memory documentType,
//         string memory name,
//         string memory dateOfBirth,
//         string memory addressInfo,
//         string memory documentNumber,
//         string memory documentHash
//     ) public onlyUser {
//         DocumentInfo memory documentInfo = DocumentInfo({
//             documentType: documentType,
//             name: name,
//             dateOfBirth: dateOfBirth,
//             addressInfo: addressInfo,
//             documentNumber: documentNumber,
//             documentHash: documentHash
//         });

//         userDocuments[msg.sender].push(documentInfo);
//     }

//     function getVerifierDocumentData(
//         address verifier,
//         address user,
//         string memory documentType
//     ) public view onlyVerifier returns (DocumentInfo memory) {
//         return verifierDocumentAccess[verifier][user][documentType];
//     }

//     function getUsers() public view onlyVerifier returns (address[] memory) {
//         return users;
//     }
// }
