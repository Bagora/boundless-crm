'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { firestore } from '../lib/firebase';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';

const timeZones = {
  'UK': 'Europe/London',
  'US': 'America/New_York',
  'AUS': 'Australia/Sydney',
  'IND': 'Asia/Kolkata',
};

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState({ USD: 0, EUR: 0, GBP: 0 });
  const [todaysAmount, setTodaysAmount] = useState({
    charged: { USD: 0, EUR: 0, GBP: 0 },
    pending: { USD: 0, EUR: 0, GBP: 0 },
    cancel: { USD: 0, EUR: 0, GBP: 0 },
  });
  
  const [todaysContacts, setTodaysContacts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [times, setTimes] = useState({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchData();
      const unsubscribe = onSnapshot(collection(firestore, 'contacts'), fetchData); 
      return () => unsubscribe(); // Cleanup subscription on unmount
    }
  }, [user, router]);

  useEffect(() => {
    updateTimes();
    const interval = setInterval(updateTimes, 1000); // Update every second
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const fetchData = async () => {
    try {
      const amountSnapshot = await getDocs(collection(firestore, 'contacts'));
      const amountTotal = { USD: 0, EUR: 0, GBP: 0 };

      amountSnapshot.docs.forEach(doc => {
        const { amount, status } = doc.data();
        const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, "") || '0');
        if (!isNaN(parsedAmount) && status.toLowerCase() === 'charged') {
          // Accumulate totals by currency
          amountTotal.USD += amount.includes('$') ? parsedAmount : 0;
          amountTotal.EUR += amount.includes('€') ? parsedAmount : 0;
          amountTotal.GBP += amount.includes('£') ? parsedAmount : 0;
        }
      });
      
      setAmount(amountTotal);

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const contactsQuery = query(
        collection(firestore, 'contacts'),
        where('timestamp', '>=', format(startOfDay, 'dd/MM/yyyy HH:mm:ss')),
        where('timestamp', '<=', format(endOfDay, 'dd/MM/yyyy HH:mm:ss'))
      );

      const contactsSnapshot = await getDocs(contactsQuery);
      setTodaysContacts(contactsSnapshot.size);

      const todaysTotals = {
        charged: { USD: 0, EUR: 0, GBP: 0 },
        pending: { USD: 0, EUR: 0, GBP: 0 },
        cancel: { USD: 0, EUR: 0, GBP: 0 },
      };

      contactsSnapshot.docs.forEach(doc => {
        const { amount, status } = doc.data();
        const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, "") || '0');
        if (!isNaN(parsedAmount) && todaysTotals[status.toLowerCase()]) {
          // Accumulate today's amounts by status and currency
          todaysTotals[status.toLowerCase()].USD += amount.includes('$') ? parsedAmount : 0;
          todaysTotals[status.toLowerCase()].EUR += amount.includes('€') ? parsedAmount : 0;
          todaysTotals[status.toLowerCase()].GBP += amount.includes('£') ? parsedAmount : 0;
        }
      });

      setTodaysAmount(todaysTotals);

      const totalContactsSnapshot = await getDocs(collection(firestore, 'contacts'));
      setTotalContacts(totalContactsSnapshot.size);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateTimes = () => {
    const newTimes = {};
    for (const zone in timeZones) {
      const localTime = DateTime.now().setZone(timeZones[zone]);
      newTimes[zone] = localTime.toFormat('hh:mm:ss a'); // 12-hour format with AM/PM
    }
    setTimes(newTimes);
  };
  
  if (!user) {
    return null;
  }

  const cardVariants = {
    hidden: (direction) => ({
      opacity: 0.75,
      x: direction === 'left' ? 270 : direction === 'right' ? -45 : 0,
      y: direction === 'top' ? 240 : direction === 'bottom' ? 180 : 0,
      rotateY: 90,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotateY: 0,
      transition: { duration: 1.2 },
    },
    hover: {
      scale: 1.4,
      transition: { type: 'spring', stiffness: 550 },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-4xl p-4 font-bold mb-4">Boundless-CRM</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl p-4">
        <motion.div
          className="bg-gradient-to-r from-cyan-200 to-rose-300 p-6 rounded-lg shadow-3xl"
          variants={cardVariants}
          custom="left"
          initial="hidden"
          animate="visible"
          whileHover="hover"
          style={{ transformStyle: 'preserve-3d' }}
          key="front"
        >
          <h2 className="text-2xl font-bold mb-2">Total Amount</h2>
          <p className="text-xl">{`USD-$${amount.USD.toFixed(2)}`}</p>
          <p className="text-xl">{`EUR-€${amount.EUR.toFixed(2)}`}</p>
          <p className="text-xl">{`GBP-£${amount.GBP.toFixed(2)}`}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-cyan-200 to-rose-300 p-6 rounded-lg shadow-3xl"
          variants={cardVariants}
          custom="right"
          initial="hidden"
          animate="visible"
          whileHover="hover"
          style={{ transformStyle: 'preserve-3d' }}
          key="front"
        >
          <h2 className="text-2xl font-bold mb-2">Today's Amount</h2>
          <p className="text-lg">Charged: {`$${todaysAmount.charged.USD.toFixed(2)}, €${todaysAmount.charged.EUR.toFixed(2)}, £${todaysAmount.charged.GBP.toFixed(2)}`}</p>
          <p className="text-lg">Pending: {`$${todaysAmount.pending.USD.toFixed(2)}, €${todaysAmount.pending.EUR.toFixed(2)}, £${todaysAmount.pending.GBP.toFixed(2)}`}</p>
          <p className="text-lg">Cancel: {`$${todaysAmount.cancel.USD.toFixed(2)}, €${todaysAmount.cancel.EUR.toFixed(2)}, £${todaysAmount.cancel.GBP.toFixed(2)}`}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-cyan-200 to-rose-300 p-6 rounded-lg shadow-3xl"
          variants={cardVariants}
          custom="top"
          initial="hidden"
          animate="visible"
          whileHover="hover"
          style={{ transformStyle: 'preserve-3d' }}
          key="front"
        >
          <h2 className="text-2xl font-bold mb-2">Total Contacts</h2>
          <p className="text-xl">{totalContacts}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-cyan-200 to-rose-300 p-6 rounded-lg shadow-3xl"
          variants={cardVariants}
          custom="bottom"
          initial="hidden"
          animate="visible"
          whileHover="hover"
          style={{ transformStyle: 'preserve-3d' }}
          key="front"
        >
          <h2 className="text-2xl font-bold mb-2">Today's Contacts</h2>
          <p className="text-xl">{todaysContacts}</p>
        </motion.div>
      </div>
      <div className="mb-8 mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.keys(times).map((zone) => (
          <motion.div
            key={zone}
            className="bg-gradient-to-r from-cyan-200 to-rose-300 p-6 rounded-lg shadow-3xl"
            variants={cardVariants}
            custom="bottom"
            initial="hidden"
            animate="visible"
            whileHover="hover"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2 className="text-2xl font-bold mb-2">{zone}</h2>
            <p className="text-xl">{times[zone]}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
