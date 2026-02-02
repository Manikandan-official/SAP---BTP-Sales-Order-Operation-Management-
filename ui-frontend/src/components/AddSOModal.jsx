// src/components/AddSOModal.jsx
import React, { useMemo, useState } from "react";

/**
 * AddSOModal (Frontend-Complete)
 * =========================================================
 * ✔ Creates Child SO from selected Master
 * ✔ Enforces Master → Child relationship
 * ✔ Backend-agnostic
 * ✔ SKU logic deferred to next phase
 * =========================================================
 */

export default function AddSOModal({
  open,
  onClose,
  onCreate,
  masters = [],
  selectedMaster
}) {
  const [step, setStep] = useState(1);
  const [shipDate, setShipDate] = useState("");
  const [plant, setPlant] = useState("");

  if (!open) return null;

  const masterSO = useMemo(
    () => masters.find(m => m.ID === selectedMaster),
    [masters, selectedMaster]
  );

  if (!masterSO) return null;

  /* =====================================================
     CHILD SO NUMBER (FRONTEND LOGIC)
  ===================================================== */
  const existingChildrenCount = masters.filter(
    o => o.parentSO_ID === masterSO.ID
  ).length;

  const childOrderNo = `${masterSO.orderNo}/${existingChildrenCount + 1}`;

  /* =====================================================
     VALIDATION
  ===================================================== */
  const canProceed =
    (step === 1 && true) ||
    (step === 2 && shipDate) ||
    (step === 3 && plant);

  /* =====================================================
     SAVE HANDLER
  ===================================================== */
  const handleSave = () => {
    onCreate({
      parentSO_ID: masterSO.ID,
      orderNo: childOrderNo,
      customer_ID: masterSO.customer_ID,
      expectedShipDate: shipDate,
      plant
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[560px] rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-orange-600 mb-4">
          Create Child Sales Order
        </h2>

        {/* STEP INDICATOR */}
        <div className="flex gap-3 mb-6 text-sm">
          {[1, 2, 3].map(s => (
            <span
              key={s}
              className={`px-3 py-1 rounded-full ${
                step === s
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              Step {s}
            </span>
          ))}
        </div>

        {/* STEP 1 – REVIEW */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Master SO</label>
              <input
                value={masterSO.orderNo}
                disabled
                className="w-full border-b py-1 bg-transparent"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Child SO Number</label>
              <input
                value={childOrderNo}
                disabled
                className="w-full border-b py-1 bg-transparent"
              />
            </div>

            <p className="text-sm text-gray-500">
              This child SO will inherit customer details from the master order.
            </p>
          </div>
        )}

        {/* STEP 2 – SHIP DATE */}
        {step === 2 && (
          <div>
            <label className="text-sm font-medium">
              Expected Ship Date
            </label>
            <input
              type="date"
              className="w-full border-b mt-2 py-1"
              value={shipDate}
              onChange={e => setShipDate(e.target.value)}
            />
          </div>
        )}

        {/* STEP 3 – PLANT */}
        {step === 3 && (
          <div>
            <label className="text-sm font-medium">
              Allocate to Plant
            </label>
            <select
              className="w-full border-b mt-2 py-1"
              value={plant}
              onChange={e => setPlant(e.target.value)}
            >
              <option value="">Select Plant</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
              <option value="Pune">Pune</option>
            </select>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancel
          </button>

          {step < 3 ? (
            <button
              disabled={!canProceed}
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 rounded bg-orange-500 text-white disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-orange-600 text-white"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
