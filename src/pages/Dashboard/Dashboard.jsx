import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase';  
import { Shimmer } from 'react-shimmer'; 
import * as XLSX from 'xlsx'; 
import './Dashboard.css'; 
import UserCount from '../../components/UserCount/UserCount';

const languagePairs = [

  
  "Cam Norte-Filipino",
  "Cam Norte-English",
  "Cam Norte-Daraga", 


  "Cam Norte-Filipino",
  "Cam Norte-English",
  "Cam Norte-Daraga",

  "Daraga-English",
  "Daraga-Filipino",
  "Daraga-Cam Norte",


  "English-Filipino",
  "English-Daraga",
  "English-Cam Norte",

  "Filipino-Daraga",
  "Filipino-English",
  "Filipino-English",
  "Filipino-Cam Norte"

];

const FIXED_ROWS = 10; 

const Dashboard = () => {
  const [contributions, setContributions] = useState([]);
  const [selectedLanguagePair, setSelectedLanguagePair] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ approved: 'all', verified: 'all' });

  const fetchContributions = async (languagePair) => {
    setLoading(true);
    setContributions([]); 
    try {
      const contributionsRef = collection(db, "translations", languagePair, "contributions");
      const contributionsSnapshot = await getDocs(contributionsRef);  

      const contributionsData = contributionsSnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data() 
      }));
      
      setContributions(contributionsData); 
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false); 
    }
  };

  const handleLanguageChange = (e) => {
    const selectedPair = e.target.value;
    setSelectedLanguagePair(selectedPair);
    if (selectedPair) {
      fetchContributions(selectedPair);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
  };

  const handleApprove = async (contributionId) => {
    try {
      const contributionDocRef = doc(db, "translations", selectedLanguagePair, "contributions", contributionId);
      await updateDoc(contributionDocRef, { approved: true });
      setContributions(prevContributions => 
        prevContributions.map(contribution =>
          contribution.id === contributionId ? { ...contribution, approved: true } : contribution
        )
      );
    } catch (error) {
      console.error("Error approving contribution:", error);
    }
  };

  const filteredContributions = contributions.filter(contribution => {
    const approvedFilter = filter.approved === 'all' || (filter.approved === 'yes' && contribution.approved) || (filter.approved === 'no' && !contribution.approved);
    const verifiedFilter = filter.verified === 'all' || (filter.verified === 'yes' && contribution.verified) || (filter.verified === 'no' && !contribution.verified);
    return approvedFilter && verifiedFilter;
  });

  const displayRows = [...Array(FIXED_ROWS).fill({})];
  filteredContributions.forEach((contribution, index) => {
    if (index < FIXED_ROWS) {
      displayRows[index] = contribution;
    }
  });

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
  };

  const handleExportTable = () => {
    exportToExcel(filteredContributions, 'contributions.xlsx');
  };

  const handleExportML = () => {
    const mlData = filteredContributions.map(({ input_main, contributed_text }) => ({
      input_main,
      contributed_text
    }));
    exportToExcel(mlData, 'ml_data.xlsx');
  };

  return (

    
    <div className="dashboard-container">
      {/* <UserCount/> */}

      <h1>Select a Language Pair</h1>

      <select className="dropdown" onChange={handleLanguageChange} value={selectedLanguagePair}>
        <option value="">-- Select Language Pair --</option>
        {languagePairs.map((pair) => (
          <option key={pair} value={pair}>
            {pair}
          </option>
        ))}
      </select>

      <div className="filter-container">
        <h2>Filter Contributions</h2>
        <div className="filter-group">
          <label>
            <input
              type="radio"
              name="approved"
              value="all"
              checked={filter.approved === 'all'}
              onChange={handleFilterChange}
            />
            All Approved and Not Approved
          </label>
          <label>
            <input
              type="radio"
              name="approved"
              value="yes"
              checked={filter.approved === 'yes'}
              onChange={handleFilterChange}
            />
            Approved Only
          </label>
          <label>
            <input
              type="radio"
              name="approved"
              value="no"
              checked={filter.approved === 'no'}
              onChange={handleFilterChange}
            />
            Not Approved Only
          </label>
        </div>
        <div className="filter-group">
          <label>
            <input
              type="radio"
              name="verified"
              value="all"
              checked={filter.verified === 'all'}
              onChange={handleFilterChange}
            />
            All Verified and Not Verified
          </label>
          <label>
            <input
              type="radio"
              name="verified"
              value="yes"
              checked={filter.verified === 'yes'}
              onChange={handleFilterChange}
            />
            Verified Only
          </label>
          <label>
            <input
              type="radio"
              name="verified"
              value="no"
              checked={filter.verified === 'no'}
              onChange={handleFilterChange}
            />
            Not Verified Only
          </label>
        </div>
      </div>

      <h2>Selected Language Pair: {selectedLanguagePair}</h2>

      <div className="export-buttons">
        <button onClick={handleExportTable}>Export Table to Excel</button>
        <button onClick={handleExportML}>Export for ML (input_main & contributed_text)</button>
      </div>

      {loading ? (
        <Shimmer>
          <div className="table-container">
            <table className="contribution-table">
              <thead>
                <tr>
                  <th>Input Main</th>
                  <th>Output Main</th>
                  <th>Contributed Text</th>
                  <th>Description</th>
                  <th>Approved</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(FIXED_ROWS)].map((_, index) => (
                  <tr key={index}>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Shimmer>
      ) : (
        <div className="table-container">
          {filteredContributions.length > 0 ? (
            <table className="contribution-table">
              <thead>
                <tr>
                  <th>Input Main</th>
                  <th>Output Main</th>
                  <th>Contributed Text</th>
                  <th>Description</th>
                  <th>Approved</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.input_main || ''}</td>
                    <td>{row.output_main || ''}</td>
                    <td>{row.contributed_text || ''}</td>
                    <td>{row.description || ''}</td>
                    <td>
                      {row.approved === true ? (
                        "Yes"
                      ) : row.approved === false ? (
                        <>
                          No{" "}
                          <button onClick={() => handleApprove(row.id)}>Approve</button>
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                    <td>{row.verified === true ? "Yes" : row.verified === false ? "No" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : !loading && selectedLanguagePair ? (
            <p>No contributions found for this language pair.</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
