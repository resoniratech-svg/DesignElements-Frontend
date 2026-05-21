
function JobDocuments() {
  return (
    <>

      <h1 className="text-2xl font-bold mb-6">
        Job Documents
      </h1>

      <div className="bg-white p-6 rounded shadow max-w-3xl">

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm mb-1">Job ID</label>
            <input className="w-full border p-2 rounded" placeholder="JOB-001" />
          </div>

          <div>
            <label className="block text-sm mb-1">Document Type</label>
            <select className="w-full border p-2 rounded">
              <option>Passport Copy</option>
              <option>Visa Copy</option>
              <option>Trade License</option>
              <option>Contract Document</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm mb-1">Upload File</label>
            <input type="file" className="w-full border p-2 rounded" />
          </div>

        </div>

        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">
          Upload Document
        </button>

      </div>

    </>
  );
}

export default JobDocuments;