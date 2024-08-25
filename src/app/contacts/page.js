'use client';

import { useState, useEffect } from 'react';
import { firestore, storage } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Contacts = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [newContact, setNewContact] = useState({
    customername: '',
    email: '',
    phone: '',
    homephone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    dob: '',
    cardnumber: '',
    cardexp: '',
    nameoncard: '',
    cardCvv: '',
    bankDetails: '',
    productname: '',
    currency:'',
    amount: '', 
    status: '',
    planType: '',
    gatewayname: '',
    sessionid: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);


  // Function to generate a unique ID for the contact
  const generateUniqueID = async () => {
    const idDocRef = doc(firestore, 'counters', 'contactId'); // Document to store the last ID

    const newId = await runTransaction(firestore, async (transaction) => {
      const idDocSnap = await transaction.get(idDocRef);

      let newId;
      if (idDocSnap.exists()) {
        const lastId = idDocSnap.data().lastId;
        const currentSeries = parseInt(lastId.split('-')[1], 10) + 1;
        newId = `${newContact.country}${new Date().getFullYear().toString().slice(-2)}-${currentSeries}`;

        transaction.update(idDocRef, { lastId: newId }); // Update the last ID in Firestore
      } else {
        newId = `${newContact.country}${new Date().getFullYear().toString().slice(-2)}-1101`;
        transaction.set(idDocRef, { lastId: newId }); // Initialize with starting ID
      }
      return newId;
    });

    return newId;
  };

  // Function to format the current timestamp
  const formatTimestamp = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${period}`;
  };

  // Main function to handle adding a contact
  const handleAddContact = async () => {
    // State to track submission status
    if (isSubmitting) return; // Prevents multiple submissions
  
    setIsSubmitting(true);
  
    // Check if any fields in newContact are empty
    if (Object.values(newContact).some((value) => value === '')) {
      alert('All fields are required!');
      setIsSubmitting(false); // Re-enable the button if there's an error
      return;
    }
  
    try {
      // Fetch agent's fullname from Firestore
      const profileDocRef = doc(firestore, 'users', user.uid);
      const profileDocSnap = await getDoc(profileDocRef);
      const agentFullName = profileDocSnap.exists() ? profileDocSnap.data().fullname : 'Unknown Agent';
  
      // Add agent's name to the contact and generate a unique ID
      const contactID = await generateUniqueID();
      const updatedContact = {
        ...newContact,
        agentname: agentFullName, // Use the fetched fullname
        id: contactID,
        amount: `${newContact.currency}${newContact.amount}`,
        timestamp: formatTimestamp(), // Set timestamp
      };
  
      // If a file is selected, upload it and add the file URL to the contact
      if (file) {
        const fileRef = ref(storage, `uploads/${updatedContact.id}_${file.name}`);
        await uploadBytes(fileRef, file);
        const fileURL = await getDownloadURL(fileRef);
        updatedContact.fileURL = fileURL;
      }
  
      // Add the contact to Firestore
      await setDoc(doc(firestore, 'contacts', contactID), updatedContact);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the process is complete
    }
  };
  

  // Function to handle changes in the card number input
  const handleCardNumberChange = (e) => {
    let cardNumber = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    if (cardNumber.length > 20) {
      cardNumber = cardNumber.slice(0, 20); // Limit the card number to 20 digits
    }
    cardNumber = cardNumber.match(/.{1,4}/g)?.join('-') || ''; // Format the card number in groups of four
    setNewContact({ ...newContact, cardnumber: cardNumber });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 p-10 px-4 bg-slate-200 py-8">
      <div className="bg-white p-8 mt-8 rounded-3xl shadow-3xl min-h-screen max-w-7xl py-6 w-full">
          <h1 className="text-5xl mt-2 mb-8 text-center">Add Contact</h1>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={newContact.customername}
              onChange={(e) => setNewContact({ ...newContact, customername: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Home Phone"
              value={newContact.homephone}
              onChange={(e) => setNewContact({ ...newContact, homephone: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="DOB: DD/MM/YYYY"
              value={newContact.dob}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 8) {
                  value = value.slice(0, 8);
                }
                if (value.length > 4) {
                  value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
                } else if (value.length > 2) {
                  value = `${value.slice(0, 2)}/${value.slice(2)}`;
                }
                setNewContact({ ...newContact, dob: value });
              }}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={newContact.address}
              onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={newContact.city}
              onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={newContact.state}
              onChange={(e) => setNewContact({ ...newContact, state: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Postcode"
              value={newContact.postcode}
              onChange={(e) => setNewContact({ ...newContact, postcode: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <select
              value={newContact.country}
              onChange={(e) => setNewContact({ ...newContact, country: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            >
              <option value="" disabled>Select Country</option>
              <option value="UK">UK</option>
              <option value="US">US</option>
              <option value="AUS">AUS</option>
            </select>
            <input
              type="text"
              placeholder="Card Number"
              value={newContact.cardnumber}
              onChange={handleCardNumberChange}
              className="border p-2 mb-2 w-full rounded"
              required
              maxLength="24"
            />
            <input
              type="text"
              placeholder="Card Expiry Date: MM/YYYY"
              value={newContact.cardexp}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2);
                }
                if (value.length > 7) {
                  value = value.slice(0, 7);
                }
                setNewContact({ ...newContact, cardexp: value });
              }}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Card CVV"
              value={newContact.cardCvv}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 4) {
                  value = value.slice(0, 4);
                }
                setNewContact({ ...newContact, cardCvv: value });
              }}
              className="border p-2 mb-2 w-full rounded"
              required
              maxLength="4"
            />
            <input
              type="text"
              placeholder="Name on Card"
              value={newContact.nameoncard}
              onChange={(e) => setNewContact({ ...newContact, nameoncard: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Bank Details"
              value={newContact.bankDetails}
              onChange={(e) => setNewContact({ ...newContact, bankDetails: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Product Name"
              value={newContact.productname}
              onChange={(e) => setNewContact({ ...newContact, productname: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
             <select
              value={newContact.currency}
              onChange={(e) => setNewContact({ ...newContact, currency: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            >
              <option value="" disabled>Select Currency</option>
              <option value="$">$</option>
              <option value="€">€</option>
              <option value="£">£</option>
            </select>
            <input
              type="text"
              placeholder="Amount"
              value={newContact.amount}
              onChange={(e) => setNewContact({ ...newContact, amount: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <select
              value={newContact.status}
              onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            >
              <option value="" disabled>Select Status</option>
              <option value="Charged">Charged</option>
              <option value="Pending">Pending</option>
              <option value="Cancel">Cancel</option>
              <option value="Decline By Customer">Decline By Customer</option>
              <option value="Card Decline">Card Decline</option>
              <option value="Installment">Installment</option>
            </select>
            <select
              value={newContact.planType}
              onChange={(e) => setNewContact({ ...newContact, planType: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            >
              <option value="" disabled>Select Validity</option>
              <option value="1Year">1 Year</option>
              <option value="2Year">2 Year</option>
              <option value="3Year">3 Year</option>
              <option value="5Year">5 Year</option>
              <option value="Lifetime">Lifetime</option>
            </select>
            <input
              type="text"
              placeholder="Gateway Name"
              value={newContact.gatewayname}
              onChange={(e) => setNewContact({ ...newContact, gatewayname: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Session ID"
              value={newContact.sessionid}
              onChange={(e) => setNewContact({ ...newContact, sessionid: e.target.value })}
              className="border p-2 mb-2 w-full rounded"
              required
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2 mb-2 w-full rounded"
            />
          </div>
          <button
            onClick={handleAddContact}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-200 via-purple-400 to-rose-600 text-black px-6 py-2 rounded-3xl shadow-3xl w-full hover:from-rose-500 hover:to-orange-300"
          >
            {isSubmitting ? 'Adding...' : 'Add Contact'}
          </button>
        </div>
      </div>
  );
};

export default Contacts;
