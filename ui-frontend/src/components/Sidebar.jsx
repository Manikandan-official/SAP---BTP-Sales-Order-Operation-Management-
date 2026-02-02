// src/components/Sidebar.jsx
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "react-feather";

/**
 * Sidebar.jsx (Frontend Final)
 * =========================================================
 * ✔ Customer → Master → Child hierarchy
 * ✔ Decoupled expand vs select behavior
 * ✔ Master selection is explicit and stable
 * ✔ Backend-agnostic
 * =========================================================
 */

export default function Sidebar({
  customers = [],
  orders = [],
  selectedMaster = null,
  onMasterSelect = () => {}
}) {
  const [openCustomers, setOpenCustomers] = useState({});
  const [openMasters, setOpenMasters] = useState({});

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  /* =========================================================
     GROUP ORDERS BY CUSTOMER
  ========================================================= */
  const groupedByCustomer = useMemo(() => {
    const map = {};

    safeCustomers.forEach(c => {
      if (c?.id) map[c.id] = [];
    });

    safeOrders.forEach(o => {
      if (!o?.customer_ID) return;
      if (!map[o.customer_ID]) map[o.customer_ID] = [];
      map[o.customer_ID].push(o);
    });

    return map;
  }, [safeCustomers, safeOrders]);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <aside className="w-64 bg-white border-r px-3 py-4 overflow-y-auto">
      <h2 className="font-semibold text-lg mb-1">Customers</h2>
      <p className="text-xs text-gray-500 mb-4">Sales Orders</p>

      {safeCustomers.length === 0 && (
        <p className="text-sm text-gray-400">No customers available</p>
      )}

      {safeCustomers.map(customer => {
        const customerId = customer.id;
        const customerName = customer.name || "Unknown Customer";
        const isCustomerOpen = !!openCustomers[customerId];

        const customerOrders = groupedByCustomer[customerId] || [];
        const masterOrders = customerOrders.filter(o => !o.parentSO_ID);

        return (
          <div key={customerId} className="mb-3">
            {/* CUSTOMER ROW (EXPAND ONLY) */}
            <div
              className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-gray-100"
              onClick={() =>
                setOpenCustomers(prev => ({
                  ...prev,
                  [customerId]: !isCustomerOpen
                }))
              }
            >
              <span className="text-sm font-medium">{customerName}</span>
              {isCustomerOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>

            {/* MASTER SALES ORDERS */}
            {isCustomerOpen && masterOrders.length > 0 && (
              <div className="ml-4 mt-1 space-y-1">
                {masterOrders.map(master => {
                  const masterId = master.ID;
                  const isMasterOpen = !!openMasters[masterId];

                  const childOrders = customerOrders.filter(
                    o => o.parentSO_ID === masterId
                  );

                  return (
                    <div key={masterId}>
                      {/* MASTER ROW (SELECT + EXPAND) */}
                      <div
                        className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer
                          ${
                            selectedMaster === masterId
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          onMasterSelect(masterId);
                          setOpenMasters(prev => ({
                            ...prev,
                            [masterId]: !isMasterOpen
                          }));
                        }}
                      >
                        <span className="text-sm font-medium">
                          {master.orderNo}
                        </span>
                        {isMasterOpen ? (
                          <ChevronDown size={12} />
                        ) : (
                          <ChevronRight size={12} />
                        )}
                      </div>

                      {/* CHILD SALES ORDERS (DISPLAY ONLY) */}
                      {isMasterOpen && childOrders.length > 0 && (
                        <div className="ml-4 mt-1 space-y-1">
                          {childOrders.map(child => (
                            <div
                              key={child.ID}
                              className="px-2 py-1 text-xs text-gray-600"
                            >
                              {child.orderNo}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
