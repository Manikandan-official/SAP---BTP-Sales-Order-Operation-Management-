import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "react-feather";

export default function Sidebar({
  customers,
  orders,
  selectedCustomer,
  selectedMaster,
  onCustomerSelect,
  onMasterSelect,
}) {
  /* ----------------------------------
     Local Expand/Collapse State
  ---------------------------------- */
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [expandedMaster, setExpandedMaster] = useState(null);

  /* ----------------------------------
     Normalized Orders + Grouping
  ---------------------------------- */

  const customerGroups = useMemo(() => {
    const map = new Map();

    // Step 1: base structure for each customer
    customers.forEach((c) =>
      map.set(String(c.id), { ...c, masters: [] })
    );

    // Step 2: Normalize all orders
    const normalizedOrders = orders.map((o) => ({
      ...o,
      ID: String(o.ID),
      customer_ID: String(o.customer_ID ?? o.customerName),
      parentSO_ID: o.parentSO_ID ? String(o.parentSO_ID) : null,
    }));

    // Step 3: Add all master SOs to each customer block
    normalizedOrders.forEach((o) => {
      if (!o.parentSO_ID) {
        const block = map.get(o.customer_ID);
        if (block) {
          block.masters.push({ ...o, children: [] });
        }
      }
    });

    // Step 4: Attach children SOs under correct master
    normalizedOrders.forEach((o) => {
      if (o.parentSO_ID) {
        const parentID = String(o.parentSO_ID);

        // Find master node under the right customer
        normalizedOrders.forEach((m) => {
          if (String(m.ID) === parentID && !m.parentSO_ID) {
            const block = map.get(m.customer_ID);
            if (block) {
              const masterNode = block.masters.find(
                (ms) => String(ms.ID) === parentID
              );
              if (masterNode) {
                masterNode.children.push(o);
              }
            }
          }
        });
      }
    });

    return [...map.values()];
  }, [customers, orders]);

  /* ----------------------------------
     UI Handlers
  ---------------------------------- */

  // Clicking arrow expands/collapses ONLY
  const toggleCustomerExpand = (id) => {
    setExpandedCustomer((prev) => (prev === id ? null : id));
  };

  const toggleMasterExpand = (id) => {
    setExpandedMaster((prev) => (prev === id ? null : id));
  };

  // Clicking text performs actual filtering
  const handleCustomerClick = (id) => {
    onCustomerSelect(id === selectedCustomer ? null : id);
  };

  const handleMasterClick = (id) => {
    onMasterSelect(id === selectedMaster ? null : id);
  };

  /* ----------------------------------
     Render UI
  ---------------------------------- */

  return (
    <aside className="w-64 bg-white border-r border-gray-200 px-4 py-6 overflow-auto">
      <h3 className="font-bold text-xl mb-2">Customers</h3>
      <p className="text-sm text-gray-400 mb-4">Active list</p>

      <div className="space-y-3">
        {customerGroups.map((customer) => {
          const isCustSelected = selectedCustomer === customer.id;
          const isCustExpanded = expandedCustomer === customer.id;

          return (
            <div key={customer.id}>
              {/* -------------------------------
                 CUSTOMER ROW
              -------------------------------- */}
              <div className="flex items-center justify-between">
                {/* TEXT → SELECT CUSTOMER */}
                <div
                  onClick={() => handleCustomerClick(customer.id)}
                  className={`cursor-pointer font-semibold ${
                    isCustSelected ? "text-orange-600" : "text-gray-800"
                  }`}
                >
                  {customer.name}
                </div>

                {/* ARROW → EXPAND ONLY */}
                <div
                  className="cursor-pointer"
                  onClick={() => toggleCustomerExpand(customer.id)}
                >
                  {isCustExpanded ? (
                    <ChevronDown size={16} className="text-orange-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                </div>
              </div>

              {/* -------------------------------
                 MASTER SO LIST
              -------------------------------- */}
              {isCustExpanded && (
                <div className="ml-4 mt-2 space-y-2">
                  {customer.masters.length === 0 && (
                    <div className="text-xs text-gray-400">No Master SOs</div>
                  )}

                  {customer.masters.map((master) => {
                    const isMasterSelected = selectedMaster === master.ID;
                    const isMasterExpanded = expandedMaster === master.ID;

                    return (
                      <div key={master.ID}>
                        {/* MASTER ROW */}
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => handleMasterClick(master.ID)}
                            className={`cursor-pointer ${
                              isMasterSelected
                                ? "text-orange-600 font-semibold"
                                : "text-gray-700 font-medium"
                            }`}
                          >
                            {master.orderNo}
                          </div>

                          <div
                            className="cursor-pointer"
                            onClick={() => toggleMasterExpand(master.ID)}
                          >
                            {master.children.length > 0 ? (
                              isMasterExpanded ? (
                                <ChevronDown
                                  size={14}
                                  className="text-orange-600"
                                />
                              ) : (
                                <ChevronRight
                                  size={14}
                                  className="text-gray-500"
                                />
                              )
                            ) : null}
                          </div>
                        </div>

                        {/* CHILD SO LIST */}
                        {isMasterExpanded && master.children.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1">
                            {master.children.map((child) => (
                              <div
                                key={child.ID}
                                className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                                onClick={() => handleMasterClick(master.ID)}
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
      </div>
    </aside>
  );
}
