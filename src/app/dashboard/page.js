'use client';

import { useState, useEffect } from 'react';
import { firestore } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage, setContactsPerPage] = useState(10);
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchContacts = async () => {
      const contactsCollection = collection(firestore, 'contacts');
      const contactSnapshot = await getDocs(contactsCollection);
      let contactList = contactSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort contacts by timestamp (assuming it's in dd/mm/yyyy hh:mm:ss AM/PM format)
      contactList.sort((a, b) => {
        const aTimestamp = parseDate(a.timestamp);
        const bTimestamp = parseDate(b.timestamp);
        return bTimestamp - aTimestamp; // Sort in descending order
      });

      // Filter contacts by selected month
      if (filterMonth) {
        contactList = contactList.filter((contact) => {
          const contactDate = parseDate(contact.timestamp);
          const contactMonth = contactDate.toLocaleString('default', { month: 'long' });
          return contactMonth === filterMonth;
        });
      }

      setContacts(contactList);
    };

    fetchContacts();
  }, [user, router, filterMonth]);

  const parseDate = (dateString) => {
    // Assuming the format is dd/mm/yyyy hh:mm:ss AM/PM
    const [datePart, timePart, period] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    let [hours, minutes, seconds] = timePart.split(':').map(Number);

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const formatDate = (date) => {
    // Format the date into dd/mm/yyyy hh:mm:ss AM/PM
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${period}`;
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.id.includes(search) ||
      contact.agentname.toLowerCase().includes(search.toLowerCase()) ||
      contact.customername.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone.includes(search) ||
      contact.homephone.includes(search) ||
      contact.email.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

  const handleViewContact = (id) => {
    router.push(`/contacts/${id}`);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 100) {
      setContactsPerPage(value);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 p-10 px-4 py-8">
      <div className="bg-white p-8 mt-8 rounded-3xl shadow-3xl min-h-screen max-w-7xl py-6 w-full">
        <h1 className="text-5xl mt-2 mb-8 text-center text-gray-800">Dashboard</h1>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Customer ID, Customer Name, Customer Email, Customer Phone & homephone or Agent Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 mt-2 mb-8 w-full rounded-3xl shadow-3xl focus:outline-none focus:ring-2 focus:ring-indigo-900"
          />
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <label className="mr-2">Contacts per page:</label>
            <input
              type="number"
              value={contactsPerPage}
              onChange={handlePerPageChange}
              min="1"
              max="100"
              className="border p-2 rounded-3xl w-20"
            />
          </div>
          <div>
            <label className="mr-2">Filter by Month:</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border p-2 rounded-3xl"
            >
              <option value="">All</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow-3xl">
            <thead className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black">
              <tr>
                <th className="py-3 px-4 border-b">Customer ID</th>
                <th className="py-3 px-4 border-b">Customer Name</th>
                <th className="py-3 px-4 border-b">Date</th>
                <th className="py-3 px-4 border-b">Amount</th>
                <th className="py-3 px-4 border-b">Status</th>
                <th className="py-3 px-4 border-b">Agent Name</th>
                <th className="py-3 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentContacts.map((contact) => (
                <tr key={contact.id} className="text-center">
                  <td className="py-3 px-4 border-b">{contact.id}</td>
                  <td className="py-3 px-4 border-b">{contact.customername}</td>
                  <td className="py-3 px-4 border-b">{formatDate(parseDate(contact.timestamp))}</td>
                  <td className="py-3 px-4 border-b">{contact.amount}</td>
                  <td className="py-3 px-4 border-b">{contact.status}</td>
                  <td className="py-3 px-4 border-b">{contact.agentname}</td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => handleViewContact(contact.id)}
                      className="bg-gradient-to-r from-indigo-300 via-purple-400 to-rose-600 text-black px-4 py-2 rounded-3xl shadow-3xl
                      hover:from-rose-500 hover:to-orange-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gradient-to-r from-indigo-200 via-purple-400 to-rose-600 text-black px-6 py-2 rounded-3xl shadow-3xl hover:from-rose-500 hover:to-orange-300"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastContact >= filteredContacts.length}
            className="bg-gradient-to-r from-indigo-200 via-purple-400 to-rose-600 text-black px-6 py-2 rounded-3xl shadow-3xl hover:from-rose-500 hover:to-orange-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
