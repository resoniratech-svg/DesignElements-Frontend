import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { useState, useEffect } from "react";

function ChartOfAccounts() {
  const [data, setData] = useState<any[]>([]);

  const columns = [
    "Account Code",
    "Account Name",
    "Type",
    "Balance"
  ];

  useEffect(() => {
    const mockAccounts = [
      {
        "Account Code": "1001",
        "Account Name": "Cash",
        Type: "Asset",
        Balance: "QAR 12,000"
      },
      {
        "Account Code": "2001",
        "Account Name": "Accounts Payable",
        Type: "Liability",
        Balance: "QAR 5,000"
      },
      {
        "Account Code": "3001",
        "Account Name": "Sales Revenue",
        Type: "Revenue", 
        Balance: "QAR 20,000"
      },
      {
        "Account Code": "4001",
        "Account Name": "Salaries Expense",
        Type: "Expense",
        Balance: "QAR 8,000"
      }
    ];

    const localAccounts = JSON.parse(localStorage.getItem("trek_accounts") || "[]");
    const formattedLocal = localAccounts.map((acc: any) => ({
      "Account Code": acc.code,
      "Account Name": acc.name,
      Type: acc.type,
      Balance: "QAR 0"
    }));

    setData([...formattedLocal, ...mockAccounts]);
  }, []);


  return (
    <>

      <PageHeader
        title="Chart of Accounts"
        action={
          <Link to="/create-account">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Plus size={16}/>
              Create Account
            </button>
          </Link>
        }
      />

      <DataTable columns={columns} data={data} />

    </>
  );
}

export default ChartOfAccounts;