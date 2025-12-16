export default [
  {
    ID: "M1",
    orderNo: "SO1001",
    customerName: "Customer 1",
    expectedShipDate: "2025-12-20",
    currentStage: "SalesSupport",
    priority: 1,
    remarks: "Master Order 1",

    // NEW FIELDS FOR FULL UI
    tat: "TAT24/10/2022",
    deliveryDate: "2025-12-20",
    poNumber: "PO1234",
    shipByDate: "2025-12-20",
    plant: "Plant A",
    status: "Pending"
  },

  {
    ID: "M2",
    orderNo: "SO1002",
    customerName: "Customer 2",
    expectedShipDate: "2025-12-22",
    currentStage: "Procurement",
    priority: 1,
    remarks: "Master Order 2",

    tat: "TAT24/10/2022",
    deliveryDate: "2025-12-22",
    poNumber: "PO1234",
    shipByDate: "2025-12-22",
    plant: "Plant B",
    status: "Received"
  },

  {
    ID: "M3",
    orderNo: "SO1003",
    customerName: "Customer 2",
    expectedShipDate: "2025-12-25",
    currentStage: "Procurement",
    priority: 1,
    remarks: "Master Order 2",

    tat: "TAT24/10/2022",
    deliveryDate: "2025-12-25",
    poNumber: "PO1234",
    shipByDate: "2025-12-25",
    plant: "Plant C",
    status: "Delayed"
  },

  {
    ID: "M4",
    orderNo: "SO1004",
    customerName: "Customer 3",
    expectedShipDate: "2025-12-27",
    currentStage: "RMInventory",
    priority: 1,
    remarks: "Master Order 3",

    tat: "TAT24/10/2022",
    deliveryDate: "2025-12-27",
    poNumber: "PO1234",
    shipByDate: "2025-12-27",
    plant: "Plant D",
    status: "QA"
  }
];
