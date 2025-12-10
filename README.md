# 📦 SAP BTP – Sales Order Operation Management System  
*A Cloud-Native CAP + HANA + React Solution for End-to-End Sales Order Tracking*

---

## 🚀 Overview

The **Sales Order Operation Management System** is a full-stack cloud application built on **SAP Business Technology Platform (BTP)**, leveraging:

- **SAP CAP (Cloud Application Programming Model)**
- **SAP HANA Cloud**
- **React Frontend (Drag-and-Drop UI)**
- **MTA Deployment Model**
- (Optional) **SAP Workflow Management**

This system replaces traditional Excel-based Sales Order tracking with a modern, role-based, real-time visualization and operational workflow system.

It provides unified visibility across:

✔ Sales Support  
✔ Procurement  
✔ Raw Material Inventory  
✔ Quality Check  
✔ Finished Goods Inventory  

---

## 🎯 Key Features

### 🔹 1. Master SO & Child SO Management
- Upload Master Sales Orders  
- Split SO into multiple Child SOs  
- Auto-generate Child SO IDs  
- Assign SKUs, Plants, Expected Shipping Dates  

---

### 🔹 2. Drag-and-Drop Tracking Board (KANBAN UI)
A real-time board showing the operational stages:

1. Sales Support  
2. Procurement  
3. Raw Materials Inventory  
4. Quality Check  
5. Finished Goods Inventory  

---

### 🔹 3. SLA Status Indicator (RAG Colors)
Each SO card displays dynamic status:

- 🟥 **Red** – Delayed  
- 🟧 **Amber** – At Risk  
- 🟩 **Green** – On Time  

---

### 🔹 4. Department-Specific Operations
- Sales Support: Create & verify orders  
- Procurement: Update raw material orders  
- RM Inventory: Confirm material receipt  
- QC: Approve material  
- FG: Mark readiness for dispatch  

---

### 🔹 5. SAP HANA Cloud Integration
Persistent data storage for:

- Sales Orders  
- Sales Items  
- Customers  
- SKU details  
- Workflow Stages  
- Timelines  

---

### 🔹 6. Modern React UI (Drag & Drop)
Frontend built with:

- React  
- TailwindCSS  
- SortableJS  
- Axios for API communication  

---

## 🏗️ Architecture

```text
                   ┌───────────────────────────────┐
                   │         React Frontend         │
                   │  (Drag & Drop Kanban Board)    │
                   └───────────────┬───────────────┘
                                   │ REST API Calls
                                   ▼
                   ┌───────────────────────────────┐
                   │      SAP CAP Backend (Node)   │
                   │  CDS Models + Service Layer   │
                   └───────────────┬───────────────┘
                                   │ SQL Access
                                   ▼
                   ┌───────────────────────────────┐
                   │        SAP HANA Cloud          │
                   │    Tables, Views, Schema       │
                   └───────────────────────────────┘
```
## 🧩 Tech Stack

### **Backend**
- SAP CAP (Node.js)
- CDS Models
- SAP HANA Cloud
- MTA Deployment

### **Frontend**
- React.js
- TailwindCSS
- SortableJS
- Axios

### **Tools**
- SAP Business Application Studio
- Cloud Foundry CLI
- GitHub

---

## 📂 Project Structure

sales-order-operation/
│
├── app/ → Approuter / UI5 modules (if any)
├── db/ → CDS models & CSV data
│ ├── schema.cds
│ └── data/
│
├── srv/ → CAP service layer
│ ├── service.cds
│ └── service.js
│
├── ui-frontend/ → React drag-and-drop UI
│ ├── src/
│ ├── public/
│ ├── package.json
│ └── tailwind.config.js
│
├── mta.yaml → Multi-target application descriptor
├── package.json → CAP backend dependencies
└── README.md → Project documentation

## 🛠️ Running Locally

### 1. Install Backend Dependencies
```bash
npm install

```


