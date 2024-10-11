import React, { useState, useEffect } from 'react';
import { ref, get, update, set } from "firebase/database";
import { realtimeDb, auth } from '../../../firebase'; // Import your Firebase config and Realtime DB
import { Table, Button, Spinner } from 'react-bootstrap'; // Import necessary components from react-bootstrap

const UpdatePush = ({ language }) => {
  const [data, setData] = useState([]); // Store fetched data
  const [loading, setLoading] = useState(true); // Loading state for data
  const [error, setError] = useState(null); // Error state
  const [selectedItems, setSelectedItems] = useState([]); // Store selected item IDs
  const [buttonLoading, setButtonLoading] = useState(false); // Loading state for button

  // Fetch data function defined here
  const fetchData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const sanitizedEmail = user.email.replace(/\./g, '_');
        const dataRef = ref(realtimeDb, `/adminUpdateCollection/${sanitizedEmail}/approvedContributions/`);
        const snapshot = await get(dataRef);
        if (snapshot.exists()) {
          const contributions = [];
          snapshot.forEach(childSnapshot => {
            const item = { id: childSnapshot.key, ...childSnapshot.val() };
            if (item.status === "") { // Only include items with empty status
              contributions.push(item);
            }
          });
          setData(contributions);
        } else {
          console.log("No data available");
          setData([]);
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(); // Call fetchData on component mount
  }, []);

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all items
      const allItemIds = data.map(item => item.id);
      setSelectedItems(allItemIds);
    } else {
      // Deselect all items
      setSelectedItems([]);
    }
  };

  const handleLogAndUpdateSelectedItems = async () => {
    setButtonLoading(true); // Start button loading
    const translations = selectedItems.map(itemId => {
      const item = data.find(item => item.id === itemId);
      return {
        tagalog: item.input_main || 'N/A', // Extract "main" field (Tagalog)
        bikol: item.contributed_text || 'N/A' // Extract "contributed_text" field (Bikol)
      };
    });

    // Get the formatted timestamp
    const timestamp = new Date();
    const formattedTimestamp = `${timestamp.getFullYear()}${(timestamp.getMonth() + 1).toString().padStart(2, '0')}${timestamp.getDate().toString().padStart(2, '0')}T${timestamp.getHours().toString().padStart(2, '0')}${timestamp.getMinutes().toString().padStart(2, '0')}${timestamp.getSeconds().toString().padStart(2, '0')}`;

    // Create the collection string
    const collectionString = `{'dialect': '${language}', 'translations': [${translations.map(t => `{'tagalog': '${t.tagalog}', 'bikol': '${t.bikol}'}`).join(', ')}]}`;

    // Prepare the output
    const output = {
      timestamp: formattedTimestamp, // This will serve as the ID
      collection: collectionString, // This contains the dialect and translations
      language: language // Add the language value
    };

    console.log(output); // Log the output object

    const user = auth.currentUser;
    if (user) {
      const sanitizedEmail = user.email.replace(/\./g, '_');

      // Update the status of selected items in the database
      for (const itemId of selectedItems) {
        const itemRef = ref(realtimeDb, `/adminUpdateCollection/${sanitizedEmail}/approvedContributions/${itemId}`);
        await update(itemRef, { status: "updated" }); // Update the status to "updated"
      }
      console.log("Status updated to 'updated' for selected items.");

      // Store the output in /historyUpdates using formatted timestamp as ID
      const historyRef = ref(realtimeDb, `/historyUpdates/${sanitizedEmail}/${formattedTimestamp}`); // Use timestamp as the ID
      await set(historyRef, output); // Store the structured output
      console.log("Selected items stored in /historyUpdates");
    }

    setSelectedItems([]); // Clear selected items after update
    fetchData(); // Refresh data to remove updated contributions
    setButtonLoading(false); // Stop button loading after action
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>User Contributions</h1>
      {data.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={selectedItems.length === data.length} // Check if all are selected
                  aria-label="Select all contributions" 
                />
              </th>
              <th>Tagalog</th>
              <th>Bikol</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.id)} 
                    onChange={() => handleSelectItem(item.id)} 
                  />
                </td>
                <td>{item.input_main}</td>
                <td>{item.contributed_text}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No contributions found</p>
      )}
      <Button 
        onClick={handleLogAndUpdateSelectedItems} 
        disabled={selectedItems.length === 0} // Disable if no items selected
      >
        {buttonLoading ? <Spinner as="span" animation="border" size="sm" /> : "Update Selected"}
      </Button>
    </div>
  );
};

export default UpdatePush;
