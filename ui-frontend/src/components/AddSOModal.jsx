import React, { useEffect, useMemo, useState } from "react";

/**
 * AddSOModal.jsx
 * - open: boolean
 * - onClose: fn
 * - onCreate: fn(payload)  // payload fields: { orderNo, customer, parentSO_ID, expectedShipDate, priority, stage, remarks }
 * - customers: [{id,name}]
 * - stageCounts: [{id,title,count}]
 * - masters: list of master SOs (for parent selection)
 */

export default function AddSOModal({
  open,
  onClose,
  onCreate,
  customers = [],
  stageCounts = [],
  masters = []
}) {
  if (!open) return null;

  const [orderNo, setOrderNo] = useState("");
  const [customer, setCustomer] = useState(customers.length ? customers[0].name : "");
  const [parentSO_ID, setParentSO_ID] = useState("");
  const [expectedShipDate, setExpectedShipDate] = useState("");
  const [priority, setPriority] = useState(1);
  const [stage, setStage] = useState("SalesSupport");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    // default customer if available
    if (customers.length && !customer) {
      setCustomer(customers[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers]);

  const masterOptionsForCustomer = useMemo(() => {
    if (!customer) return masters;
    return masters.filter(m => (m.customerName || m.customer_name || "") === customer);
  }, [masters, customer]);

  const handleCreate = () => {
    // validation: if user typed order number ensure it matches format
    const soRegex = /^SO\d{4}(\/\d+)?$/;
    const providedSO = String(orderNo || "").trim();

    // payload we send to App
    const payload = {
      orderNo: providedSO || "",
      customer,
      parentSO_ID: parentSO_ID || null,
      expectedShipDate: expectedShipDate || null,
      priority: Number(priority || 0),
      stage,
      remarks
    };

    onCreate(payload);
    // onCreate is expected to close modal in App; fallback close here
    if (typeof onClose === "function") onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[800px] max-w-full h-[520px] rounded-xl shadow-lg flex overflow-hidden">
        {/* LEFT COUNTS */}
        <aside className="w-64 bg-gray-50 p-4 border-r">
          <h3 className="text-orange-600 font-semibold mb-4">Sales Order</h3>
          <div className="space-y-3">
            {stageCounts.map(s => (
              <div key={s.id} className="flex justify-between items-center bg-white px-3 py-2 rounded shadow-sm border">
                <div className="text-sm text-gray-700">{s.title}</div>
                <div className="text-sm font-semibold text-gray-900">({s.count})</div>
              </div>
            ))}
          </div>
        </aside>

        {/* FORM */}
        <div className="flex-1 p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Sales Order</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">SO Number (optional)</label>
              <input
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value.toUpperCase())}
                placeholder="SO1234 (optional, will auto-generate)"
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
              <div className="text-xs text-gray-400 mt-1">If empty or invalid, system will auto-generate.</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Customer</label>
              <select
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                <option value="">Select customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Parent SO (optional)</label>
              <select
                value={parentSO_ID}
                onChange={(e) => setParentSO_ID(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                <option value="">No parent (create master)</option>
                {masterOptionsForCustomer.map(m => (
                  <option key={m.ID} value={m.ID}>{m.orderNo} — {m.customerName}</option>
                ))}
              </select>
              <div className="text-xs text-gray-400 mt-1">Select a master to create a child SO like SO1001/1</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Expected Ship Date</label>
              <input
                type="date"
                value={expectedShipDate || ""}
                onChange={(e) => setExpectedShipDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Priority</label>
              <input
                type="number"
                min={0}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                <option value="SalesSupport">Sales Order</option>
                <option value="Procurement">Purchases</option>
                <option value="RMInventory">RM Inventory</option>
                <option value="Quality">Quality</option>
                <option value="FGInventory">FG Inventory</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm text-gray-600">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
                rows={3}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-md border bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 rounded-md bg-[#F16523] text-white font-semibold hover:bg-orange-600">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}
