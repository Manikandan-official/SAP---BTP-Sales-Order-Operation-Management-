using sales.ops as db from '../db/schema';

service SalesService @(path:'/odata/v4/sales') {

  entity SalesOrders       as projection on db.SalesOrder;
  entity SalesOrderItems   as projection on db.SalesOrderItem;
  entity OrderStages       as projection on db.OrderStage;
  entity Customers         as projection on db.Customer;
  entity ERPFileLogs       as projection on db.ERPFileLog;
  
    action resetAll() returns String;


  type CreateChildSOResult : {
    message : String;
    childSO_ID : UUID;
    childSO_orderNo : String;
  };

  action createChildSO(
  parentSO_ID      : UUID,
  skuIDs           : array of String,
  expectedShipDate : Date,
  plant            : String
) returns {
  message          : String;
  childSO_ID       : UUID;
  childSO_orderNo  : String;
};


  action uploadMasterSO(
    fileName : String,
    rows     : array of MasterSOInput
  ) returns String;

  action assignToCalendar(
    orderID          : UUID,
    expectedShipDate : Date
  ) returns SalesOrders;

  action allocateToPlant(
    orderID : UUID,
    plant   : String
  ) returns SalesOrders;

  action changePriority(
    orderID     : UUID,
    newPriority : Integer
  ) returns SalesOrders;

  action requestStageTransition(
  orderID : UUID
) returns String;


  action markMaterialOrdered(
    itemID        : UUID,
    bomRef        : String,
    expectedDate  : Date
  ) returns String;

  action markMaterialReceived(
    itemID       : UUID,
    receivedDate : Date
  ) returns String;

  action qaApprove(
    itemID   : UUID,
    approved : Boolean
  ) returns String;

  action markFGReady(
    orderID : UUID
  ) returns String;

  action createInvoice(
    orderID : UUID
  ) returns String;

  action updateStageColors() returns String;
}
    action resetAll() returns String;



type MasterSOInput : {
  orderNo      : String;
  customerName : String;
  skuName      : String;
  skuCode      : String;
  qty          : Integer;
  unitRate     : Decimal(10,2);
};