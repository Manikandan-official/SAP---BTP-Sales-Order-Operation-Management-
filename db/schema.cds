namespace sales.ops;

using { cuid } from '@sap/cds/common';

// CUSTOMER
entity Customer : cuid {
  name        : String(100);
  email       : String(100);
  phone       : String(20);
  address     : String(200);
}

// SALES ORDER (both Master & Child)
entity SalesOrder : cuid {
  orderNo          : String(50);
  parentSO         : Association to SalesOrder;   // null => master
  customer         : Association to Customer;
  expectedShipDate : Date;
  plant            : String(100);
  status           : String(30);
  priority         : Integer default 0;
  currentStage     : String(30);
  lastActivity     : DateTime;
  remarks          : String(500);

  items  : Composition of many SalesOrderItem
             on items.parentSO = $self;

  stages : Composition of many OrderStage
             on stages.order = $self;
}

// SKU / LINE ITEMS
entity SalesOrderItem : cuid {
  parentSO         : Association to SalesOrder;

  skuName          : String(200);
  skuCode          : String(50);
  unitRate         : Decimal(10,2);
  qty              : Integer;

  materialOrdered  : Boolean default false;
  bomOrderRef      : String(100);
  bomExpectedDate  : Date;

  materialReceived : Boolean default false;
  receivedDate     : Date;

  qaApproved       : Boolean default false;

  fgReady          : Boolean default false;
  invoiceCreated   : Boolean default false;
}

// STAGE HISTORY
entity OrderStage : cuid {
  order           : Association to SalesOrder;
  stageName       : String(30);
  enteredAt       : DateTime;
  expectedUntil   : DateTime;
  completedAt     : DateTime;
  statusColor     : String(10);
  assignedTo      : String(100);
  notes           : String(500);
}

// ERP FILE LOG
entity ERPFileLog : cuid {
  fileName      : String(200);
  uploadedAt    : DateTime;
  processedAt   : DateTime;
  status        : String(20);
  remarks       : String(500);
}
