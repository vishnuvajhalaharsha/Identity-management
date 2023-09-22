export const filterState = [
  {
    filtertype: "search",
    value: null,
    title: "Email Address",
  },
  {
    filtertype: "status",
    value: null,
    title: "Current Status",
    options: [
      { name: "Approved", value: 1 },
      { name: "Pending", value: 0 },
      { name: "Rejected", value: 2 },
      { name: "Revoked", value: 3 },
    ],
  },
  {
    filtertype: "document",
    value: null,
    title: "Document Type",
    options: [
      { name: "Passport", value: "passport" },
      { name: "Driving License", value: "driving" },
      { name: "Loan Details", value: "loan" },
      { name: "Bank Details", value: "bank" },
    ],
  },
];
