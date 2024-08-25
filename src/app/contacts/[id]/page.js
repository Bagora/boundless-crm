"use client";

import { useState, useEffect } from "react";
import { firestore, storage } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, setDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";

function maskSensitiveInfo(value, type) {
  if (!value) return "";

  switch (type) {
    case "cardnumber":
      return value.slice(0, -4).replace(/\d/g, "*") + value.slice(-4);
    case "cardexp":
      return value.length === 7 ? `${value[0]}*${value[2]}` : "****";
    case "cvv":
      return value.length === 4 ? `${value[0]}*${value[2]}` : "****";
    case "bankDetails":
      return value.slice(0, -4).replace(/./g, "****") + value.slice(-4);
    default:
      return value;
  }
}

const formatDate = (timestamp) => {
  if (timestamp && timestamp.toDate) {
    return format(timestamp.toDate(), "dd/MM/yyyy hh:mm:ss a");
  }
  return "";
};

const ContactDetails = ({ params }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [contact, setContact] = useState({
    customername: "",
    id: "",
    Country:"",
    timestamp: "",
    email: "",
    phone: "",
    homephone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    dob: "",
    cardnumber: "",
    cardexp: "",
    nameoncard: "",
    cardCvv: "",
    bankDetails: "",
    productname: "",
    amount: "",
    status: "",
    planType: "",
    gatewayname: "",
    sessionid: "",
    agentname: "",
    fileURL: "",
  });

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [file, setFile] = useState(null);
  const [userRole, setUserRole] = useState("");


  const fetchNotes = async () => {
    const notesCollection = collection(firestore, "notes");
    const notesSnapshot = await getDocs(notesCollection);
    const notesList = notesSnapshot.docs
      .filter((doc) => doc.data().contactId === params.id)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: formatDate(doc.data().timestamp),
      }));
    setNotes(notesList);
  };


  const fetchUserRole = async () => {
    try {
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserRole(docSnap.data().role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchContact = async () => {
      const docRef = doc(firestore, "contacts", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setContact({
          ...docSnap.data(),
          date: formatDate(docSnap.data().date),
        });
      } else {
        console.log("No such document!");
      }
    };

    fetchContact();
    fetchNotes();
    fetchUserRole();
  }, [params.id, user, router]);

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    if (userRole !== "admin") return;

    try {
      await setDoc(doc(firestore, "contacts", params.id), contact);
      router.reload();
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleAddNote = async () => {
    if (!note && !file) return;
  
    // Disable the add note button to prevent multiple submissions
    setIsAddingNote(true);
  
    try {
      const profileDocRef = doc(firestore, "users", user.uid);
      const profileDocSnap = await getDoc(profileDocRef);
      const agentFullName = profileDocSnap.exists()
        ? profileDocSnap.data().fullname
        : "Unknown Agent";
  
      let fileURL = "";
      if (file) {
        const fileRef = ref(storage, `notes/${params.id}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }
  
      const newNoteId = `${params.id}-${new Date().getTime()}`;
      const newNote = {
        contactId: params.id,
        note,
        imagelink: fileURL,
        creatorName: agentFullName,
        timestamp: new Date(),
      };
  
      await setDoc(doc(firestore, "notes", newNoteId), newNote);
  
      // Clear the input fields after successful addition
      setNote("");
      setFile(null);
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      // Re-enable the add note button after the operation is complete
      setIsAddingNote(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 p-10 px-4 bg-slate-200 py-8">
      <div className="bg-white p-8 mt-8 rounded-3xl shadow-3xl min-h-screen max-w-7xl py-6 w-full">
        <h1 className="text-5xl mt-2 mb-8 text-center">Contact Details</h1>
        <form
          onSubmit={handleUpdateContact}
          className="grid grid-cols-2 gap-4 mb-4"
        >
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Customer Name
            </label>
            <input
              type="text"
              value={contact.customername}
              onChange={(e) =>
                setContact({ ...contact, customername: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Customer ID
            </label>
            <input
              type="text"
              value={contact.id}
              onChange={(e) => setContact({ ...contact, id: e.target.value })}
              readOnly
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Time-Stamp
            </label>
            <input
              type="text"
              value={contact.timestamp}
              readOnly
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Phone</label>
            <input
              type="text"
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Home Phone
            </label>
            <input
              type="text"
              value={contact.homephone}
              onChange={(e) =>
                setContact({ ...contact, homephone: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Address
            </label>
            <input
              type="text"
              value={contact.address}
              onChange={(e) =>
                setContact({ ...contact, address: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">City</label>
            <input
              type="text"
              value={contact.city}
              onChange={(e) => setContact({ ...contact, city: e.target.value })}
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">State</label>
            <input
              type="text"
              value={contact.state}
              onChange={(e) =>
                setContact({ ...contact, state: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Postcode
            </label>
            <input
              type="text"
              value={contact.postcode}
              onChange={(e) =>
                setContact({ ...contact, postcode: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Date of Birth
            </label>
            <input
              type="text"
              value={contact.dob}
              onChange={(e) => setContact({ ...contact, dob: e.target.value })}
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={
                userRole === "admin"
                  ? contact.cardnumber
                  : maskSensitiveInfo(contact.cardnumber, "cardnumber")
              }
              onChange={(e) =>
                setContact({ ...contact, cardnumber: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Card Expiry
            </label>
            <input
              type="text"
              value={
                userRole === "admin"
                  ? contact.cardexp
                  : maskSensitiveInfo(contact.cardexp, "cardexp")
              }
              onChange={(e) =>
                setContact({ ...contact, cardexp: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Name on Card
            </label>
            <input
              type="text"
              value={contact.nameoncard}
              onChange={(e) =>
                setContact({ ...contact, nameoncard: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Card CVV
            </label>
            <input
              type="text"
              value={
                userRole === "admin"
                  ? contact.cardCvv
                  : maskSensitiveInfo(contact.cardCvv, "cvv")
              }
              onChange={(e) =>
                setContact({ ...contact, cardCvv: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Bank Details
            </label>
            <input
              type="text"
              value={
                userRole === "admin"
                  ? contact.bankDetails
                  : maskSensitiveInfo(contact.bankDetails, "bankDetails")
              }
              onChange={(e) =>
                setContact({ ...contact, bankDetails: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={contact.productname}
              onChange={(e) =>
                setContact({ ...contact, productname: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Amount</label>
            <input
              type="text"
              value={contact.amount}
              onChange={(e) =>
                setContact({ ...contact, amount: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Status</label>
            {userRole === "admin" ? (
              <select
                value={contact.status}
                onChange={(e) =>
                  setContact({ ...contact, status: e.target.value })
                }
                className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="Charged">Charged</option>
                <option value="Pending">Pending</option>
                <option value="Cancel">Cancel</option>
                <option value="Chargeback">Chargeback</option>
                <option value="Partial Return">Partial Return</option>
                <option value="Refund">Refund</option>
                <option value="Decline By Customer">Decline By Customer</option>
                <option value="Card Decline">Card Decline</option>
                <option value="Installment">Installment</option>
              </select>
            ) : (
              <input
                type="text"
                value={contact.status}
                readOnly
                className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
              />
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Plan Type
            </label>
            <input
              type="text"
              value={contact.planType}
              onChange={(e) =>
                setContact({ ...contact, planType: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Gateway Name
            </label>
            <input
              type="text"
              value={contact.gatewayname}
              onChange={(e) =>
                setContact({ ...contact, gatewayname: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Session ID
            </label>
            <input
              type="text"
              value={contact.sessionid}
              onChange={(e) =>
                setContact({ ...contact, sessionid: e.target.value })
              }
              readOnly={userRole !== "admin"}
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Agent Name
            </label>
            <input
              type="text"
              value={contact.agentname}
              readOnly
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Document FileURL{" "}
            </label>
            <input
              type="text"
              value={contact.fileURL}
              readOnly
              className="border p-3 text-xl rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
            />
          </div>
          <div className="col-span-2">
            {userRole === "admin" && (
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-200 via-purple-400 to-rose-600 text-black px-6 py-2 rounded-3xl shadow-3xl hover:from-rose-500 hover:to-orange-300"
              >
                Update Contact
              </button>
            )}
          </div>
        </form>
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Notes</h2>
          <div className="mb-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border p-3 rounded w-full bg-gradient-to-r from-cyan-200 to-rose-300"
              placeholder="Add a note"
            />
            <input
              type="file"
              accept=".jpeg,.png,.doc,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2 mb-2 w-full rounded"
            />
            <button
              onClick={handleAddNote}
              disabled={isAddingNote}
              className="bg-gradient-to-r from-indigo-200 via-purple-400 to-rose-600 text-black px-6 py-2 rounded-3xl shadow-3xl hover:from-rose-500 hover:to-orange-300"
            >
              {isAddingNote ? "Adding Note..." : "Add Note"}
            </button>
          </div>
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-gradient-to-r from-cyan-200 to-rose-300 p-4 rounded-3xl shadow-3xl break-words"
              >
                <p className="text-gray-700">
                  <strong>Note:</strong> {note.note}
                </p>
                {note.imagelink && (
                  <p className="text-gray-700">
                    <strong>Attached File:</strong>{" "}
                    <a
                      href={note.imagelink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  </p>
                )}
                <p className="text-gray-700">
                  <strong>Creator:</strong> {note.creatorName}
                </p>
                <p className="text-gray-700">
                  <strong>Timestamp:</strong> {note.timestamp}
                </p>
              </div>
            ))}
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
