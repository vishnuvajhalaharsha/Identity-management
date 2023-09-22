const { assert } = require('chai');
const DocumentSharingContract = artifacts.require('DocumentSharingContract');

contract('DocumentSharingContract', function (accounts) {
  let contractInstance;

  before(async function () {
    contractInstance = await DocumentSharingContract.deployed();
  });

  it('should register a user', async function () {
    await contractInstance.registerUser(1, 'user@example.com', { from: accounts[0] });
    const userRole = await contractInstance.userRoles(accounts[0]);
    assert.equal(userRole, 1, 'User was not registered with the correct role');
  });

  it('should register a verifier', async function () {
    await contractInstance.registerUser(2, 'verifier@example.com', { from: accounts[1] });
    const verifierRole = await contractInstance.userRoles(accounts[1]);
    assert.equal(verifierRole, 2, 'Verifier was not registered with the correct role');
  });

  it('should add a document', async function () {
    const documentType = 'Passport';
    const keys = ['IssueDate', 'ExpiryDate'];
    const values = ['2023-01-01', '2033-01-01'];

    await contractInstance.addDocument(documentType, keys, values, { from: accounts[0] });

    const { keys: returnedKeys, values: returnedValues } = await contractInstance.getUserDocuments(accounts[0]);
    assert.deepEqual(returnedKeys[0], keys, 'Keys not matched');
    assert.deepEqual(returnedValues[0], values, 'Values not matched');
  });

  it('should request document access', async function () {
    const verifierEmail = 'verifier@example.com';
    const documentType = 'Passport';
    const attributes = ['IssueDate', 'ExpiryDate'];

    await contractInstance.registerUser(2, verifierEmail, { from: accounts[1] });
    await contractInstance.requestDocumentAccess('user@example.com', documentType, attributes, { from: accounts[1] });

    const requests = await contractInstance.getUserRequests(accounts[1]);
    assert.equal(requests.length, 1, 'Request not recorded');
  });

  it('should approve document access', async function () {
    const requestIndex = 0;
    const approvedKeys = ['IssueDate'];

    await contractInstance.approveDocumentAccess(requestIndex, approvedKeys, { from: accounts[0] });

    const requests = await contractInstance.getUserRequests(accounts[0]);
    assert.equal(requests[requestIndex].status, 1, 'Request not approved');
  });

  it('should reject document access', async function () {
    const requestIndex = 0;

    await contractInstance.rejectDocumentAccess(requestIndex, { from: accounts[0] });

    const requests = await contractInstance.getUserRequests(accounts[0]);
    assert.equal(requests[requestIndex].status, 2, 'Request not rejected');
  });

  it('should revoke document attributes', async function () {
    const requestIndex = 0;
    const keysToRevoke = ['IssueDate'];

    await contractInstance.revokeDocumentAttributes(requestIndex, keysToRevoke, { from: accounts[0] });

    const requests = await contractInstance.getUserRequests(accounts[0]);
    assert.equal(requests[requestIndex].status, 3, 'Attributes not revoked');
  });

  
});
