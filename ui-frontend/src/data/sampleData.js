export default [
  {
    ID: "M1",
    orderNo: "SO1001",
    customer: { name: "Customer 1" },
    expectedShipDate: "2025-12-20",
    currentStage: "SalesSupport",
    priority: 1,
    remarks: "Master Order 1"
  },
  {
    ID: "M2",
    orderNo: "SO1002",
    customer: { name: "Customer 2" },
    expectedShipDate: "2025-12-22",
    currentStage: "SalesSupport",
    priority: 1,
    remarks: "Master Order 2"
  },
  {
    ID: "M3",
    orderNo: "SO1003",
    customer: { name: "Customer 3" },
    expectedShipDate: "2025-12-25",
    currentStage: "Procurement",
    priority: 1
  },
  {
    ID: "M4",
    orderNo: "SO1004",
    customer: { name: "Customer 2" },
    expectedShipDate: "2025-12-27",
    currentStage: "RMInventory",
    priority: 1
  }
];
