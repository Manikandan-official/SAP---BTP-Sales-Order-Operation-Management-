import React, { useMemo, useState } from "react";

export default function AddSOModal({
  open,
  onClose,
  onCreate,
  masterSO
}) {
  const [step, setStep] = useState(1);
  const [selectedSKUs, setSelectedSKUs] = useState([]);
  const [shipDate, setShipDate] = useState("");
  const [plant, setPlant] = useState("");

  if (!open || !masterSO) return null;

  const nextChildIndex = (masterSO.children?.length || 0) + 1;
  const childSOName = `${masterSO.orderNo}/${nextChildIndex}`;

  const availableSKUs = useMemo(
    () => masterSO.items || [],
    [masterSO]
  );

  const toggleSKU = (sku) => {
    setSelectedSKUs(prev =>
      prev.includes(sku)
        ? prev.filter(s => s !== sku)
        : [...prev, sku]
    );
  };

  const canProceed =
    (step === 1 && selectedSKUs.length > 0) ||
    (step === 2 && shipDate) ||
    (step === 3 && plant);

  const handleSave = () => {
    onCreate({
      parentSO_ID: masterSO.ID,
      customer_ID: masterSO.customer_ID,
      orderNo: childSOName,
      expectedShipDate: shipDate,
      plant,
      items: selectedSKUs.map(sku => ({
        ...sku,
        materialOrdered: false,
        materialReceived: false,
        qaApproved: false,
        fgReady: false
      }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[640px] rounded shadow-lg p-6">
        <h2 className="text-lg font-semibold text-orange-600 mb-4">
          Create Child SO
        </h2>

        {/* STEP INDICATOR */}
        <div className="flex gap-4 mb-6 text-sm">
          {[1, 2, 3].map(s => (
            <span
              key={s}
              className={`px-3 py-1 rounded ${
                step === s
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Step {s}
            </span>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="mb-4">
              <label className="text-xs text-gray-500">SO Name</label>
              <input value={childSOName} disabled className="w-full border-b py-1" />
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th />
                  <th>SKU</th>
                  <th>Unit Rate</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {availableSKUs.map((sku, idx) => (
                  <tr key={idx} className="border-b">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSKUs.includes(sku)}
                        onChange={() => toggleSKU(sku)}
                      />
                    </td>
                    <td>{sku.skuName}</td>
                    <td>₹ {sku.unitRate}</td>
                    <td>{sku.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <label className="text-sm">Expected Ship Date</label>
            <input
              type="date"
              className="w-full border-b mt-2"
              value={shipDate}
              onChange={e => setShipDate(e.target.value)}
            />
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <label className="text-sm">Allocate to Plant</label>
            <select
              className="w-full border-b mt-2"
              value={plant}
              onChange={e => setPlant(e.target.value)}
            >
              <option value="">Select Plant</option>
              <option>Delhi</option>
              <option>Chennai</option>
              <option>Pune</option>
            </select>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200">
            Cancel
          </button>

          {step < 3 ? (
            <button
              disabled={!canProceed}
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-orange-500 text-white disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-orange-600 text-white"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
