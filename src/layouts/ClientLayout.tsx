import Navbar from "../components/Navbar";

function ClientLayout({ children }: any) {

  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="p-6 w-full h-full">
        {children}
      </main>

    </div>

  );

}

export default ClientLayout;