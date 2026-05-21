import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";

function Receipts() {

  const columns = [
    "Receipt ID",
    "Client",
    "Amount",
    "Date"
  ];

  const data = [
    {
      "Receipt ID": "REC-001",
      Client: "ABC Company",
      Amount: "QAR 2500",
      Date: "2026-03-06"
    }
  ];

  return (
    <>

      <PageHeader  title="Receipts" />

      <DataTable columns={columns} data={data} />

    </>
  );
}

export default Receipts;