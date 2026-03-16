import React, {useState} from "react";

export default function TableDocuments(){

  const [rows,setRows] = useState([
    {
      type:"Carte de Sejour",
      numero:"9926029750",
      organisme:"Préfecture",
      date:"19/01/2026"
    }
  ]);

  const addRow = ()=>{

    setRows([
      ...rows,
      {
        type:"",
        numero:"",
        organisme:"",
        date:""
      }
    ]);

  };

  const deleteRow = (index)=>{

    const newRows = rows.filter((row,i)=> i !== index);
    setRows(newRows);

  };

  return(

    <div className="table-container">

      <div className="table-actions">

        <button onClick={addRow}>➕</button>
        <button>📊</button>
        <button>📄</button>

      </div>

      <table>

        <thead>
          <tr>
            <th>Type document</th>
            <th>Numéro</th>
            <th>Organisme</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          {rows.map((row,index)=>(

            <tr key={index}>

              <td>{row.type}</td>
              <td>{row.numero}</td>
              <td>{row.organisme}</td>
              <td>{row.date}</td>

              <td>
                <button onClick={()=>deleteRow(index)}>
                  ❌
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
